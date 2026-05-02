import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle2, X, Calendar } from 'lucide-react';
import type { Assessment, AssessmentGrouped, Lesson } from '../types';
import { assessmentService } from '../services/assessment.service';
import { ProgressBar } from './ProgressBar';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : null;

const kindLabel: Record<string, string> = { DC1: 'DC 1', DC2: 'DC 2', DS1: 'DS 1' };

// ── Assessment detail modal ───────────────────────────────────────────────────
const AssessmentModal = ({
  assessment,
  color,
  allLessons,
  onClose,
  onUpdated,
}: {
  assessment: Assessment;
  color: string;
  allLessons: Lesson[];
  onClose: () => void;
  onUpdated: (a: Assessment) => void;
}) => {
  const [tab, setTab] = useState<'detail' | 'manage'>('detail');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(assessment.lessons.map(al => al.lesson.id))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const toggleLesson = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleSaveLessons = async () => {
    setSaving(true);
    try {
      const updated = await assessmentService.setLessons(assessment.id, [...selected]);
      onUpdated(updated);
      setTab('detail');
    } finally {
      setSaving(false);
    }
  };

  const lessons = assessment.lessons.map(al => al.lesson);
  const revisedCount = lessons.filter(l => l.isRevised).length;
  const avgPct = lessons.length > 0
    ? Math.round(lessons.reduce((s, l) => s + l.contentPercent, 0) / lessons.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color }}>{kindLabel[assessment.kind] ?? assessment.kind}</p>
            <h2 className="text-lg font-bold text-gray-900">T{assessment.trimester} — {kindLabel[assessment.kind] ?? assessment.kind}</h2>
            {assessment.date && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" /> {fmtDate(assessment.date)}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg mt-0.5">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5">
          {(['detail', 'manage'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`mr-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'detail' ? 'Cours affectés' : 'Gérer les cours'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'detail' ? (
            <>
              {lessons.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun cours affecté</p>
                  <button onClick={() => setTab('manage')} className="text-xs text-primary-600 hover:underline mt-1">
                    Gérer les cours →
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <span>{lessons.length} cours</span>
                    <span>·</span>
                    <span>{revisedCount} révisé{revisedCount > 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{avgPct}% moy.</span>
                  </div>
                  <ul className="space-y-2">
                    {lessons.map(l => (
                      <li key={l.id} className="rounded-lg border border-gray-100 p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          {l.isRevised
                            ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            : <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                          }
                          <span className="text-sm font-medium text-gray-800 truncate">{l.title}</span>
                          <span className="ml-auto text-xs text-gray-400 shrink-0">{l.contentPercent}%</span>
                        </div>
                        <ProgressBar value={l.contentPercent} color={color} showLabel={false} size="sm" />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-3">Sélectionne les cours à affecter à ce devoir.</p>
              <ul className="space-y-1.5">
                {allLessons.map(l => (
                  <li
                    key={l.id}
                    onClick={() => toggleLesson(l.id)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                      selected.has(l.id)
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected.has(l.id) ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                    }`}>
                      {selected.has(l.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 flex-1 truncate">{l.title}</span>
                    <span className="text-xs text-gray-400 shrink-0">{l.contentPercent}%</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <button
                  onClick={handleSaveLessons}
                  disabled={saving}
                  className="w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : `Valider (${selected.size} cours)`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Assessment card ───────────────────────────────────────────────────────────
const AssessmentCard = ({
  assessment,
  color,
  onClick,
}: {
  assessment: Assessment;
  color: string;
  onClick: () => void;
}) => {
  const lessons = assessment.lessons.map(al => al.lesson);
  const revisedCount = lessons.filter(l => l.isRevised).length;
  const pct = lessons.length > 0
    ? Math.round(lessons.reduce((s, l) => s + l.contentPercent, 0) / lessons.length)
    : 0;

  return (
    <button
      onClick={onClick}
      className={`text-left w-full rounded-xl border p-4 transition-all hover:shadow-sm ${
        assessment.isPast ? 'opacity-50 bg-gray-50 border-gray-100' : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-semibold" style={{ color }}>{kindLabel[assessment.kind] ?? assessment.kind}</span>
          {assessment.date && (
            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(assessment.date)}</p>
          )}
        </div>
        {assessment.isPast && (
          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full shrink-0">Passé</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span>{lessons.length} cours</span>
        {lessons.length > 0 && <>
          <span>·</span>
          <span>{revisedCount}/{lessons.length} révisés</span>
        </>}
      </div>
      {lessons.length > 0 && (
        <ProgressBar value={pct} color={color} showLabel={false} size="sm" />
      )}
    </button>
  );
};

// ── Main section ──────────────────────────────────────────────────────────────
export const AssessmentSection = ({
  subjectId,
  subjectColor,
  lessons,
}: {
  subjectId: string;
  subjectColor: string;
  lessons: Lesson[];
}) => {
  const [data, setData] = useState<AssessmentGrouped | null>(null);
  const [selected, setSelected] = useState<Assessment | null>(null);

  useEffect(() => {
    assessmentService.getBySubject(subjectId).then(setData);
  }, [subjectId]);

  const handleUpdated = (updated: Assessment) => {
    setData(d => {
      if (!d) return d;
      const grouped = { ...d.grouped };
      for (const t of [1, 2, 3] as const) {
        grouped[t] = grouped[t].map(a => a.id === updated.id ? updated : a);
      }
      return { ...d, grouped };
    });
    setSelected(updated);
  };

  if (!data) return null;

  return (
    <>
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Devoirs</h2>
        </div>

        <div className="space-y-6">
          {([1, 2, 3] as const).map(t => (
            <div key={t}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                Trimestre {t}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(data.grouped[t] ?? []).map(a => (
                  <AssessmentCard
                    key={a.id}
                    assessment={a}
                    color={subjectColor}
                    onClick={() => setSelected(a)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <AssessmentModal
          assessment={selected}
          color={subjectColor}
          allLessons={lessons}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
};
