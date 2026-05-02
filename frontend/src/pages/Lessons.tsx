import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, Circle, Image as ImageIcon, Download, Pencil } from 'lucide-react';
import type { Lesson, SubjectDetail } from '../types';
import { subjectService } from '../services/subject.service';
import { lessonService } from '../services/lesson.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { ProgressBar } from '../components/ProgressBar';
import { Layout } from '../components/Layout';
import { LessonModal } from '../components/LessonModal';
import { ImportModal } from '../components/ImportModal';
import { AssessmentSection } from '../components/AssessmentSection';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? 'http://localhost:3000';
const LESSON_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#ef4444'];

export const Lessons = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [trimesterFilter, setTrimesterFilter] = useState<'all' | 1 | 2 | 3>('all');

  // Modal : nouveau cours
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    contentPercent: 0,
    trimester: 1,
    color: LESSON_COLORS[0],
  });

  // Fiche cours
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Import
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { loadLessons(); }, [subjectId]);

  const loadLessons = async () => {
    if (!subjectId) return;
    try {
      const result = await subjectService.getLessons(subjectId);
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    await lessonService.create(subjectId, createForm);
    setIsCreateOpen(false);
    setCreateForm({ title: '', contentPercent: 0, trimester: 1, color: LESSON_COLORS[0] });
    loadLessons();
  };

  const handleToggleRevised = async (lessonId: string, current: boolean) => {
    await lessonService.updateRevised(lessonId, !current);
    loadLessons();
  };

  const handleImported = (count: number) => {
    loadLessons();
    showToast(`${count} cours importé${count > 1 ? 's' : ''} ✓`);
  };

  if (loading || !data) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </Layout>
    );
  }

  const filteredLessons = data.lessons.filter(lesson =>
    trimesterFilter === 'all' ? true : (lesson.trimester || 1) === trimesterFilter
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <header className="sticky top-16 z-10 border-b border-gray-200 bg-white md:top-0">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <button
              onClick={() => navigate('/subjects')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1
                  className="break-words text-2xl font-bold font-display sm:text-3xl"
                  style={{ color: data.subject.color }}
                >
                  {data.subject.name}
                </h1>
                <p className="text-gray-500 text-sm">
                  {filteredLessons.length} / {data.lessons.length} cours
                </p>
              </div>
              <button
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 shrink-0"
              >
                <Download className="w-4 h-4" />
                Importer
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              { value: 'all' as const, label: 'Tous' },
              { value: 1 as const, label: 'T1' },
              { value: 2 as const, label: 'T2' },
              { value: 3 as const, label: 'T3' },
            ].map(option => (
              <button
                key={option.label}
                onClick={() => setTrimesterFilter(option.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  trimesterFilter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredLessons.map((lesson: Lesson) => {
              const lessonColor = lesson.color || data.subject.color;
              return (
                <Card key={lesson.id} color={lessonColor} className="h-full">
                  <div className="flex h-full flex-col gap-4">
                    {/* Thumbnail — clic → fiche */}
                    <div
                      className="cursor-pointer"
                      onClick={() => setSelectedLessonId(lesson.id)}
                    >
                      {lesson.screenshotUrl ? (
                        <img
                          src={`${API_URL}${lesson.screenshotUrl}`}
                          alt={lesson.title}
                          className="h-32 w-full rounded-lg object-cover transition-opacity hover:opacity-80"
                        />
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200">
                          <ImageIcon className="w-7 h-7 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3
                          className="line-clamp-2 min-w-0 cursor-pointer break-words text-base font-semibold text-gray-900 transition-colors hover:text-gray-600"
                          onClick={() => setSelectedLessonId(lesson.id)}
                        >
                          {lesson.title}
                        </h3>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => navigate(`/lessons/${lesson.id}/edit`)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Éditer
                          </button>
                          <button
                            onClick={() => handleToggleRevised(lesson.id, lesson.isRevised)}
                            className="transition-colors"
                            aria-label={lesson.isRevised ? 'Marquer non révisé' : 'Marquer révisé'}
                          >
                            {lesson.isRevised
                              ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                              : <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                            }
                          </button>
                        </div>
                      </div>

                      <div className="mb-2 mt-auto">
                        <ProgressBar value={lesson.contentPercent} color={lessonColor} showLabel={false} size="sm" />
                      </div>

                      <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium" style={{ color: lessonColor }}>
                          {lesson.contentPercent}% écrit
                        </span>
                        <span className="w-fit rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: lessonColor }}>
                          T{lesson.trimester || 1}
                        </span>
                        {lesson.isRevised && lesson.revisedAt && (
                          <span className="text-gray-400 text-xs">
                            Révisé le {new Date(lesson.revisedAt).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            <button
              onClick={() => setIsCreateOpen(true)}
              className="min-h-[250px] w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
            >
              <Plus className="w-6 h-6 text-gray-400" />
              <span className="text-gray-600 font-medium">Ajouter un cours</span>
            </button>
          </div>

          {/* Section devoirs */}
          <AssessmentSection
            subjectId={data.subject.id}
            subjectColor={data.subject.color}
            lessons={data.lessons}
          />
        </main>

        {/* Modal nouveau cours */}
        <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nouveau cours">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Titre du cours"
              value={createForm.title}
              onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Chapitre 1 — Les fractions"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progression : {createForm.contentPercent}%
              </label>
              <input
                type="range" min="0" max="100" step="5"
                value={createForm.contentPercent}
                onChange={e => setCreateForm(f => ({ ...f, contentPercent: +e.target.value }))}
                className="w-full"
              />
              <ProgressBar value={createForm.contentPercent} color={createForm.color} showLabel={false} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(trimester => (
                  <button
                    key={trimester}
                    type="button"
                    onClick={() => setCreateForm(f => ({ ...f, trimester }))}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      createForm.trimester === trimester
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    T{trimester}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
              <div className="grid grid-cols-8 gap-2">
                {LESSON_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCreateForm(f => ({ ...f, color }))}
                    className={`h-8 rounded-lg border-2 ${createForm.color === color ? 'border-gray-900' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Couleur ${color}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)} fullWidth>
                Annuler
              </Button>
              <Button type="submit" fullWidth>Créer</Button>
            </div>
          </form>
        </Modal>

        {/* Fiche cours */}
        <LessonModal
          lessonId={selectedLessonId}
          subjectColor={data.subject.color}
          onClose={() => setSelectedLessonId(null)}
          onUpdated={loadLessons}
        />

        {/* Import modal */}
        {isImportOpen && (
          <ImportModal
            subjectId={data.subject.id}
            onClose={() => setIsImportOpen(false)}
            onImported={handleImported}
          />
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg md:bottom-6">
            {toast}
          </div>
        )}
      </div>
    </Layout>
  );
};
