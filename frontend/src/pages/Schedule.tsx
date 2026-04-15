import React, { useState } from 'react';
import { CalendarDays, BookOpen, Layers } from 'lucide-react';
import { Layout } from '../components/Layout';

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
  date: string;       // ISO YYYY-MM-DD
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

const c = (subject: string) => ({
  color: SUBJECT_COLORS[subject]?.bg ?? '#f3f4f6',
  textColor: SUBJECT_COLORS[subject]?.text ?? '#374151',
});

const courses: Course[] = [
  // Lundi
  { day: 1, start: 8,  end: 9,  subject: 'Histoire-Géo',       teacher: '', room: '', ...c('Histoire-Géo') },
  { day: 1, start: 9,  end: 10, subject: 'Éducation civique',   teacher: '', room: '', ...c('Éducation civique') },
  { day: 1, start: 10, end: 11, subject: 'Physique',            teacher: '', room: '', ...c('Physique') },
  { day: 1, start: 11, end: 12, subject: 'SVT',                 teacher: '', room: '', ...c('SVT') },

  // Mardi
  { day: 2, start: 8,  end: 9,  subject: 'Éducation Islamique', teacher: '', room: '', ...c('Éducation Islamique') },
  { day: 2, start: 10, end: 12, subject: 'Arabe',               teacher: '', room: '', ...c('Arabe') },
  { day: 2, start: 13, end: 15, subject: 'Physique / SVT',      teacher: '', room: 'alternance', ...c('Physique / SVT') },

  // Mercredi
  { day: 3, start: 8,  end: 9,  subject: 'Arabe',               teacher: '', room: '', ...c('Arabe') },
  { day: 3, start: 9,  end: 10, subject: 'Anglais',             teacher: '', room: '', ...c('Anglais') },
  { day: 3, start: 10, end: 12, subject: 'Français',            teacher: '', room: '', ...c('Français') },
  { day: 3, start: 12, end: 13, subject: 'Histoire-Géo',        teacher: '', room: '', ...c('Histoire-Géo') },
  { day: 3, start: 14, end: 16, subject: 'Mathématiques',       teacher: '', room: '', ...c('Mathématiques') },

  // Jeudi
  { day: 4, start: 8,  end: 10, subject: 'Info / Techno',        teacher: '', room: 'alternance', ...c('Info / Techno') },
  { day: 4, start: 10, end: 12, subject: 'EPS',                  teacher: '', room: '', ...c('EPS') },
  { day: 4, start: 13, end: 15, subject: 'Anglais',              teacher: '', room: '', ...c('Anglais') },
  { day: 4, start: 15, end: 16, subject: 'Éducation Artistique', teacher: '', room: '', ...c('Éducation Artistique') },

  // Vendredi
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

// Retourne le premier créneau de la matière dans l'emploi du temps
const getSubjectSlot = (subject: string): { start: number; end: number } | null => {
  // Normalise "Physique / SVT" → cherche aussi Physique et SVT séparément
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

// hour → grid column (col1=day label, col2=8h … col11=17h)
const hourToCol = (h: number) => h - 8 + 2;

// ─────────────────────────────────────────────
// Sub-views
// ─────────────────────────────────────────────

const Timetable = ({ showExams = false }: { showExams?: boolean }) => {
  const today = new Date().getDay();
  // Map exams to their weekday index (1=Lundi…5=Vendredi) — only upcoming
  const examsByWeekday: Record<number, Exam[]> = {};
  exams.forEach(e => {
    const d = new Date(e.date + 'T00:00:00');
    const slot = getSubjectSlot(e.subject);
    if (!slot) return;
    const wd = d.getDay(); // 1=Mon…5=Fri
    if (wd < 1 || wd > 5) return;
    if (!examsByWeekday[wd]) examsByWeekday[wd] = [];
    examsByWeekday[wd].push({ ...e, _slot: slot } as any);
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
        {/* Corner */}
        <div className="border-b border-r border-gray-100 bg-gray-50" />

        {/* Hour labels */}
        {HOURS.map(hour => (
          <div key={hour} className="border-b border-r border-gray-100 bg-gray-50 flex items-center justify-start pl-2 last:border-r-0">
            <span className="text-xs font-semibold text-gray-500">{hour}h</span>
          </div>
        ))}

        {/* Day rows */}
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

        {/* Courses */}
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

        {/* Exam overlays (vue combinée) */}
        {showExams && Object.entries(examsByWeekday).map(([wd, dayExams]) =>
          dayExams.map((exam: any, i: number) => {
            const slot = exam._slot;
            return (
              <div
                key={`exam-${wd}-${i}`}
                className="rounded-lg m-0.5 p-1.5 flex flex-col justify-between overflow-hidden border-2 border-red-500 cursor-pointer"
                style={{
                  gridRow: Number(wd) + 1,
                  gridColumn: `${hourToCol(slot.start)} / ${hourToCol(slot.end)}`,
                  backgroundColor: 'rgba(254,226,226,0.92)',
                  color: '#b91c1c',
                  zIndex: 20,
                }}
                title={exam.detail || exam.subject}
              >
                <p className="text-xs font-bold leading-tight truncate">📝 {exam.subject}</p>
                {exam.detail && <p className="text-xs opacity-75 truncate">{exam.detail}</p>}
                <span className="text-xs opacity-70">{slot.start}h–{slot.end}h</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

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
        {/* Color dot */}
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: text }} />

        {/* Date */}
        <div className="w-44 shrink-0">
          <p className="text-sm font-semibold text-gray-700 capitalize">{formatDate(exam.date)}</p>
          {!isPast && (
            <p className={`text-xs font-medium ${isToday ? 'text-red-600' : isSoon ? 'text-orange-600' : 'text-gray-400'}`}>
              {isToday ? "Aujourd'hui !" : `Dans ${diff} jour${diff > 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* Subject pill */}
        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: bg, color: text }}>
          {exam.subject}
        </span>

        {/* Detail */}
        {exam.detail && <span className="text-sm text-gray-500 italic">{exam.detail}</span>}

        {/* Hour */}
        {(() => {
          const slot = getSubjectSlot(exam.subject);
          return slot ? (
            <span className="text-xs text-gray-400 ml-auto shrink-0">{slot.start}h–{slot.end}h</span>
          ) : null;
        })()}

        {/* Past check */}
        {isPast && <span className="text-gray-400 text-sm shrink-0">✓ passé</span>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upcoming */}
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

      {/* Past */}
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

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

type Tab = 'timetable' | 'exams' | 'combined';

const tabs: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: 'timetable', label: 'Emploi du temps', icon: CalendarDays },
  { id: 'exams',     label: 'Examens',          icon: BookOpen },
  { id: 'combined',  label: 'Vue combinée',     icon: Layers },
];

export const Schedule = () => {
  const [activeTab, setActiveTab] = useState<Tab>('timetable');

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-display">Emploi du temps</h2>
          <p className="text-gray-500 mt-1">Semaine du 14 au 18 avril 2026</p>
        </div>

        {/* Tabs */}
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

        {/* Content */}
        {activeTab === 'timetable' && <Timetable />}
        {activeTab === 'exams'     && <ExamList />}
        {activeTab === 'combined'  && <Timetable showExams />}
      </div>
    </Layout>
  );
};
