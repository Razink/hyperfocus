import api from './api';
import type { Bulletin, BulletinSummary, BulletinDraft, AutofillResult, BulletinSubject } from '../types';

export interface CreateBulletinData {
  schoolYear: string;
  trimester: number;
  className?: string | null;
  classSize?: number | null;
  rank?: number | null;
  isProjection?: boolean;
  subjects: Omit<BulletinSubject, 'id' | 'total' | 'subjectRef'>[];
}

export const bulletinService = {
  async list(): Promise<BulletinSummary[]> {
    const res = await api.get<{ bulletins: BulletinSummary[] }>('/bulletins');
    return res.data.bulletins;
  },

  async getById(id: string): Promise<Bulletin> {
    const res = await api.get<Bulletin>(`/bulletins/${id}`);
    return res.data;
  },

  async create(data: CreateBulletinData): Promise<Bulletin> {
    const res = await api.post<Bulletin>('/bulletins', data);
    return res.data;
  },

  async update(id: string, data: Partial<CreateBulletinData>): Promise<Bulletin> {
    const res = await api.put<Bulletin>(`/bulletins/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/bulletins/${id}`);
  },

  async draft(schoolYear: string, trimester: number): Promise<BulletinDraft> {
    const res = await api.get<BulletinDraft>('/bulletins/draft', {
      params: { schoolYear, trimester },
    });
    return res.data;
  },

  async autofill(data: { schoolYear: string; trimester: number; targetAverage: number; variance?: number }): Promise<AutofillResult> {
    const res = await api.post<AutofillResult>('/bulletins/autofill', data);
    return res.data;
  },
};
