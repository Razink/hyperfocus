export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'ELEVE' | 'PARENT';
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  lessonsCount: number;
  progressPercent: number;
  revisedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  contentPercent: number;
  screenshotUrl?: string;
  isRevised: boolean;
  revisedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectDetail {
  subject: {
    id: string;
    name: string;
    color: string;
  };
  lessons: Lesson[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
