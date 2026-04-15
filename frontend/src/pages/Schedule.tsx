import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, BookOpen, Layers, GraduationCap, ChevronLeft, ChevronRight, Plus, Trash2, Clock } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { revisionService, type RevisionSession, type CreateRevisionData } from '../services/revision.service';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

interface Course {
  day: number;
  start: number;
  end: number;
  subject: string;
  teacher: string;
  room: string;
  color: string;
  textColor?: string;
}

interface Exam {
  date: string;
  subject: string;
  detail?: string;
}

export const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  'Histoire-Géo':         { bg: '#ffedd5', text: '#c2410c' },
  'Éducation civique':    { bg: '#cffafe', text: '#0e7490' },
  'Physique':             { bg: '#dcfce7', text: '#15803d' },
  'SVT':                  { bg: '#d1fae5', text: '#065f46' },
  'Mathématiques':        { bg: '#dbeafe', text: '#1d4ed8' },
  'Français':             { bg: '#ede9fe', text: '#6d28d9' },
  'Anglais':              { bg: '#fce7f3', text: '#be185d' },
  'Éducation Islamique':  { bg: '#f5f3ff', text: '#5b21b6' },
  'Arabe':                { bg: '#fff7ed', text: '#9a3412' },
  'Physique / SVT':       { bg: '#dcfce7', text: '#15803d' },
  'Info / Techno':        { bg: '#e0f2fe', text: '#0369a1' },
  'Éducation Artistique': { bg: '#fef9c3', text: '#b45309' },
  'Musique':              { bg: '#fdf2f8', text: '#9d174d' },
  'EPS':                  { bg: '#fee2e2', text: '#b91c1c' },
  'Technique':            { bg: '#f1f5f9', text: '#475569' },
};

const SUBJECT_NAMES = Object.keys(SUBJECT_COLORS);

const c = (subject: string) => ({
  color: SUBJECT_COLORS[subject]?.bg ?? '#f3f4f6',
  textColor: SUBJECT_COLORS[subject]?.text ?? '#374151',
});

const courses: Course[] = [
  { day: 1, start: 8,  end: 9,  subject: 'Histoire-Géo',       teacher: '', room: '', ...c('Histoire-Géo') },
  { day: 1, start: 9,  end: 10, subject: 'Éducation civique',   teacher: '', room: '', ...c('Éducation civique') },
  { day: 1, start: 10, end: 11, subject: 'Physique',            teacher: '', room: '', ...c('Physique') },
  { day: 1, start: 11, end: 12, subject: 'SVT',                 teacher: '', room: '', ...c('SVT') },
  { day: 2, start: 8,  end: 9,  subject: 'Éducation Islamique', teacher: '', room: '', ...c('Éducation Islamique') },
  { day: 2, start: 10, end: 12, subject: 'Arabe',               teacher: '', room: '', ...c('Arabe') },
  { day: 2, start: 13, end: 15, subject: 'Physique / SVT',      teacher: '', room: 'alternance', ...c('Physique / SVT') },
  { day: 3, start: 8,  end: 9,  subject: 'Arabe',               teacher: '', room: '', ...c('Arabe') },
  { day: 3, start: 9,  end: 10, subject: 'Anglais',             teacher: '', room: '', ...c('Anglais') },
  { day: 3, start: 10, end: 12, subject: 'Français',            teacher: '', room: '', ...c('Français') },
  { day: 3, start: 12, end: 13, subject: 'Histoire-Géo',        teacher: '', room: '', ...c('Histoire-Géo') },
  { day: 3, start: 14, end: 16, subject: 'Mathématiques',       teacher: '', room: '', ...c('Mathématiques') },
  { day: 4, start: 8,  end: 10, subject: 'Info / Techno',        teacher: '', room: 'alternance', ...c('Info / Techno') },
  { day: 4, start: 10, end: 12, subject: 'EPS',                  teacher: '', room: '', ...c('EPS') },
  { day: 4, start: 13, end: 15, subject: 'Anglais',              teacher: '', room: '', ...c('Anglais') },
  { day: 4, start: 15, end: 16, subject: 'Éducation Artistique', teacher: '', room: '', ...c('Éducation Artistique') },
  { day: 5, start: 8,  end: 10, subject: 'Mathématiques',        teacher: '', room: '', ...c('Mathématiques') },
  { day: 5, start: 10, end: 12, subject: 'Arabe',                teacher: '', room: '', ...c('Arabe') },
  { day: 5, start: 13, end: 14, subject: 'Musique',              teacher: '', room: '', ...c('Musique') },
  { day: 5, start: 14, end: 16, subject: 'Français',             teacher: '', room: '', ...c('Français') },
];

