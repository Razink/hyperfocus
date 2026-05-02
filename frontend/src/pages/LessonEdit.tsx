import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ProgressBar } from '../components/ProgressBar';
import { lessonService } from '../services/lesson.service';
import type { LessonDetail } from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? 'http://localhost:3000';

export const LessonEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', contentPercent: 0, isRevised: false });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    lessonService.getById(id).then(d => {
      setDetail(d);
      setForm({ title: d.title, contentPercent: d.contentPercent, isRevised: d.isRevised });
      if (d.screenshotUrl) setScreenshotPreview(`${API_URL}${d.screenshotUrl}`);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await lessonService.update(id, form);
      if (screenshotFile) await lessonService.uploadScreenshot(id, screenshotFile);
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

  const color = detail?.subject?.color ?? '#6366f1';

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

            {/* Cover screenshot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de couverture
              </label>
              {screenshotPreview ? (
                <div className="relative w-32">
                  <img
                    src={screenshotPreview}
                    alt="Cover"
                    className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                  >
                    <Upload className="w-5 h-5 text-white" />
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="cover-upload"
                  className="flex w-32 h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-400">Ajouter</span>
                </label>
              )}
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
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
