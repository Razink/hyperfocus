import { useEffect, useState } from 'react';
import {
  Calendar, CheckCircle2, ClipboardList, ExternalLink, FileCode2, FileText,
  Link2, Plus, Upload, X
} from 'lucide-react';
import type { Assessment, AssessmentGrouped, AssessmentResource, Lesson } from '../types';
import { assessmentService } from '../services/assessment.service';
import { ProgressBar } from './ProgressBar';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? 'http://localhost:3000';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : null;

const kindLabel: Record<string, string> = { DC1: 'DC 1', DC2: 'DC 2', DS1: 'DS 1' };

const addAssessmentToGrouped = (grouped: Record<number, Assessment[]>, assessment: Assessment) => {
  const next = { ...grouped };
  next[assessment.trimester] = [...(next[assessment.trimester] ?? []), assessment].sort((a, b) =>
    a.kind.localeCompare(b.kind, 'fr')
  );
  return next;
};

const fileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
};

const isHtmlResource = (resource: AssessmentResource) =>
  resource.mimeType?.includes('html') || /\.html?$/i.test(resource.url);

const getFileLabel = (resource: AssessmentResource) => {
  if (resource.type === 'IMAGE') return 'Image';
  if (isHtmlResource(resource)) return 'HTML';
  if (resource.mimeType?.includes('pdf')) return 'PDF';
  if (resource.mimeType?.includes('powerpoint') || resource.mimeType?.includes('presentation')) return 'PPT';
  if (resource.mimeType?.includes('word')) return 'Word';
  return 'Doc';
};