const exams: Exam[] = [
  { date: '2026-04-15', subject: 'Histoire-Géo',        detail: 'Géographie' },
  { date: '2026-04-20', subject: 'Éducation civique',   detail: '' },
  { date: '2026-04-21', subject: 'Arabe',               detail: 'Expression écrite' },
  { date: '2026-04-22', subject: 'Mathématiques',       detail: '' },
  { date: '2026-04-24', subject: 'Arabe',               detail: 'Étude de texte' },
  { date: '2026-04-28', subject: 'Éducation Islamique', detail: '' },
  { date: '2026-04-28', subject: 'SVT',                 detail: '' },
  { date: '2026-04-29', subject: 'Français',            detail: '' },
  { date: '2026-04-30', subject: 'Anglais',             detail: '' },
  { date: '2026-05-05', subject: 'Physique',            detail: '' },
  { date: '2026-05-07', subject: 'Technique',           detail: '' },
];

const getSubjectSlot = (subject: string): { start: number; end: number } | null => {
  const match = courses.find(c =>
    c.subject === subject ||
    c.subject.includes(subject) ||
    subject.includes(c.subject)
  );
  return match ? { start: match.start, end: match.end } : null;
};

const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

const daysUntil = (iso: string) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(iso + 'T00:00:00');
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

const hourToCol = (h: number) => h - 8 + 2;

// ─── Week helpers ──────────────────────────────
const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (d: Date, n: number): Date => {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
};

const toISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const formatShortDate = (d: Date): string =>
  d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

