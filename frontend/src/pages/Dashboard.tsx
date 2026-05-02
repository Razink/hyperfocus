import { useEffect, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, Clock, TrendingUp, Plus, Layers, CalendarClock, PenLine, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../store/auth.store';
import { dashboardService, type DashboardData, type UpcomingExam } from '../services/dashboard.service';
import { exams, SUBJECT_COLORS } from '../data/schedule';

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  if (target.getTime() === today.getTime()) return "Aujourd'hui";
  if (target.getTime() === tomorrow.getTime()) return 'Demain';
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
};

const daysUntil = (iso: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-3 w-24 bg-gray-200 rounded" />
      <div className="w-8 h-8 bg-gray-200 rounded-lg" />
    </div>
    <div className="h-8 w-16 bg-gray-200 rounded" />
  </div>
);

// ── Exam popup ────────────────────────────────────────────────────────────────
const ExamPopup = ({ exam, onClose }: { exam: UpcomingExam; onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const revisedCount = exam.lessons.filter(l => l.isRevised).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div ref={ref} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: exam.subject.color }}
              />
              <span className="text-xs font-medium" style={{ color: exam.subject.color }}>
                {exam.subject.name}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{exam.label}</h3>
            <p className="text-sm text-gray-500">{formatDate(exam.date)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lessons */}
        {exam.lessons.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Aucun cours affecté à ce devoir.</p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2 font-medium">
              {exam.lessons.length} cours · {revisedCount} révisé{revisedCount > 1 ? 's' : ''}
            </p>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {exam.lessons.map(l => (
                <li key={l.id} className="flex items-center gap-2.5">
                  {l.isRevised
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    : <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                  }
                  <span className="text-sm text-gray-700 flex-1 truncate">{l.title}</span>
                  <span className="text-xs text-gray-400 shrink-0">{l.contentPercent}%</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

// ── Urgency badge ─────────────────────────────────────────────────────────────
const UrgencyBadge = ({ days }: { days: number }) => {
  if (days === 0) return <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Aujourd'hui</span>;
  if (days === 1) return <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Demain</span>;
  if (days <= 3) return <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">Dans {days}j</span>;
  return <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Dans {days}j</span>;
};

// ── Main component ────────────────────────────────────────────────────────────
export const Dashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<UpcomingExam | null>(null);

  useEffect(() => {
    dashboardService.getData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const stats = data ? [
    {
      label: 'Matières',
      value: String(data.stats.subjectsCount),
      icon: BookOpen,
      light: 'bg-blue-50 text-blue-600',
      sub: `${data.stats.totalLessons} cours au total`,
    },
    {
      label: 'Cours révisés',
      value: String(data.stats.revisedCount),
      icon: CheckCircle2,
      light: 'bg-green-50 text-green-600',
      sub: data.stats.totalLessons > 0
        ? `${Math.round((data.stats.revisedCount / data.stats.totalLessons) * 100)}% des cours`
        : 'Aucun cours',
    },
    {
      label: 'Révisions cette semaine',
      value: formatDuration(data.stats.revisionMinutesThisWeek),
      icon: Clock,
      light: 'bg-orange-50 text-orange-600',
      sub: 'Séances planifiées',
    },
    {
      label: 'Progression globale',
      value: `${data.stats.globalProgress}%`,
      icon: TrendingUp,
      light: 'bg-purple-50 text-purple-600',
      sub: 'Moyenne sur toutes les matières',
    },
  ] : [];

  const upcomingExams = data?.upcomingExams ?? [];

  const upcomingHomework = (() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return exams
      .filter(e => {
        const d = new Date(e.date + 'T00:00:00');
        return d >= today && d <= in7;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  })();

  return (
    <Layout>
      <div className="px-4 pb-24 pt-5 sm:px-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-display sm:text-3xl">
            Bonjour {user?.name} 👋
          </h2>
          <p className="text-gray-500 mt-1">Voici un résumé de ta progression</p>
        </div>

        {/* ── Upcoming homework ──────────────────────────────────────────────── */}
        {upcomingHomework.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PenLine className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-gray-900">Devoirs à venir — 7 jours</h3>
              </div>
              <Link to="/schedule" className="text-xs text-primary-600 hover:underline">Voir tout</Link>
            </div>
            <div className="space-y-2">
              {upcomingHomework.map((hw, i) => {
                const days = daysUntil(hw.date);
                const colors = SUBJECT_COLORS[hw.subject];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3"
                  >
                    <span
                      className="shrink-0 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colors?.text ?? '#6b7280' }}
                    />
                    <span
                      className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: colors?.bg ?? '#f3f4f6', color: colors?.text ?? '#374151' }}
                    >
                      {hw.subject}
                    </span>
                    {hw.detail && (
                      <span className="text-sm text-gray-500 italic truncate flex-1">{hw.detail}</span>
                    )}
                    <span className="text-xs text-gray-400 shrink-0 ml-auto">
                      {formatDate(hw.date + 'T00:00:00')}
                    </span>
                    <UrgencyBadge days={days} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Upcoming exams ─────────────────────────────────────────────────── */}
        {(loading || upcomingExams.length > 0) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-semibold text-gray-900">Examens à venir — 7 jours</h3>
            </div>

            {loading ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-48 bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                    <div className="h-5 w-16 bg-gray-200 rounded mb-3" />
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {upcomingExams.map(exam => {
                  const days = daysUntil(exam.date);
                  return (
                    <button
                      key={exam.id}
                      onClick={() => setSelectedExam(exam)}
                      className="shrink-0 w-52 text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-gray-200 transition-all group"
                    >
                      {/* Subject dot + name */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: exam.subject.color }}
                        />
                        <span className="text-xs truncate font-medium" style={{ color: exam.subject.color }}>
                          {exam.subject.name}
                        </span>
                      </div>
                      {/* Label */}
                      <p className="text-base font-bold text-gray-900 group-hover:text-gray-700 mb-1">{exam.label}</p>
                      {/* Date */}
                      <p className="text-xs text-gray-500 mb-3">{formatDate(exam.date)}</p>
                      {/* Urgency + lesson count */}
                      <div className="flex items-center justify-between">
                        <UrgencyBadge days={days} />
                        <span className="text-xs text-gray-400">{exam.lessons.length} cours</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map(({ label, value, icon: Icon, light, sub }) => (
              <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-sm text-gray-500 font-medium leading-snug">{label}</span>
                  <span className={`p-2 rounded-lg ${light}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <p className="break-words text-2xl font-bold text-gray-900 font-display sm:text-3xl">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))
          }
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-48 bg-gray-200 rounded" />
                      <div className="h-2.5 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="h-2.5 w-16 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : data?.recentActivity.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune activité pour l'instant</p>
                <Link to="/subjects" className="text-sm text-primary-600 hover:underline mt-1 inline-block">
                  Ajouter des cours →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.subjectColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        <span style={{ color: item.subjectColor }}>{item.subjectName}</span>
                        {' — '}
                        {item.lessonTitle}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.type === 'revised' ? '✓ Cours révisé' : '+ Nouveau cours'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 pt-0.5 sm:pt-0">{timeAgo(item.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Matières</h3>
              <Link to="/subjects" className="text-xs text-primary-600 hover:underline">Voir tout</Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                      <div className="h-3 w-8 bg-gray-200 rounded" />
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : data?.subjectStats.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune matière</p>
                <Link to="/subjects" className="text-sm text-primary-600 hover:underline mt-1 inline-block flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> Ajouter
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.subjectStats.map(s => (
                  <Link key={s.id} to={`/subjects/${s.id}`} className="block group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex items-center gap-1.5 truncate">
                        {s.icon && <span>{s.icon}</span>}
                        <span className="truncate">{s.name}</span>
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{s.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${s.progressPercent}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{s.revisedCount}/{s.lessonsCount} cours révisés</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exam detail popup */}
      {selectedExam && (
        <ExamPopup exam={selectedExam} onClose={() => setSelectedExam(null)} />
      )}
    </Layout>
  );
};
