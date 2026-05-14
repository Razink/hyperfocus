import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Bulletin } from '../types';
import { bulletinService } from '../services/bulletin.service';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { SUBJECT_COLORS } from '../data/schedule';

const TRIM_LABEL: Record<number, string> = {
  1: '1er trimestre',
  2: '2ème trimestre',
  3: '3ème trimestre',
};

const fmt = (n: number | null) => (n === null || n === undefined ? '—' : n.toFixed(2));

export const BulletinDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [b, setB] = useState<Bulletin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    bulletinService
      .getById(id)
      .then(setB)
      .catch((e) => console.error('Error loading bulletin:', e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><div className="p-6 text-gray-500">Chargement…</div></Layout>;
  if (!b) return <Layout><div className="p-6 text-gray-500">Bulletin introuvable</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <header className="mb-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">{b.schoolYear}</p>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                {TRIM_LABEL[b.trimester] ?? `T${b.trimester}`}
                {b.isProjection && <span className="ml-2 rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Projection</span>}
              </h1>
              {b.className && <p className="mt-1 text-sm text-gray-500">{b.className}</p>}
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs uppercase text-gray-500">Moyenne</p>
                <p className="font-display text-3xl font-bold text-gray-900">{fmt(b.generalAverage)}</p>
              </div>
              {b.rank !== null && b.classSize !== null && (
                <div>
                  <p className="text-xs uppercase text-gray-500">Rang</p>
                  <p className="font-display text-3xl font-bold text-gray-900">{b.rank}<span className="text-base font-normal text-gray-500">/{b.classSize}</span></p>
                </div>
              )}
            </div>
          </div>
        </header>

        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">Matière</th>
                <th className="px-2 py-2">Coef</th>
                <th className="px-2 py-2">Oral</th>
                <th className="px-2 py-2">TP</th>
                <th className="px-2 py-2">Écrit</th>
                <th className="px-2 py-2">DC1</th>
                <th className="px-2 py-2">DC2</th>
                <th className="px-2 py-2">DS</th>
                <th className="px-2 py-2 font-semibold">Moy.</th>
                <th className="px-2 py-2">Rang</th>
                <th className="px-2 py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {b.subjects.map(s => {
                const palette = SUBJECT_COLORS[s.name];
                return (
                  <tr key={s.id ?? s.name} className={s.exempted ? 'text-gray-400' : ''}>
                    <td className="px-3 py-2 text-left">
                      <span
                        className="inline-block rounded px-2 py-0.5 text-xs font-medium"
                        style={palette ? { backgroundColor: palette.bg, color: palette.text } : { backgroundColor: '#f1f5f9', color: '#475569' }}
                      >
                        {s.name}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-gray-600">{s.exempted ? 'exempté' : s.coefficient}</td>
                    <td className="px-2 py-2 text-center">{fmt(s.oral)}</td>
                    <td className="px-2 py-2 text-center">{fmt(s.tp)}</td>
                    <td className="px-2 py-2 text-center">{fmt(s.examenEcrit)}</td>
                    <td className="px-2 py-2 text-center">{fmt(s.dc1)}</td>
                    <td className="px-2 py-2 text-center">{fmt(s.dc2)}</td>
                    <td className="px-2 py-2 text-center">{fmt(s.devoirSynthese)}</td>
                    <td className="px-2 py-2 text-center font-semibold text-gray-900">{fmt(s.moyenne)}</td>
                    <td className="px-2 py-2 text-center text-gray-600">{s.rank ?? '—'}</td>
                    <td className="px-2 py-2 text-center font-semibold text-gray-900">{fmt(s.total)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 text-sm font-semibold text-gray-700">
              <tr>
                <td className="px-3 py-2 text-left">Total</td>
                <td className="px-2 py-2 text-center">
                  {b.subjects.filter(s => !s.exempted).reduce((a, s) => a + s.coefficient, 0)}
                </td>
                <td colSpan={6} />
                <td className="px-2 py-2 text-center">{fmt(b.generalAverage)}</td>
                <td />
                <td className="px-2 py-2 text-center">
                  {fmt(b.subjects.filter(s => !s.exempted && s.total !== null).reduce((a, s) => a + (s.total as number), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>

        {b.subjects.some(s => s.teacherNote) && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-600">Remarques des enseignants</h2>
            <div className="space-y-2">
              {b.subjects.filter(s => s.teacherNote).map(s => (
                <Card key={s.id ?? s.name}>
                  <p className="text-xs font-medium text-gray-500">{s.name}</p>
                  <p className="text-sm text-gray-800">{s.teacherNote}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};