// ─── Week navigation header ──────────────────────
const WeekNav = ({ weekStart, onPrev, onNext, onToday }: {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) => {
  const weekEnd = addDays(weekStart, 4);
  return (
    <div className="flex items-center gap-3 mb-4">
      <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      <button onClick={onToday} className="px-3 py-1 text-xs font-medium rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">
        Aujourd'hui
      </button>
      <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
      <p className="text-sm text-gray-500 font-medium">
        Semaine du {formatShortDate(weekStart)} au {formatShortDate(weekEnd)}
      </p>
    </div>
  );
};

// ─── Timetable view ──────────────────────────────
const Timetable = ({ showExams = false, weekStart }: { showExams?: boolean; weekStart?: Date }) => {
  const today = new Date().getDay();

  // Filter exams: if weekStart provided, only show exams for that week
  const visibleExams = showExams
    ? (weekStart
        ? exams.filter(e => {
            const d = new Date(e.date + 'T00:00:00');
            const weekEnd = addDays(weekStart, 4);
            return d >= weekStart && d <= weekEnd;
          })
        : exams)
    : [];

  const examsByWeekday: Record<number, (Exam & { _slot: { start: number; end: number } })[]> = {};
  visibleExams.forEach(e => {
    const d = new Date(e.date + 'T00:00:00');
    const slot = getSubjectSlot(e.subject);
    if (!slot) return;
    const wd = d.getDay();
    if (wd < 1 || wd > 5) return;
    if (!examsByWeekday[wd]) examsByWeekday[wd] = [];
    examsByWeekday[wd].push({ ...e, _slot: slot });
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <div
        className="grid min-w-[900px]"
        style={{
          gridTemplateColumns: '80px repeat(10, 1fr)',
          gridTemplateRows: '40px repeat(5, 80px)',
        }}
      >
        <div className="border-b border-r border-gray-100 bg-gray-50" />
        {HOURS.map(hour => (
          <div key={hour} className="border-b border-r border-gray-100 bg-gray-50 flex items-center justify-start pl-2 last:border-r-0">
            <span className="text-xs font-semibold text-gray-500">{hour}h</span>
          </div>
        ))}

        {DAYS.map((day, di) => {
          const isToday = today === di + 1;
          return (
            <React.Fragment key={`row-${di}`}>
              <div
                className={`border-b border-r border-gray-100 flex flex-col items-center justify-center px-1 gap-0.5 ${isToday ? 'bg-primary-50' : 'bg-gray-50'}`}
                style={{ gridRow: di + 2, gridColumn: 1 }}
              >
                <p className={`text-xs font-bold ${isToday ? 'text-primary-600' : 'text-gray-600'}`}>{day}</p>
                {isToday && <span className="text-xs bg-primary-600 text-white rounded-full px-1.5 py-0.5">auj.</span>}
              </div>
              {HOURS.map((_, hi) => (
                <div
                  key={`cell-${di}-${hi}`}
                  className={`border-b border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-primary-50/20' : ''}`}
                  style={{ gridRow: di + 2, gridColumn: hi + 2 }}
                />
              ))}
            </React.Fragment>
          );
        })}

        {courses.map((course, i) => (
          <div
            key={i}
            className="rounded-lg m-0.5 p-2 flex flex-col justify-between overflow-hidden cursor-pointer hover:brightness-95 transition-all"
            style={{
              gridRow: course.day + 1,
              gridColumn: `${hourToCol(course.start)} / ${hourToCol(course.end)}`,
              backgroundColor: course.color,
              color: course.textColor,
              zIndex: 10,
            }}
          >
            <p className="text-xs font-bold leading-tight truncate">{course.subject}</p>
            {course.room && <p className="text-xs opacity-60 truncate">{course.room}</p>}
            <span className="text-xs opacity-60 shrink-0">{course.start}h–{course.end}h</span>
          </div>
        ))}

        {showExams && Object.entries(examsByWeekday).map(([wd, dayExams]) =>
          dayExams.map((exam, i) => (
            <div
              key={`exam-${wd}-${i}`}
              className="rounded-lg m-0.5 p-1.5 flex flex-col justify-between overflow-hidden border-2 border-red-500 cursor-pointer"
              style={{
                gridRow: Number(wd) + 1,
                gridColumn: `${hourToCol(exam._slot.start)} / ${hourToCol(exam._slot.end)}`,
                backgroundColor: 'rgba(254,226,226,0.92)',
                color: '#b91c1c',
                zIndex: 20,
              }}
              title={exam.detail || exam.subject}
            >
              <p className="text-xs font-bold leading-tight truncate">📝 {exam.subject}</p>
              {exam.detail && <p className="text-xs opacity-75 truncate">{exam.detail}</p>}
              <span className="text-xs opacity-70">{exam._slot.start}h–{exam._slot.end}h</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Exam list view ──────────────────────────────
const ExamList = () => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = exams.filter(e => new Date(e.date + 'T00:00:00') >= today);
  const past = exams.filter(e => new Date(e.date + 'T00:00:00') < today);

  const ExamCard = ({ exam }: { exam: Exam }) => {
    const diff = daysUntil(exam.date);
    const isPast = diff < 0;
    const isToday = diff === 0;
    const isSoon = diff > 0 && diff <= 7;
    const bg = SUBJECT_COLORS[exam.subject]?.bg ?? '#f3f4f6';
    const text = SUBJECT_COLORS[exam.subject]?.text ?? '#374151';

    return (
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
          isPast ? 'opacity-50 bg-gray-50 border-gray-200' :
          isToday ? 'border-red-400 bg-red-50 shadow-sm' :
          isSoon ? 'border-orange-300 bg-orange-50 shadow-sm' :
          'border-gray-100 bg-white shadow-sm'
        }`}
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: text }} />
        <div className="w-44 shrink-0">
          <p className="text-sm font-semibold text-gray-700 capitalize">{formatDate(exam.date)}</p>
          {!isPast && (
            <p className={`text-xs font-medium ${isToday ? 'text-red-600' : isSoon ? 'text-orange-600' : 'text-gray-400'}`}>
              {isToday ? "Aujourd'hui !" : `Dans ${diff} jour${diff > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: bg, color: text }}>
          {exam.subject}
        </span>
        {exam.detail && <span className="text-sm text-gray-500 italic">{exam.detail}</span>}
        {(() => {
          const slot = getSubjectSlot(exam.subject);
          return slot ? (
            <span className="text-xs text-gray-400 ml-auto shrink-0">{slot.start}h–{slot.end}h</span>
          ) : null;
        })()}
        {isPast && <span className="text-gray-400 text-sm shrink-0">✓ passé</span>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          À venir — {upcoming.length} examen{upcoming.length > 1 ? 's' : ''}
        </h3>
        <div className="space-y-2">
          {upcoming.length === 0
            ? <p className="text-gray-400 text-sm">Aucun examen à venir.</p>
            : upcoming.map((e, i) => <ExamCard key={i} exam={e} />)
          }
        </div>
      </div>
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Passés</h3>
          <div className="space-y-2">
            {past.map((e, i) => <ExamCard key={i} exam={e} />)}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Revision view (4th tab) ─────────────────────
const RevisionView = () => {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<RevisionSession | null>(null);

  // Form state
  const [formSubject, setFormSubject] = useState(SUBJECT_NAMES[0]);
  const [formDate, setFormDate] = useState('');
  const [formUseTime, setFormUseTime] = useState(false);
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formDuration, setFormDuration] = useState(120);
  const [formNotes, setFormNotes] = useState('');

  const weekEnd = addDays(weekStart, 6);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await revisionService.getByWeek(toISO(weekStart), toISO(weekEnd));
      setSessions(data);
    } catch (err) {
      console.error('Failed to load revisions', err);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const prevWeek = () => setWeekStart(prev => addDays(prev, -7));
  const nextWeek = () => setWeekStart(prev => addDays(prev, 7));
  const goToday = () => setWeekStart(getMonday(new Date()));

  // Get week dates (Mon-Fri)
  const weekDates = DAYS.map((_, i) => addDays(weekStart, i));

  // Get exams for this week
  const weekExams = exams.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d >= weekStart && d <= weekEnd;
  });

  // Group exams by weekday index
  const examsByDay: Record<number, Exam[]> = {};
  weekExams.forEach(e => {
    const d = new Date(e.date + 'T00:00:00');
    const wd = d.getDay(); // 0=Sun, 1=Mon...
    const dayIdx = wd - 1; // 0=Mon
    if (dayIdx < 0 || dayIdx > 4) return;
    if (!examsByDay[dayIdx]) examsByDay[dayIdx] = [];
    examsByDay[dayIdx].push(e);
  });

  // Group sessions by weekday index
  const sessionsByDay: Record<number, RevisionSession[]> = {};
  sessions.forEach(s => {
    const d = new Date(s.date + 'T00:00:00');
    const wd = d.getDay();
    const dayIdx = wd - 1;
    if (dayIdx < 0 || dayIdx > 4) return;
    if (!sessionsByDay[dayIdx]) sessionsByDay[dayIdx] = [];
    sessionsByDay[dayIdx].push(s);
  });

  // Weekend sessions
  const weekendSessions = sessions.filter(s => {
    const d = new Date(s.date + 'T00:00:00');
    const wd = d.getDay();
    return wd === 0 || wd === 6;
  });

  const openAddModal = (dayIdx?: number) => {
    setEditingSession(null);
    setFormSubject(SUBJECT_NAMES[0]);
    setFormDate(dayIdx !== undefined ? toISO(weekDates[dayIdx]) : toISO(weekStart));
    setFormUseTime(false);
    setFormStartTime('14:00');
    setFormDuration(120);
    setFormNotes('');
    setModalOpen(true);
  };

  const openEditModal = (session: RevisionSession) => {
    setEditingSession(session);
    setFormSubject(session.subject);
    setFormDate(session.date);
    setFormUseTime(!!session.startTime);
    setFormStartTime(session.startTime || '14:00');
    setFormDuration(session.duration);
    setFormNotes(session.notes || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload: CreateRevisionData = {
      date: formDate,
      startTime: formUseTime ? formStartTime : null,
      duration: formDuration,
      subject: formSubject,
      notes: formNotes || null,
    };

    try {
      if (editingSession) {
        await revisionService.update(editingSession.id, payload);
      } else {
        await revisionService.create(payload);
      }
      setModalOpen(false);
      fetchSessions();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await revisionService.delete(id);
      fetchSessions();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const SessionCard = ({ session }: { session: RevisionSession }) => {
    const colors = SUBJECT_COLORS[session.subject];
    const bg = colors?.bg ?? '#f3f4f6';
    const text = colors?.text ?? '#374151';
    const hours = Math.floor(session.duration / 60);
    const mins = session.duration % 60;
    const durationLabel = hours > 0
      ? mins > 0 ? `${hours}h${String(mins).padStart(2, '0')}` : `${hours}h`
      : `${mins}min`;

    return (
      <div
        className="rounded-lg p-2 border cursor-pointer hover:brightness-95 transition-all group relative"
        style={{ backgroundColor: bg, borderColor: text + '40', color: text }}
        onClick={() => openEditModal(session)}
      >
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-bold leading-tight truncate">{session.subject}</p>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/50 transition-all shrink-0"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        {session.lesson && (
          <p className="text-xs opacity-70 truncate">{session.lesson.title}</p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 opacity-60" />
          <span className="text-xs opacity-70">
            {session.startTime ? `${session.startTime} · ` : ''}{durationLabel}
          </span>
        </div>
        {session.notes && (
          <p className="text-xs opacity-60 truncate mt-0.5 italic">{session.notes}</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <WeekNav weekStart={weekStart} onPrev={prevWeek} onNext={nextWeek} onToday={goToday} />

      {/* Week grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-5 divide-x divide-gray-100">
          {DAYS.map((day, di) => {
            const date = weekDates[di];
            const iso = toISO(date);
            const isToday = iso === toISO(today);
            const dayExams = examsByDay[di] || [];
            const daySessions = sessionsByDay[di] || [];

            return (
              <div key={di} className={`min-h-[280px] flex flex-col ${isToday ? 'bg-primary-50/30' : ''}`}>
                {/* Day header */}
                <div className={`px-3 py-2.5 border-b border-gray-100 text-center ${isToday ? 'bg-primary-50' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-bold ${isToday ? 'text-primary-600' : 'text-gray-600'}`}>{day}</p>
                  <p className={`text-lg font-semibold ${isToday ? 'text-primary-700' : 'text-gray-800'}`}>
                    {date.getDate()}
                  </p>
                  <p className="text-xs text-gray-400">{date.toLocaleDateString('fr-FR', { month: 'short' })}</p>
                </div>

                {/* Content */}
                <div className="flex-1 p-2 space-y-2">
                  {/* Exams for this day */}
                  {dayExams.map((exam, i) => {
                    const colors = SUBJECT_COLORS[exam.subject];
                    return (
                      <div
                        key={`exam-${i}`}
                        className="rounded-lg p-2 border-2 border-red-400"
                        style={{ backgroundColor: 'rgba(254,226,226,0.85)', color: '#b91c1c' }}
                      >
                        <p className="text-xs font-bold truncate">📝 {exam.subject}</p>
                        {exam.detail && <p className="text-xs opacity-75 truncate">{exam.detail}</p>}
                        {(() => {
                          const slot = getSubjectSlot(exam.subject);
                          return slot ? <span className="text-xs opacity-60">{slot.start}h–{slot.end}h</span> : null;
                        })()}
                      </div>
                    );
                  })}

                  {/* Revision sessions */}
                  {daySessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}

                  {/* Add button */}
                  <button
                    onClick={() => openAddModal(di)}
                    className="w-full py-1.5 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-all flex items-center justify-center gap-1 text-xs"
                  >
                    <Plus className="w-3 h-3" /> Révision
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekend sessions if any */}
      {weekendSessions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Weekend</h3>
          <div className="grid grid-cols-2 gap-2">
            {weekendSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Séances cette semaine</p>
              <p className="text-2xl font-bold text-gray-800">{sessions.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Temps total</p>
              <p className="text-2xl font-bold text-primary-600">
                {Math.floor(sessions.reduce((s, r) => s + r.duration, 0) / 60)}h
                {sessions.reduce((s, r) => s + r.duration, 0) % 60 > 0 &&
                  String(sessions.reduce((s, r) => s + r.duration, 0) % 60).padStart(2, '0')
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Matières</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(sessions.map(s => s.subject)).size}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-400 text-sm mt-4">Chargement...</div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSession ? 'Modifier la séance' : 'Nouvelle séance de révision'}>
        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
            <select
              value={formSubject}
              onChange={e => setFormSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {SUBJECT_NAMES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <Input
            label="Date"
            type="date"
            value={formDate}
            onChange={e => setFormDate(e.target.value)}
            required
          />

          {/* Time toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formUseTime}
                onChange={e => setFormUseTime(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Préciser un créneau horaire</span>
            </label>
          </div>

          {/* Start time (conditional) */}
          {formUseTime && (
            <Input
              label="Heure de début"
              type="time"
              value={formStartTime}
              onChange={e => setFormStartTime(e.target.value)}
            />
          )}

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
            <div className="flex gap-2 flex-wrap">
              {[30, 60, 90, 120, 150, 180].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    formDuration === d
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d >= 60 ? `${d / 60}h${d % 60 > 0 ? String(d % 60).padStart(2, '0') : ''}` : `${d}min`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
            <textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Ex: Revoir le chapitre 3..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button fullWidth onClick={handleSave}>
              {editingSession ? 'Enregistrer' : 'Ajouter'}
            </Button>
            <Button fullWidth variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Combined view with week navigation ──────────
const CombinedView = () => {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  return (
    <div>
      <WeekNav
        weekStart={weekStart}
        onPrev={() => setWeekStart(prev => addDays(prev, -7))}
        onNext={() => setWeekStart(prev => addDays(prev, 7))}
        onToday={() => setWeekStart(getMonday(new Date()))}
      />
      <Timetable showExams weekStart={weekStart} />
    </div>
  );
};

// ─── Main component ──────────────────────────────
type Tab = 'timetable' | 'exams' | 'combined' | 'revisions';

const tabs: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: 'timetable',  label: 'Emploi du temps', icon: CalendarDays },
  { id: 'exams',      label: 'Examens',          icon: BookOpen },
  { id: 'combined',   label: 'Vue combinée',     icon: Layers },
  { id: 'revisions',  label: 'Révisions',        icon: GraduationCap },
];

export const Schedule = () => {
  const [activeTab, setActiveTab] = useState<Tab>('timetable');

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-display">Emploi du temps</h2>
          <p className="text-gray-500 mt-1">
            {activeTab === 'revisions'
              ? 'Planifie tes séances de révision'
              : 'Semaine du 14 au 18 avril 2026'
            }
          </p>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'timetable' && <Timetable />}
        {activeTab === 'exams'     && <ExamList />}
        {activeTab === 'combined'  && <CombinedView />}
        {activeTab === 'revisions' && <RevisionView />}
      </div>
    </Layout>
  );
};
