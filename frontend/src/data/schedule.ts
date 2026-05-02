export interface Exam {
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

export const exams: Exam[] = [
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
