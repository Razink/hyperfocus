import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, RefreshCw } from 'lucide-react';
import type { BulletinSubject } from '../types';
import { bulletinService } from '../services/bulletin.service';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { SUBJECT_COLORS } from '../data/schedule';

type Row = Omit<BulletinSubject, 'id' | 'subjectRef' | 'total'>;

const NOTE_FIELDS: { key: keyof Row; label: string }[] = [
  { key: 'oral', label: 'Oral' },
  { key: 'tp', label: 'TP' },
  { key: 'examenEcrit', label: 'Écrit' },
  { key: 'dc1', label: 'DC1' },
  { key: 'dc2', label: 'DC2' },
  { key: 'devoirSynthese', label: 'DS' },
];

function round2(n: number) { return Math.round(n * 100) / 100; }

function computeMoyenne(r: Row): number | null {
  const notes = NOTE_FIELDS
    .map(f => r[f.key])
    .filter((v): v is number => typeof v === 'number');
  if (notes.length > 0) return round2(notes.reduce((a, b) => a + b, 0) / notes.length);
  return r.moyenne ?? null;
}

function computeGeneral(rows: Row[]): { moyenne: number | null; totalCoef: number } {
  const active = rows.filter(r => !r.exempted);
  const totalCoef = active.reduce((a, r) => a + r.coefficient, 0);
  if (totalCoef === 0) return { moyenne: null, totalCoef: 0 };
  let totalPts = 0;
  let usedCoef = 0;
  for (const r of active) {
    const m = computeMoyenne(r);
    if (m !== null) {
      totalPts += m * r.coefficient;
      usedCoef += r.coefficient;
    }
  }
  if (usedCoef === 0) return { moyenne: null, totalCoef };
  return { moyenne: round2(totalPts / usedCoef), totalCoef };
}

