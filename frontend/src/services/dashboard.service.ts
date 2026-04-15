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

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  subjectStats: SubjectStat[];
}

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/dashboard');
    return response.data;
  },
};
