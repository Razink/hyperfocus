import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, CheckCircle2, LogOut } from 'lucide-react';
import type { Subject } from '../types';
import { subjectService } from '../services/subject.service';
import { useAuthStore } from '../store/auth.store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { ProgressBar } from '../components/ProgressBar';

const COLORS = [
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#a855f7' },
  { name: 'Rose', value: '#ec4899' },
];

export const Subjects = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: '', color: COLORS[0].value, icon: '' });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({ name: subject.name, color: subject.color, icon: subject.icon || '' });
    } else {
      setEditingSubject(null);
      setFormData({ name: '', color: COLORS[0].value, icon: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await subjectService.update(editingSubject.id, formData);
      } else {
        await subjectService.create(formData);
      }
      setIsModalOpen(false);
      loadSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette matière et tous ses cours ?')) return;
    try {
      await subjectService.delete(id);
      loadSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Mes Matières</h1>
            <p className="text-gray-600 text-sm">Bonjour {user?.name} 👋</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              color={subject.color}
              onClick={() => navigate(`/subjects/${subject.id}`)}
              className="relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {subject.icon && <span className="text-2xl">{subject.icon}</span>}
                  <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(subject);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✎
                </button>
              </div>

              <ProgressBar
                value={subject.progressPercent}
                color={subject.color}
                showLabel={false}
              />

              <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{subject.lessonsCount} cours</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{subject.revisedCount}/{subject.lessonsCount} révisés</span>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-lg font-semibold" style={{ color: subject.color }}>
                  {subject.progressPercent}%
                </span>
              </div>
            </Card>
          ))}

          <button
            onClick={() => handleOpenModal()}
            className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
          >
            <Plus className="w-8 h-8 text-gray-400" />
            <span className="text-gray-600 font-medium">Ajouter une matière</span>
          </button>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Modifier la matière' : 'Nouvelle matière'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom de la matière"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Mathématiques"
            required
          />

          <Input
            label="Icône (optionnel)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="📐"
            maxLength={2}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    formData.color === color.value ? 'border-gray-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} fullWidth>
              Annuler
            </Button>
            <Button type="submit" fullWidth>
              {editingSubject ? 'Modifier' : 'Créer'}
            </Button>
          </div>

          {editingSubject && (
            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={() => {
                handleDelete(editingSubject.id);
                setIsModalOpen(false);
              }}
            >
              Supprimer la matière
            </Button>
          )}
        </form>
      </Modal>
    </div>
  );
};
