import api from './api';

export interface DashboardStats {
  subjectsCount: number;
  totalLessons: number;
  revisedCount: number;
  globalProgress: number;
  revisionMinutesThisWeek: number;
}

export interface ActivityItem {
  type: 'revised' | 'created';
  lessonTitle: string;
  subjectName: string;
  subjectColor: string;
  date: string;
}

export interface SubjectStat {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  lessonsCount: number;
  revisedCount: number;
  progressPercent: number;
}

export interface UpcomingLesson {
  id: string;
  title: string;
  contentPercent: number;
  isRevised: boolean;
}

export interface UpcomingExam {
  id: string;
  label: string;
  trimester: number;
  kind: string;
  date: string;
  subject: { id: string; name: string; color: string };
  lessons: UpcomingLesson[];
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  subjectStats: SubjectStat[];
  upcomingExams: UpcomingExam[];
}

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/dashboard');
    return response.data;
  },
};