const AssessmentResourceGrid = ({
  resources,
  onDelete,
}: {
  resources: AssessmentResource[];
  onDelete: (id: string) => void;
}) => {
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [lightbox]);

  const openResource = (resource: AssessmentResource) => {
    const url = resource.url.startsWith('/uploads') ? `${API_URL}${resource.url}` : resource.url;
    if (resource.type === 'IMAGE') {
      setLightbox(url);
      return;
    }
    if (resource.type === 'LINK') {
      window.open(url, '_blank', 'noopener');
      return;
    }
    window.open(isHtmlResource(resource) ? `/assessment-resources/${resource.id}/view` : url, '_blank', 'noopener');
  };

  if (resources.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
        Aucune pièce jointe.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {resources.map(resource => {
          const url = resource.url.startsWith('/uploads') ? `${API_URL}${resource.url}` : resource.url;
          return (
            <div
              key={resource.id}
              onClick={() => openResource(resource)}
              className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
            >
              {resource.type === 'IMAGE' ? (
                <img src={url} alt={resource.title} className="h-24 w-full object-cover" />
              ) : (
                <div className="flex h-24 flex-col items-center justify-center gap-2 bg-white">
                  {resource.type === 'LINK'
                    ? <ExternalLink className="h-8 w-8 text-sky-500" />
                    : isHtmlResource(resource)
                      ? <FileCode2 className="h-8 w-8 text-emerald-500" />
                      : <FileText className="h-8 w-8 text-blue-500" />
                  }
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {resource.type === 'LINK' ? 'Lien' : getFileLabel(resource)}
                  </span>
                </div>
              )}
              <div className="px-2 py-1.5">
                <p className="truncate text-xs font-medium text-gray-700">{resource.title}</p>
                {resource.fileSize && <p className="text-[11px] text-gray-400">{fileSize(resource.fileSize)}</p>}
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(resource.id);
                }}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Supprimer la pièce jointe"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} className="absolute right-4 top-4 rounded-full bg-black/40 p-1.5 text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};

const CreateAssessmentModal = ({
  subjectId,
  defaultTrimester,
  color,
  onClose,
  onCreated,
}: {
  subjectId: string;
  defaultTrimester: 1 | 2 | 3;
  color: string;
  onClose: () => void;
  onCreated: (assessment: Assessment) => void;
}) => {
  const [trimester, setTrimester] = useState<1 | 2 | 3>(defaultTrimester);
  const [kind, setKind] = useState('Examen');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = kind.trim();
    if (!label) return;
    setSaving(true);
    setError(null);
    try {
      const created = await assessmentService.create(subjectId, { trimester, kind: label });
      onCreated(created);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Impossible de créer le devoir');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold" style={{ color }}>Nouveau devoir</p>
            <h2 className="text-lg font-bold text-gray-900">Ajouter un examen</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Trimestre</label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTrimester(value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                    trimester === value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  T{value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="assessment-kind" className="mb-2 block text-sm font-medium text-gray-700">
              Libellé
            </label>
            <input
              id="assessment-kind"
              value={kind}
              onChange={e => setKind(e.target.value)}
              placeholder="Examen, Examen blanc, Rattrapage..."
              required
              maxLength={40}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !kind.trim()}
              className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  const [resources, setResources] = useState<AssessmentResource[]>(assessment.resources ?? []);
  const [addingLink, setAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setResources(assessment.resources ?? []);
    setSelected(new Set(assessment.lessons.map(al => al.lesson.id)));
  }, [assessment]);

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

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await assessmentService.addLink(assessment.id, { url: linkUrl, title: linkTitle || undefined });
    setResources(current => [...current, created]);
    setLinkUrl('');
    setLinkTitle('');
    setAddingLink(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const uploaded: AssessmentResource[] = [];
      for (const file of Array.from(e.target.files)) {
        uploaded.push(file.type.startsWith('image/')
          ? await assessmentService.addImage(assessment.id, file)
          : await assessmentService.addDoc(assessment.id, file)
        );
      }
      setResources(current => [...current, ...uploaded]);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    await assessmentService.deleteResource(resourceId);
    setResources(current => current.filter(resource => resource.id !== resourceId));
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
              {t === 'detail' ? 'Détail' : 'Gérer les cours'}
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
              <div className="mt-5 border-t border-gray-100 pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Pièces jointes</h3>
                    <p className="text-xs text-gray-500">Liens, PDF, PowerPoint, Word, HTML, images.</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAddingLink(value => !value)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Lien
                    </button>
                    <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? 'Upload...' : 'Fichier'}
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.html,.htm,image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {addingLink && (
                  <form onSubmit={handleAddLink} className="mb-3 space-y-2 rounded-lg border border-gray-200 p-3">
                    <input
                      type="url"
                      required
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <input
                      type="text"
                      value={linkTitle}
                      onChange={e => setLinkTitle(e.target.value)}
                      placeholder="Libellé optionnel"
                      className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 rounded-md bg-primary-600 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
                        Ajouter
                      </button>
                      <button type="button" onClick={() => setAddingLink(false)} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs">
                        Annuler
                      </button>
                    </div>
                  </form>
                )}

                <AssessmentResourceGrid resources={resources} onDelete={handleDeleteResource} />
              </div>
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
        {(assessment.resources?.length ?? 0) > 0 && <>
          <span>·</span>
          <span>{assessment.resources?.length} fichier{(assessment.resources?.length ?? 0) > 1 ? 's' : ''}</span>
        </>}
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
  trimesterFilter = 'all',
}: {
  subjectId: string;
  subjectColor: string;
  lessons: Lesson[];
  trimesterFilter?: 'all' | 1 | 2 | 3;
}) => {
  const [data, setData] = useState<AssessmentGrouped | null>(null);
  const [selected, setSelected] = useState<Assessment | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTrimester, setCreateTrimester] = useState<1 | 2 | 3>(1);

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

  const handleCreated = (created: Assessment) => {
    setData(d => d ? { ...d, grouped: addAssessmentToGrouped(d.grouped, created) } : d);
    setIsCreateOpen(false);
    setSelected(created);
  };

  if (!data) return null;

  const visibleTrimesters = trimesterFilter === 'all'
    ? ([1, 2, 3] as const)
    : ([trimesterFilter] as const);

  return (
    <>
      <section>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setCreateTrimester(trimesterFilter === 'all' ? 1 : trimesterFilter);
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter un devoir
          </button>
        </div>

        <div className="space-y-6">
          {visibleTrimesters.map(t => (
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
                {(data.grouped[t] ?? []).length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCreateTrimester(t);
                      setIsCreateOpen(true);
                    }}
                    className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm font-medium text-gray-500 hover:border-primary-400 hover:bg-primary-50"
                  >
                    + Ajouter un devoir T{t}
                  </button>
                )}
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

      {isCreateOpen && (
        <CreateAssessmentModal
          subjectId={subjectId}
          defaultTrimester={createTrimester}
          color={subjectColor}
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
};
