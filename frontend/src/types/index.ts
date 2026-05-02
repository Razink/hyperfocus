export interface User {
  id: string;
  username?: string;
  name: string;
  email?: string;
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

export type ResourceType = 'LINK' | 'DOC' | 'IMAGE';

export interface LessonResource {
  id: string;
  lessonId: string;
  type: ResourceType;
  title: string;
  url: string;
  mimeType?: string;
  fileSize?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentResource {
  id: string;
  assessmentId: string;
  type: ResourceType;
  title: string;
  url: string;
  mimeType?: string;
  fileSize?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  subjectId?: string;
  title: string;
  order: number;
  trimester: number;
  color: string;
  contentPercent: number;
  screenshotUrl?: string;
  isRevised: boolean;
  revisedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonDetail extends Lesson {
  subject: { id: string; name: string; color: string };
  resources: LessonResource[];
}

export interface SubjectDetail {
  subject: {
    id: string;
    name: string;
    color: string;
  };
  lessons: Lesson[];
}

export interface AssessmentLesson {
  id: string;
  title: string;
  contentPercent: number;
  isRevised: boolean;
}

export interface Assessment {
  id: string;
  subjectId: string;
  trimester: number;
  kind: string;
  date?: string;
  isPast: boolean;
  lessons: { lesson: AssessmentLesson }[];
  resources?: AssessmentResource[];
}

export interface AssessmentGrouped {
  subject: { id: string; name: string; color: string };
  grouped: Record<number, Assessment[]>;
}

export interface AuthResponse {
  user: User;
  token: string;
}
