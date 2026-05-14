import prisma from '../utils/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// ----- Zod schemas -----

const decimalStr = z.union([z.number(), z.string()])
  .transform((v) => Number(v))
  .refine((n) => !Number.isNaN(n) && n >= 0 && n <= 20, 'Note doit être entre 0 et 20');

const noteOpt = decimalStr.nullable().optional();

const bulletinSubjectInputSchema = z.object({
  name: z.string().min(1).max(100),
  subjectId: z.string().uuid().nullable().optional(),
  coefficient: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  order: z.number().int().min(0).default(0),
  oral: noteOpt,
  tp: noteOpt,
  examenEcrit: noteOpt,
  dc1: noteOpt,
  dc2: noteOpt,
  devoirSynthese: noteOpt,
  moyenne: noteOpt,
  rank: z.number().int().min(0).nullable().optional(),
  exempted: z.boolean().default(false),
  teacherNote: z.string().max(500).nullable().optional(),
});

const bulletinCreateSchema = z.object({
  schoolYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Format attendu: YYYY/YYYY'),
  trimester: z.number().int().min(1).max(3),
  className: z.string().max(200).nullable().optional(),
  classSize: z.number().int().min(0).nullable().optional(),
  rank: z.number().int().min(0).nullable().optional(),
  isProjection: z.boolean().default(false),
  subjects: z.array(bulletinSubjectInputSchema).min(1),
});

const bulletinUpdateSchema = bulletinCreateSchema.partial();

export type BulletinSubjectInput = z.infer<typeof bulletinSubjectInputSchema>;

// ----- Helpers -----

