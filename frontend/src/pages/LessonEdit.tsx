import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileCode2, FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ProgressBar } from '../components/ProgressBar';
import { lessonService } from '../services/lesson.service';
import { resourceService } from '../services/resource.service';
import type { LessonDetail, LessonResource } from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? 'http://localhost:3000';
const LESSON_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#ef4444'];

export const LessonEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    contentPercent: 0,
    trimester: 1,
    color: LESSON_COLORS[0],
    isRevised: false,
  });
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  useEffect(() => {
    if (!id) return;
    lessonService.getById(id).then(d => {
      setDetail(d);
      setForm({
        title: d.title,
        contentPercent: d.contentPercent,
        trimester: d.trimester || 1,
        color: d.color || LESSON_COLORS[0],
        isRevised: d.isRevised,
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const refreshDetail = async () => {
    if (!id) return;
    const next = await lessonService.getById(id);
    setDetail(next);
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files?.length) return;
    setUploadingAttachments(true);
    try {
      for (const file of Array.from(e.target.files)) {
        if (file.type.startsWith('image/')) {
          await resourceService.addImage(id, file);
        } else {
          await resourceService.addDoc(id, file);
        }
      }
      await refreshDetail();
    } finally {
      setUploadingAttachments(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (resourceId: string) => {
    await resourceService.delete(resourceId);
    await refreshDetail();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await lessonService.update(id, form);
      navigate(`/subjects/${detail?.subject.id}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Supprimer ce cours ?')) return;
    await lessonService.delete(id);
    navigate(`/subjects/${detail?.subject.id}`);
  };

  const color = form.color || detail?.color || detail?.subject?.color || LESSON_COLORS[0];
  const attachments = detail?.resources.filter(resource => resource.type === 'DOC' || resource.type === 'IMAGE') ?? [];

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <header className="sticky top-16 z-10 border-b border-gray-200 bg-white md:top-0">
          <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
            <button
              onClick={() => navigate(`/subjects/${detail?.subject.id}`)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {detail?.subject.name}
            </button>
            <h1 className="text-xl font-bold text-gray-900">Modifier le cours</h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">

            <Input
              label="Titre"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progression : {form.contentPercent}%
              </label>
              <input
                type="range" min="0" max="100" step="5"
                value={form.contentPercent}
                onChange={e => setForm(f => ({ ...f, contentPercent: +e.target.value }))}
                className="w-full"
              />
              <ProgressBar value={form.contentPercent} color={color} showLabel={false} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Trimestre</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(trimester => (
                  <button
                    key={trimester}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, trimester }))}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      form.trimester === trimester
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    T{trimester}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Couleur de la leçon</label>
              <div className="grid grid-cols-8 gap-2">
                {LESSON_COLORS.map(nextColor => (
                  <button
                    key={nextColor}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color: nextColor }))}
                    className={`h-8 rounded-lg border-2 ${
                      form.color === nextColor ? 'border-gray-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: nextColor }}
                    aria-label={`Couleur ${nextColor}`}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Pièces jointes</h2>
                  <p className="text-xs text-gray-500">PDF, PowerPoint, images, Word, HTML.</p>
                </div>
                <label
                  htmlFor="attachments-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingAttachments ? 'Upload...' : 'Ajouter'}
                </label>
                <input
                  id="attachments-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.html,.htm,image/jpeg,image/png,image/webp"
                  onChange={handleAttachmentUpload}
                  className="hidden"
                />
              </div>

              {attachments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                  Aucune pièce jointe.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {attachments.map(resource => (
                    <AttachmentCard
                      key={resource.id}
                      resource={resource}
                      onDelete={() => handleDeleteAttachment(resource.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRevised"
                checked={form.isRevised}
                onChange={e => setForm(f => ({ ...f, isRevised: e.target.checked }))}
                className="w-4 h-4 rounded accent-green-500"
              />
              <label htmlFor="isRevised" className="text-sm font-medium text-gray-700">
                Cours révisé
              </label>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button type="submit" fullWidth disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/subjects/${detail?.subject.id}`)}
              >
                Annuler
              </Button>
            </div>

            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Supprimer le cours
            </Button>
          </form>
        </main>
      </div>
    </Layout>
  );
};

const getFileLabel = (resource: LessonResource) => {
  if (resource.type === 'IMAGE') return 'Image';
  if (resource.mimeType?.includes('html')) return 'HTML';
  if (resource.mimeType?.includes('pdf')) return 'PDF';
  if (resource.mimeType?.includes('powerpoint') || resource.mimeType?.includes('presentation')) return 'PPT';
  if (resource.mimeType?.includes('word')) return 'Word';
  return 'Document';
};

const isHtmlResource = (resource: LessonResource) =>
  resource.mimeType?.includes('html') || /\.html?$/i.test(resource.url);

const AttachmentCard = ({ resource, onDelete }: { resource: LessonResource; onDelete: () => void }) => {
  const url = `${API_URL}${resource.url}`;
  const handleOpen = () => {
    if (isHtmlResource(resource)) {
      window.open(`/resources/${resource.id}/view`, '_blank', 'noopener');
      return;
    }
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 cursor-pointer"
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
    >
      {resource.type === 'IMAGE' ? (
        <img src={url} alt={resource.title} className="h-28 w-full object-cover" />
      ) : (
        <div className="flex h-28 flex-col items-center justify-center gap-2 bg-white">
          {isHtmlResource(resource)
            ? <FileCode2 className="h-8 w-8 text-emerald-500" />
            : <FileText className="h-8 w-8 text-primary-500" />
          }
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
            {getFileLabel(resource)}
          </span>
        </div>
      )}
      <div className="min-w-0 px-2 py-2">
        <p className="truncate text-xs font-medium text-gray-700">{resource.title}</p>
      </div>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-gray-500 shadow-sm hover:text-red-500"
        aria-label="Supprimer la pièce jointe"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      {resource.type === 'IMAGE' && <ImageIcon className="absolute bottom-8 right-2 h-4 w-4 text-white drop-shadow" />}
    </div>
  );
};
