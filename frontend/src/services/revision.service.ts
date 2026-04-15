import api from './api';

export interface RevisionSession {
  id: string;
  date: string;
  startTime: string | null;
  duration: number;
  subject: string;
  lessonId: string | null;
  notes: string | null;
  lesson: { id: string; title: string; subjectId: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRevisionData {
  date: string;
  startTime?: string | null;
  duration: number;
  subject: string;
  lessonId?: string | null;
  notes?: string | null;
}

export const revisionService = {
  async getByWeek(start: string, end: string): Promise<RevisionSession[]> {
    const response = await api.get<RevisionSession[]>(`/revisions/week?start=${start}&end=${end}`);
    return response.data;
  },

  async create(data: CreateRevisionData): Promise<RevisionSession> {
    const response = await api.post<RevisionSession>('/revisions', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateRevisionData>): Promise<RevisionSession> {
    const response = await api.put<RevisionSession>(`/revisions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/revisions/${id}`);
  },
};
