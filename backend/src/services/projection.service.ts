import prisma from '../utils/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Service de projection / autofill.
 *
 * - buildProjectionDraft : pré-remplit une matrice de bulletin (matières + coefficients)
 *   à partir des bulletins existants (le plus récent fait foi pour les coefficients).
 * - autofillFromTarget   : étant donné une moyenne générale cible, génère des notes
 *   par matière qui sont (a) cohérentes avec l'historique de l'élève et
 *   (b) telles que la moyenne pondérée tombe exactement sur la cible.
 */

function toNumber(d: Prisma.Decimal | number | null | undefined): number | null {
  if (d === null || d === undefined) return null;
  if (typeof d === 'number') return d;
  return Number(d.toString());
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min = 0, max = 20): number {
  return Math.max(min, Math.min(max, n));
}

const autofillSchema = z.object({
  targetAverage: z.union([z.number(), z.string()])
    .transform(v => Number(v))
    .refine(n => !Number.isNaN(n) && n >= 0 && n <= 20, 'Moyenne cible entre 0 et 20'),
  schoolYear: z.string().regex(/^\d{4}\/\d{4}$/),
  trimester: z.number().int().min(1).max(3),
  variance: z.number().min(0).max(5).default(1.2), // amplitude du jitter par note
});

type HistoricalSubject = {
  name: string;
  coefficient: number;
  averages: number[]; // moyennes historiques pour cette matière (un par trimestre passé)
  // notes par type (chacune = liste des valeurs sur les trimestres passés)
  oral: number[];
  tp: number[];
  examenEcrit: number[];
  dc1: number[];
  dc2: number[];
  devoirSynthese: number[];
  exempted: boolean;
};

export class ProjectionService {
  /**
   * Construit la matrice "vide" du prochain bulletin :
   * - reprend toutes les matières du bulletin le plus récent (mêmes coefficients)
   * - notes vides
   */
  async buildProjectionDraft(userId: string, schoolYear: string, trimester: number) {
    const sourceBulletin = await prisma.bulletin.findFirst({
      where: {
        userId,
        isProjection: false,
        OR: [
          { schoolYear, trimester: { lt: trimester } },
          { schoolYear: { lt: schoolYear } },
        ],
      },
      orderBy: [{ schoolYear: 'desc' }, { trimester: 'desc' }],
      include: { subjects: { orderBy: { order: 'asc' } } },
    });

    if (!sourceBulletin) {
      return {
        schoolYear,
        trimester,
        className: null,
        classSize: null,
        rank: null,
        isProjection: true,
        subjects: [],
        notice: 'Aucun bulletin précédent — créez d\'abord un bulletin réel pour démarrer une projection.',
      };
    }

    return {
      schoolYear,
      trimester,
      className: sourceBulletin.className,
      classSize: sourceBulletin.classSize,
      rank: null,
      isProjection: true,
      subjects: sourceBulletin.subjects.map(s => ({
        name: s.name,
        subjectId: s.subjectId,
        coefficient: toNumber(s.coefficient) ?? 0,
        order: s.order,
        oral: null,
        tp: null,
        examenEcrit: null,
        dc1: null,
        dc2: null,
        devoirSynthese: null,
        moyenne: null,
        rank: null,
        exempted: s.exempted,
        teacherNote: null,
      })),
    };
  }

  /**
   * Autofill : génère un bulletin complet (matières + notes) atteignant la moyenne cible,
   * basé sur les patterns historiques de l'élève.
   */
  async autofillFromTarget(userId: string, payload: unknown) {
    const { targetAverage, schoolYear, trimester, variance } = autofillSchema.parse(payload);

    // 1. Collecter l'historique (tous les bulletins réels antérieurs au trimestre demandé)
    const history = await this.collectHistory(userId, schoolYear, trimester);

    if (history.length === 0) {
      throw Object.assign(
        new Error('Aucun bulletin antérieur — impossible de générer une projection cohérente.'),
        { status: 400, code: 'NO_HISTORY' }
      );
    }

    // 2. Pour chaque matière historique, calculer la moyenne historique pondérée
    const historicalGeneral = this.weightedGeneral(history);

    // 3. Ratio = cible / historique global
    const ratio = historicalGeneral > 0 ? targetAverage / historicalGeneral : 1;

    // 4. Projeter une moyenne par matière (clampée [0,20])
    const projectedRaw = history.map(h => {
      const histAvg = h.averages.length > 0
        ? h.averages.reduce((a, b) => a + b, 0) / h.averages.length
        : historicalGeneral;
      return {
        ...h,
        projectedMoyenne: clamp(histAvg * ratio),
      };
    });

    // 5. Ajustement linéaire : on corrige les moyennes pour que Σ(moy×coef)/Σ(coef) = target
    const adjusted = this.adjustToTarget(projectedRaw, targetAverage);

    // 6. Pour chaque matière, générer les notes individuelles autour de la moyenne projetée,
    //    en respectant le pattern (types de notes présents historiquement)
    const subjects = adjusted.map((s, idx) => {
      const moy = s.projectedMoyenne;
      const notes = {
        oral: s.oral.length > 0 ? this.jitter(moy, variance) : null,
        tp: s.tp.length > 0 ? this.jitter(moy, variance) : null,
        examenEcrit: s.examenEcrit.length > 0 ? this.jitter(moy, variance) : null,
        dc1: s.dc1.length > 0 ? this.jitter(moy, variance) : null,
        dc2: s.dc2.length > 0 ? this.jitter(moy, variance) : null,
        devoirSynthese: s.devoirSynthese.length > 0 ? this.jitter(moy, variance) : null,
      };
      return {
        name: s.name,
        coefficient: s.coefficient,
        order: idx,
        ...notes,
        moyenne: round2(moy),
        rank: null,
        exempted: s.exempted,
        teacherNote: null,
      };
    });

    // 7. Recalcul de la moyenne générale finale (post-jitter) — la valeur de moyenne par matière
    //    reste sur projectedMoyenne donc la cible est respectée exactement.
    const finalGeneral = this.computeFromMoyennes(subjects);

    return {
      schoolYear,
      trimester,
      isProjection: true,
      targetAverage,
      generalAverage: finalGeneral,
      subjects,
      meta: {
        historicalGeneral: round2(historicalGeneral),
        ratio: round2(ratio),
        trimestersUsed: history[0]?.averages.length ?? 0,
      },
    };
  }