function toNumber(d: Prisma.Decimal | number | null | undefined): number | null {
  if (d === null || d === undefined) return null;
  if (typeof d === 'number') return d;
  return Number(d.toString());
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calcule la moyenne d'une matière à partir des notes brutes si non fournie.
 * Approche simple : moyenne arithmétique des notes renseignées.
 * (Les vraies formules tunisiennes varient par matière ; cette estimation
 * suffit pour les projections — la valeur officielle reste prioritaire si fournie.)
 */
function computeSubjectMoyenne(s: BulletinSubjectInput): number | null {
  if (s.moyenne !== null && s.moyenne !== undefined) return s.moyenne;
  const notes = [s.oral, s.tp, s.examenEcrit, s.dc1, s.dc2, s.devoirSynthese]
    .filter((n): n is number => n !== null && n !== undefined);
  if (notes.length === 0) return null;
  return round2(notes.reduce((a, b) => a + b, 0) / notes.length);
}

function computeGeneralAverage(subjects: Array<{ moyenne: number | null; coefficient: number; exempted: boolean }>): number | null {
  const active = subjects.filter(s => !s.exempted && s.moyenne !== null);
  if (active.length === 0) return null;
  const totalCoef = active.reduce((a, s) => a + s.coefficient, 0);
  if (totalCoef === 0) return null;
  const totalPts = active.reduce((a, s) => a + (s.moyenne as number) * s.coefficient, 0);
  return round2(totalPts / totalCoef);
}

/** Auto-lie une matière à un Subject existant via match exact sur le name (pour l'utilisateur). */
async function resolveSubjectId(userId: string, name: string, providedId?: string | null): Promise<string | null> {
  if (providedId) {
    const exists = await prisma.subject.findFirst({ where: { id: providedId, userId } });
    if (exists) return exists.id;
  }
  const match = await prisma.subject.findFirst({ where: { userId, name } });
  return match?.id ?? null;
}

// ----- Service -----

export class BulletinService {
  async list(userId: string) {
    const bulletins = await prisma.bulletin.findMany({
      where: { userId },
      orderBy: [{ schoolYear: 'desc' }, { trimester: 'asc' }, { isProjection: 'asc' }],
      include: { _count: { select: { subjects: true } } },
    });
    return bulletins.map(b => ({
      id: b.id,
      schoolYear: b.schoolYear,
      trimester: b.trimester,
      className: b.className,
      classSize: b.classSize,
      rank: b.rank,
      generalAverage: toNumber(b.generalAverage),
      isProjection: b.isProjection,
      subjectsCount: b._count.subjects,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  }

  async getById(userId: string, id: string) {
    const b = await prisma.bulletin.findFirst({
      where: { id, userId },
      include: {
        subjects: {
          orderBy: { order: 'asc' },
          include: { subject: { select: { id: true, name: true, color: true } } },
        },
      },
    });
    if (!b) throw Object.assign(new Error('Bulletin non trouvé'), { status: 404, code: 'NOT_FOUND' });
    return this.serialize(b);
  }

  async create(userId: string, data: unknown) {
    const validated = bulletinCreateSchema.parse(data);

    const subjectsWithComputed = await Promise.all(
      validated.subjects.map(async (s, idx) => {
        const subjectId = await resolveSubjectId(userId, s.name, s.subjectId ?? null);
        const moyenne = computeSubjectMoyenne(s);
        const total = moyenne !== null ? round2(moyenne * s.coefficient) : null;
        return { input: s, subjectId, moyenne, total, order: s.order ?? idx };
      })
    );

    const generalAverage = computeGeneralAverage(
      subjectsWithComputed.map(s => ({
        moyenne: s.moyenne,
        coefficient: s.input.coefficient,
        exempted: s.input.exempted,
      }))
    );

    const bulletin = await prisma.bulletin.create({
      data: {
        userId,
        schoolYear: validated.schoolYear,
        trimester: validated.trimester,
        className: validated.className ?? null,
        classSize: validated.classSize ?? null,
        rank: validated.rank ?? null,
        isProjection: validated.isProjection,
        generalAverage: generalAverage !== null ? new Prisma.Decimal(generalAverage) : null,
        subjects: {
          create: subjectsWithComputed.map(({ input, subjectId, moyenne, total, order }) => ({
            subjectId,
            name: input.name,
            coefficient: new Prisma.Decimal(input.coefficient),
            order,
            oral: input.oral !== null && input.oral !== undefined ? new Prisma.Decimal(input.oral) : null,
            tp: input.tp !== null && input.tp !== undefined ? new Prisma.Decimal(input.tp) : null,
            examenEcrit: input.examenEcrit !== null && input.examenEcrit !== undefined ? new Prisma.Decimal(input.examenEcrit) : null,
            dc1: input.dc1 !== null && input.dc1 !== undefined ? new Prisma.Decimal(input.dc1) : null,
            dc2: input.dc2 !== null && input.dc2 !== undefined ? new Prisma.Decimal(input.dc2) : null,
            devoirSynthese: input.devoirSynthese !== null && input.devoirSynthese !== undefined ? new Prisma.Decimal(input.devoirSynthese) : null,
            moyenne: moyenne !== null ? new Prisma.Decimal(moyenne) : null,
            rank: input.rank ?? null,
            total: total !== null ? new Prisma.Decimal(total) : null,
            exempted: input.exempted,
            teacherNote: input.teacherNote ?? null,
          })),
        },
      },
      include: {
        subjects: {
          orderBy: { order: 'asc' },
          include: { subject: { select: { id: true, name: true, color: true } } },
        },
      },
    });

    return this.serialize(bulletin);
  }

  async update(userId: string, id: string, data: unknown) {
    const validated = bulletinUpdateSchema.parse(data);

    const existing = await prisma.bulletin.findFirst({ where: { id, userId } });
    if (!existing) throw Object.assign(new Error('Bulletin non trouvé'), { status: 404, code: 'NOT_FOUND' });

    // Si subjects fourni → remplacement complet (plus simple que diff). Sinon métadonnées seules.
    if (validated.subjects) {
      const subjectsWithComputed = await Promise.all(
        validated.subjects.map(async (s, idx) => {
          const subjectId = await resolveSubjectId(userId, s.name, s.subjectId ?? null);
          const moyenne = computeSubjectMoyenne(s);
          const total = moyenne !== null ? round2(moyenne * s.coefficient) : null;
          return { input: s, subjectId, moyenne, total, order: s.order ?? idx };
        })
      );
      const generalAverage = computeGeneralAverage(
        subjectsWithComputed.map(s => ({
          moyenne: s.moyenne,
          coefficient: s.input.coefficient,
          exempted: s.input.exempted,
        }))
      );

      await prisma.$transaction([
        prisma.bulletinSubject.deleteMany({ where: { bulletinId: id } }),
        prisma.bulletin.update({
          where: { id },
          data: {
            schoolYear: validated.schoolYear ?? existing.schoolYear,
            trimester: validated.trimester ?? existing.trimester,
            className: validated.className === undefined ? existing.className : validated.className,
            classSize: validated.classSize === undefined ? existing.classSize : validated.classSize,
            rank: validated.rank === undefined ? existing.rank : validated.rank,
            isProjection: validated.isProjection ?? existing.isProjection,
            generalAverage: generalAverage !== null ? new Prisma.Decimal(generalAverage) : null,
            subjects: {
              create: subjectsWithComputed.map(({ input, subjectId, moyenne, total, order }) => ({
                subjectId,
                name: input.name,
                coefficient: new Prisma.Decimal(input.coefficient),
                order,
                oral: input.oral !== null && input.oral !== undefined ? new Prisma.Decimal(input.oral) : null,
                tp: input.tp !== null && input.tp !== undefined ? new Prisma.Decimal(input.tp) : null,
                examenEcrit: input.examenEcrit !== null && input.examenEcrit !== undefined ? new Prisma.Decimal(input.examenEcrit) : null,
                dc1: input.dc1 !== null && input.dc1 !== undefined ? new Prisma.Decimal(input.dc1) : null,
                dc2: input.dc2 !== null && input.dc2 !== undefined ? new Prisma.Decimal(input.dc2) : null,
                devoirSynthese: input.devoirSynthese !== null && input.devoirSynthese !== undefined ? new Prisma.Decimal(input.devoirSynthese) : null,
                moyenne: moyenne !== null ? new Prisma.Decimal(moyenne) : null,
                rank: input.rank ?? null,
                total: total !== null ? new Prisma.Decimal(total) : null,
                exempted: input.exempted,
                teacherNote: input.teacherNote ?? null,
              })),
            },
          },
        }),
      ]);
    } else {
      await prisma.bulletin.update({
        where: { id },
        data: {
          schoolYear: validated.schoolYear ?? existing.schoolYear,
          trimester: validated.trimester ?? existing.trimester,
          className: validated.className === undefined ? existing.className : validated.className,
          classSize: validated.classSize === undefined ? existing.classSize : validated.classSize,
          rank: validated.rank === undefined ? existing.rank : validated.rank,
          isProjection: validated.isProjection ?? existing.isProjection,
        },
      });
    }

    return this.getById(userId, id);
  }

  async delete(userId: string, id: string) {
    const existing = await prisma.bulletin.findFirst({ where: { id, userId } });
    if (!existing) throw Object.assign(new Error('Bulletin non trouvé'), { status: 404, code: 'NOT_FOUND' });
    await prisma.bulletin.delete({ where: { id } });
    return { message: 'Bulletin supprimé' };
  }

  serialize(b: any) {
    return {
      id: b.id,
      schoolYear: b.schoolYear,
      trimester: b.trimester,
      className: b.className,
      classSize: b.classSize,
      rank: b.rank,
      generalAverage: toNumber(b.generalAverage),
      isProjection: b.isProjection,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      subjects: b.subjects.map((s: any) => ({
        id: s.id,
        subjectId: s.subjectId,
        subjectRef: s.subject ? { id: s.subject.id, name: s.subject.name, color: s.subject.color } : null,
        name: s.name,
        coefficient: toNumber(s.coefficient),
        order: s.order,
        oral: toNumber(s.oral),
        tp: toNumber(s.tp),
        examenEcrit: toNumber(s.examenEcrit),
        dc1: toNumber(s.dc1),
        dc2: toNumber(s.dc2),
        devoirSynthese: toNumber(s.devoirSynthese),
        moyenne: toNumber(s.moyenne),
        rank: s.rank,
        total: toNumber(s.total),
        exempted: s.exempted,
        teacherNote: s.teacherNote,
      })),
    };
  }
}

export const bulletinService = new BulletinService();
