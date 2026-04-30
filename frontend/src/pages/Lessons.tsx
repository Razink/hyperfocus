import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, Circle, Image as ImageIcon, Upload } from 'lucide-react';
import type { Lesson, SubjectDetail } from '../types';
import { subjectService } from '../services/subject.service';
import { lessonService } from '../services/lesson.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { ProgressBar } from '../components/ProgressBar';
import { Layout } from '../components/Layout';

export const Lessons = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({ title: '', contentPercent: 0 });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  useEffect(() => {
    loadLessons();
  }, [subjectId]);

  const loadLessons = async () => {
    if (!subjectId) return;
    try {
      const result = await subjectService.getLessons(subjectId);
      setData(result);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({ title: lesson.title, contentPercent: lesson.contentPercent });
    } else {
      setEditingLesson(null);
      setFormData({ title: '', contentPercent: 0 });
    }
    setScreenshotFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    try {
      if (editingLesson) {
        await lessonService.update(editingLesson.id, formData);
        if (screenshotFile) {
          setUploadingScreenshot(true);
          await lessonService.uploadScreenshot(editingLesson.id, screenshotFile);
        }
      } else {
        const newLesson = await lessonService.create(subjectId, formData);
        if (screenshotFile) {
          setUploadingScreenshot(true);
          await lessonService.uploadScreenshot(newLesson.id, screenshotFile);
        }
      }
      setIsModalOpen(false);
      loadLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleToggleRevised = async (lessonId: string, currentState: boolean) => {
    try {
      await lessonService.updateRevised(lessonId, !currentState);
      loadLessons();
    } catch (error) {
      console.error('Error toggling revised:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce cours ?')) return;
    try {
      await lessonService.delete(id);
      loadLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  if (loading || !data) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </Layout>
    );
  }

  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <header className="sticky top-16 z-10 border-b border-gray-200 bg-white md:top-0">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate('/subjects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1
            className="break-words text-2xl font-bold font-display sm:text-3xl"
            style={{ color: data.subject.color }}
          >
            {data.subject.name}
          </h1>
          <p className="text-gray-600 text-sm">{data.lessons.length} cours</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="space-y-4">
          {data.lessons.map((lesson) => (
            <Card key={lesson.id} color={data.subject.color}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-shrink-0">
                  {lesson.screenshotUrl ? (
                    <img
                      src={`${API_URL}${lesson.screenshotUrl}`}
                      alt={lesson.title}
                      className="h-40 w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-80 sm:h-24 sm:w-24"
                      onClick={() => window.open(`${API_URL}${lesson.screenshotUrl}`, '_blank')}
                    />
                  ) : (
                    <div className="flex h-28 w-full items-center justify-center rounded-lg bg-gray-100 sm:h-24 sm:w-24">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words text-lg font-semibold text-gray-900">{lesson.title}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(lesson)}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleToggleRevised(lesson.id, lesson.isRevised)}
                        className="transition-colors"
                      >
                        {lesson.isRevised ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <ProgressBar
                      value={lesson.contentPercent}
                      color={data.subject.color}
                      showLabel={false}
                      size="sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium" style={{ color: data.subject.color }}>
                      {lesson.contentPercent}% écrit
                    </span>
                    {lesson.isRevised && lesson.revisedAt && (
                      <span className="text-gray-500 text-xs">
                        Révisé le {new Date(lesson.revisedAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <button
            onClick={() => handleOpenModal()}
            className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
          >
            <Plus className="w-6 h-6 text-gray-400" />
            <span className="text-gray-600 font-medium">Ajouter un cours</span>
          </button>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLesson ? 'Modifier le cours' : 'Nouveau cours'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titre du cours"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Chapitre 1 - Les fractions"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progression : {formData.contentPercent}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.contentPercent}
              onChange={(e) => setFormData({ ...formData, contentPercent: parseInt(e.target.value) })}
              className="w-full"
            />
            <ProgressBar value={formData.contentPercent} color={data.subject.color} showLabel={false} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screenshot
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {screenshotFile ? screenshotFile.name : 'Cliquer pour ajouter une image'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4 sm:flex-row">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} fullWidth>
              Annuler
            </Button>
            <Button type="submit" fullWidth disabled={uploadingScreenshot}>
              {uploadingScreenshot ? 'Upload...' : editingLesson ? 'Modifier' : 'Créer'}
            </Button>
          </div>

          {editingLesson && (
            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={() => {
                handleDelete(editingLesson.id);
                setIsModalOpen(false);
              }}
            >
              Supprimer le cours
            </Button>
          )}
        </form>
      </Modal>
      </div>
    </Layout>
  );
};