  // ----- internals -----

  private async collectHistory(userId: string, schoolYear: string, trimester: number): Promise<HistoricalSubject[]> {
    const past = await prisma.bulletin.findMany({
      where: {
        userId,
        isProjection: false,
        OR: [
          { schoolYear: { lt: schoolYear } },
          { schoolYear, trimester: { lt: trimester } },
        ],
      },
      orderBy: [{ schoolYear: 'asc' }, { trimester: 'asc' }],
      include: { subjects: true },
    });

    const map = new Map<string, HistoricalSubject>();
    for (const b of past) {
      for (const s of b.subjects) {
        if (!map.has(s.name)) {
          map.set(s.name, {
            name: s.name,
            coefficient: toNumber(s.coefficient) ?? 0,
            averages: [],
            oral: [],
            tp: [],
            examenEcrit: [],
            dc1: [],
            dc2: [],
            devoirSynthese: [],
            exempted: s.exempted,
          });
        }
        const h = map.get(s.name)!;
        const moy = toNumber(s.moyenne);
        if (moy !== null) h.averages.push(moy);
        const fields = ['oral', 'tp', 'examenEcrit', 'dc1', 'dc2', 'devoirSynthese'] as const;
        for (const f of fields) {
          const v = toNumber(s[f] as any);
          if (v !== null) h[f].push(v);
        }
        // Le coefficient le plus récent fait foi
        h.coefficient = toNumber(s.coefficient) ?? h.coefficient;
      }
    }
    return Array.from(map.values());
  }

  private weightedGeneral(history: HistoricalSubject[]): number {
    const active = history.filter(h => !h.exempted && h.averages.length > 0);
    const totalCoef = active.reduce((a, h) => a + h.coefficient, 0);
    if (totalCoef === 0) return 0;
    const sum = active.reduce((a, h) => {
      const avg = h.averages.reduce((x, y) => x + y, 0) / h.averages.length;
      return a + avg * h.coefficient;
    }, 0);
    return sum / totalCoef;
  }

  /**
   * Ajuste les moyennes projetées pour atteindre exactement la cible.
   * Distribue l'écart proportionnellement aux coefficients pour minimiser
   * la déformation par matière (équivalent moindres-carrés avec contrainte simple).
   */
  private adjustToTarget(
    subjects: Array<HistoricalSubject & { projectedMoyenne: number }>,
    target: number,
  ): Array<HistoricalSubject & { projectedMoyenne: number }> {
    const active = subjects.filter(s => !s.exempted);
    const totalCoef = active.reduce((a, s) => a + s.coefficient, 0);
    if (totalCoef === 0) return subjects;

    // Itérer pour respecter les clamps [0,20] tout en convergeant vers la cible
    for (let iter = 0; iter < 6; iter++) {
      const current = active.reduce((a, s) => a + s.projectedMoyenne * s.coefficient, 0) / totalCoef;
      const delta = target - current;
      if (Math.abs(delta) < 0.01) break;

      // Capacité d'ajustement : matières non saturées
      const adjustables = active.filter(s =>
        delta > 0 ? s.projectedMoyenne < 20 : s.projectedMoyenne > 0
      );
      const adjustableCoef = adjustables.reduce((a, s) => a + s.coefficient, 0);
      if (adjustableCoef === 0) break;

      const correction = (delta * totalCoef) / adjustableCoef;
      for (const s of adjustables) {
        s.projectedMoyenne = clamp(s.projectedMoyenne + correction);
      }
    }
    return subjects;
  }

  private jitter(center: number, amplitude: number): number {
    const noise = (Math.random() * 2 - 1) * amplitude;
    return clamp(round2(center + noise));
  }

  private computeFromMoyennes(subjects: Array<{ moyenne: number | null; coefficient: number; exempted: boolean }>): number | null {
    const active = subjects.filter(s => !s.exempted && s.moyenne !== null);
    const totalCoef = active.reduce((a, s) => a + s.coefficient, 0);
    if (totalCoef === 0) return null;
    const sum = active.reduce((a, s) => a + (s.moyenne as number) * s.coefficient, 0);
    return round2(sum / totalCoef);
  }
}

export const projectionService = new ProjectionService();
