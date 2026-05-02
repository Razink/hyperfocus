import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Edit2, Link2, FileText, Image as ImageIcon, Plus, Trash2,
  GripVertical, ExternalLink, CheckCircle2, Loader2
} from 'lucide-react';
import type { LessonDetail, LessonResource, ResourceType } from '../types';
import { lessonService } from '../services/lesson.service';
import { resourceService } from '../services/resource.service';
import { ProgressBar } from './ProgressBar';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? 'http://localhost:3000';

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt=""
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-1.5"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

// ── File size label ───────────────────────────────────────────────────────────
const fileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
};

// ── Resource item ─────────────────────────────────────────────────────────────
const ResourceItem = ({
  resource,
  onDelete,
  dragHandleProps,
}: {
  resource: LessonResource;
  onDelete: (id: string) => void;
  dragHandleProps: React.HTMLAttributes<HTMLSpanElement>;
}) => {
  const url = resource.url.startsWith('/uploads')
    ? `${API_URL}${resource.url}`
    : resource.url;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 group">
      <span {...dragHandleProps} className="cursor-grab text-gray-300 hover:text-gray-400 shrink-0">
        <GripVertical className="w-4 h-4" />
      </span>

      {resource.type === 'LINK' && (
        <img
          src={`https://www.google.com/s2/favicons?domain=${resource.url}&sz=16`}
          alt=""
          className="w-4 h-4 shrink-0"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      {resource.type === 'DOC' && <FileText className="w-4 h-4 text-blue-500 shrink-0" />}
      {resource.type === 'IMAGE' && <ImageIcon className="w-4 h-4 text-purple-500 shrink-0" />}

      <span className="flex-1 text-sm text-gray-700 truncate">{resource.title}</span>

      {resource.fileSize && (
        <span className="text-xs text-gray-400 shrink-0">{fileSize(resource.fileSize)}</span>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-300 hover:text-gray-500 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <button
        onClick={() => onDelete(resource.id)}
        className="text-gray-300 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ── Resource section ──────────────────────────────────────────────────────────
const ResourceSection = ({
  type,
  label,
  icon: Icon,
  resources,
  lessonId,
  onAdded,
  onDeleted,
  onReordered,
}: {
  type: ResourceType;
  label: string;
  icon: React.ElementType;
  resources: LessonResource[];
  lessonId: string;
  onAdded: (r: LessonResource) => void;
  onDeleted: (id: string) => void;
  onReordered: (ids: string[]) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);
  const [list, setList] = useState(resources);

  useEffect(() => { setList(resources); }, [resources]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await resourceService.addLink(lessonId, { url: linkUrl, title: linkTitle || undefined });
      onAdded(r);
      setLinkUrl(''); setLinkTitle(''); setAdding(false);
    } finally { setLoading(false); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const r = type === 'DOC'
        ? await resourceService.addDoc(lessonId, file)
        : await resourceService.addImage(lessonId, file);
      onAdded(r);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Drag & drop reorder
  const handleDragStart = (idx: number) => { dragIndex.current = idx; };
  const handleDrop = async (idx: number) => {
    if (dragIndex.current === null || dragIndex.current === idx) return;
    const next = [...list];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(idx, 0, moved);
    setList(next);
    dragIndex.current = null;
    const ids = next.map(r => r.id);
    onReordered(ids);
    await resourceService.reorder(lessonId, ids);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <Icon className="w-4 h-4" />
          {label}
        </span>
        <button
          onClick={() => type === 'LINK' ? setAdding(a => !a) : fileRef.current?.click()}
          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Ajouter
        </button>
      </div>

      {/* File input hidden */}
      {(type === 'DOC' || type === 'IMAGE') && (
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept={type === 'DOC' ? '.pdf,.doc,.docx' : 'image/jpeg,image/png,image/webp'}
          onChange={handleFile}
        />
      )}

      {/* Link form */}
      {type === 'LINK' && adding && (
        <form onSubmit={handleAddLink} className="mb-2 flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
          <input
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            required
            className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <input
            type="text"
            placeholder="Libellé (optionnel)"
            value={linkTitle}
            onChange={e => setLinkTitle(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 rounded-md bg-primary-600 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Image gallery */}
      {type === 'IMAGE' && list.length > 0 && (
        <ImageGallery
          resources={list}
          lessonId={lessonId}
          onDeleted={onDeleted}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      )}

      {/* Link / Doc list */}
      {type !== 'IMAGE' && (
        <div className="space-y-1.5">
          {list.map((r, idx) => (
            <div
              key={r.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
            >
              <ResourceItem
                resource={r}
                onDelete={onDeleted}
                dragHandleProps={{}}
              />
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-xs text-gray-400 py-1">Aucun {label.toLowerCase()}</p>
          )}
        </div>
      )}
    </div>
  );
};

// ── Image gallery ─────────────────────────────────────────────────────────────
const ImageGallery = ({
  resources, lessonId, onDeleted, onDragStart, onDrop,
}: {
  resources: LessonResource[];
  lessonId: string;
  onDeleted: (id: string) => void;
  onDragStart: (idx: number) => void;
  onDrop: (idx: number) => void;
}) => {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {resources.map((r, idx) => {
          const src = `${API_URL}${r.url}`;
          return (
            <div
              key={r.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(idx)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => setLightbox(src)}
            >
              <img src={src} alt={r.title} className="h-full w-full object-cover" />
              <button
                onClick={e => { e.stopPropagation(); onDeleted(r.id); }}
                className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
interface LessonModalProps {
  lessonId: string | null;
  subjectColor: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const LessonModal = ({ lessonId, subjectColor, onClose, onUpdated }: LessonModalProps) => {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lessonId) { setDetail(null); return; }
    setLoading(true);
    lessonService.getById(lessonId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => {
    if (!lessonId) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [lessonId, onClose]);

  if (!lessonId) return null;

  const handleResourceAdded = (r: LessonResource) => {
    setDetail(d => d ? { ...d, resources: [...d.resources, r] } : d);
  };

  const handleResourceDeleted = async (id: string) => {
    await resourceService.delete(id);
    setDetail(d => d ? { ...d, resources: d.resources.filter(r => r.id !== id) } : d);
    onUpdated();
  };

  const handleReordered = (ids: string[]) => {
    setDetail(d => {
      if (!d) return d;
      const map = Object.fromEntries(d.resources.map(r => [r.id, r]));
      return { ...d, resources: ids.map(id => map[id]).filter(Boolean) };
    });
  };

  const resourcesByType = (type: ResourceType) =>
    (detail?.resources ?? []).filter(r => r.type === type);

  const color = detail?.subject?.color ?? subjectColor;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-xl">

        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4">
          {loading || !detail ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-6 w-48 bg-gray-200 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-semibold" style={{ color }}>
                    {detail.subject.name}
                  </span>
                  <h2 className="mt-0.5 text-lg font-bold text-gray-900 leading-snug break-words">
                    {detail.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { onClose(); navigate(`/lessons/${lessonId}/edit`); }}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Éditer
                  </button>
                  <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Progress + badges */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar value={detail.contentPercent} color={color} showLabel={false} size="sm" />
                  </div>
                  <span className="text-sm font-semibold shrink-0" style={{ color }}>
                    {detail.contentPercent}% écrit
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {detail.isRevised ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Révisé{detail.revisedAt ? ` le ${new Date(detail.revisedAt).toLocaleDateString('fr-FR')}` : ''}
                    </span>
                  ) : (
                    <span>Non révisé</span>
                  )}
                  <span>·</span>
                  <span>Créé le {new Date(detail.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Body — resource sections */}
        {detail && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <ResourceSection
              type="LINK" label="Liens" icon={Link2}
              resources={resourcesByType('LINK')}
              lessonId={lessonId}
              onAdded={handleResourceAdded}
              onDeleted={handleResourceDeleted}
              onReordered={handleReordered}
            />
            <ResourceSection
              type="DOC" label="Documents" icon={FileText}
              resources={resourcesByType('DOC')}
              lessonId={lessonId}
              onAdded={handleResourceAdded}
              onDeleted={handleResourceDeleted}
              onReordered={handleReordered}
            />
            <ResourceSection
              type="IMAGE" label="Images" icon={ImageIcon}
              resources={resourcesByType('IMAGE')}
              lessonId={lessonId}
              onAdded={handleResourceAdded}
              onDeleted={handleResourceDeleted}
              onReordered={handleReordered}
            />
          </div>
        )}
      </div>
    </div>
  );
};