export const BulletinProjection = () => {
  const navigate = useNavigate();
  const [schoolYear, setSchoolYear] = useState('2025/2026');
  const [trimester, setTrimester] = useState(3);
  const [rows, setRows] = useState<Row[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autofillOpen, setAutofillOpen] = useState(false);
  const [target, setTarget] = useState('12');
  const [variance, setVariance] = useState('1.2');
  const [autofillError, setAutofillError] = useState<string | null>(null);

  useEffect(() => {
    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolYear, trimester]);

  const loadDraft = async () => {
    setLoading(true);
    try {
      const draft = await bulletinService.draft(schoolYear, trimester);
      setRows(draft.subjects.map(s => ({ ...s })));
      setNotice(draft.notice ?? null);
    } catch (e) {
      console.error('Error loading draft:', e);
    } finally {
      setLoading(false);
    }
  };

  const { moyenne, totalCoef } = useMemo(() => computeGeneral(rows), [rows]);

  const updateRow = (idx: number, field: keyof Row, raw: string) => {
    const v = raw === '' ? null : Number(raw);
    if (raw !== '' && (Number.isNaN(v) || (v as number) < 0 || (v as number) > 20)) return;
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: v } : r));
  };

  const handleAutofill = async () => {
    setAutofillError(null);
    try {
      const result = await bulletinService.autofill({
        schoolYear,
        trimester,
        targetAverage: Number(target),
        variance: Number(variance),
      });
      // Mappe le résultat sur l'état local
      setRows(result.subjects.map(s => ({
        name: s.name,
        subjectId: (s as any).subjectId ?? null,
        coefficient: s.coefficient,
        order: s.order,
        oral: s.oral, tp: s.tp, examenEcrit: s.examenEcrit,
        dc1: s.dc1, dc2: s.dc2, devoirSynthese: s.devoirSynthese,
        moyenne: s.moyenne, rank: null, exempted: s.exempted, teacherNote: null,
      })));
      setAutofillOpen(false);
    } catch (e: any) {
      setAutofillError(e?.response?.data?.error?.message ?? 'Erreur autofill');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const created = await bulletinService.create({
        schoolYear,
        trimester,
        isProjection: true,
        subjects: rows.map(r => ({
          subjectId: r.subjectId,
          name: r.name,
          coefficient: r.coefficient,
          order: r.order,
          oral: r.oral, tp: r.tp, examenEcrit: r.examenEcrit,
          dc1: r.dc1, dc2: r.dc2, devoirSynthese: r.devoirSynthese,
          moyenne: r.moyenne, rank: r.rank, exempted: r.exempted, teacherNote: r.teacherNote,
        })),
      });
      navigate(`/bulletins/${created.id}`);
    } catch (e: any) {
      console.error('Error saving projection:', e);
      alert(e?.response?.data?.error?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Projection de bulletin</h1>
            <p className="mt-1 text-sm text-gray-500">Remplis les notes pour voir la moyenne projetée, ou utilise l'autofill depuis une moyenne cible</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600">Année</label>
              <input
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="w-28 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="2025/2026"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Trimestre</label>
              <select
                value={trimester}
                onChange={(e) => setTrimester(Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={1}>T1</option>
                <option value={2}>T2</option>
                <option value={3}>T3</option>
              </select>
            </div>
            <Button variant="secondary" onClick={() => setAutofillOpen(true)}>
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Autofill</span>
            </Button>
            <Button onClick={handleSave} disabled={saving || rows.length === 0}>
              <span className="flex items-center gap-2"><Save className="h-4 w-4" /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}</span>
            </Button>
          </div>
        </header>

        {notice && (
          <Card className="mb-4 border-l-4 border-amber-400 bg-amber-50 text-sm text-amber-800">{notice}</Card>
        )}

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Card>
            <p className="text-xs uppercase text-gray-500">Moyenne projetée</p>
            <p className="font-display text-3xl font-bold text-primary-700">{moyenne !== null ? moyenne.toFixed(2) : '—'}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase text-gray-500">Matières renseignées</p>
            <p className="font-display text-3xl font-bold text-gray-900">
              {rows.filter(r => computeMoyenne(r) !== null && !r.exempted).length}<span className="text-base font-normal text-gray-500"> / {rows.filter(r => !r.exempted).length}</span>
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase text-gray-500">Somme des coefficients</p>
            <p className="font-display text-3xl font-bold text-gray-900">{totalCoef}</p>
          </Card>
        </div>

        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : rows.length === 0 ? (
          <Card className="text-center text-gray-500">Aucune matière. Crée d'abord un bulletin officiel pour démarrer une projection.</Card>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">Matière</th>
                  <th className="px-2 py-2">Coef</th>
                  {NOTE_FIELDS.map(f => <th key={f.key} className="px-2 py-2">{f.label}</th>)}
                  <th className="px-2 py-2 font-semibold">Moy.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, idx) => {
                  const palette = SUBJECT_COLORS[r.name];
                  const moy = computeMoyenne(r);
                  return (
                    <tr key={r.name} className={r.exempted ? 'text-gray-400' : ''}>
                      <td className="px-3 py-2 text-left">
                        <span
                          className="inline-block rounded px-2 py-0.5 text-xs font-medium"
                          style={palette ? { backgroundColor: palette.bg, color: palette.text } : { backgroundColor: '#f1f5f9', color: '#475569' }}
                        >
                          {r.name}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center text-gray-600">{r.exempted ? '—' : r.coefficient}</td>
                      {NOTE_FIELDS.map(f => (
                        <td key={f.key} className="px-1 py-1">
                          <input
                            type="number"
                            min={0}
                            max={20}
                            step={0.25}
                            value={(r[f.key] as number | null) ?? ''}
                            disabled={r.exempted}
                            onChange={(e) => updateRow(idx, f.key, e.target.value)}
                            className="w-16 rounded border border-gray-200 px-1 py-1 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-semibold text-gray-900">{moy !== null ? moy.toFixed(2) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Modal isOpen={autofillOpen} onClose={() => setAutofillOpen(false)} title="Autofill par moyenne cible">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Génère des notes cohérentes avec ton historique pour atteindre la moyenne cible.
          </p>
          <Input
            label="Moyenne cible (0-20)"
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <Input
            label="Variance (amplitude du jitter par note)"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={variance}
            onChange={(e) => setVariance(e.target.value)}
          />
          {autofillError && <p className="text-sm text-red-600">{autofillError}</p>}
          <div className="flex gap-2">
            <Button onClick={handleAutofill} fullWidth>
              <span className="flex items-center justify-center gap-2"><Sparkles className="h-4 w-4" /> Générer</span>
            </Button>
            <Button variant="secondary" onClick={handleAutofill}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
