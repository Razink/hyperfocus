import api from './api';
import type { Subject, SubjectDetail } from '../types';

export const subjectService = {
  async getAll(): Promise<Subject[]> {
    const response = await api.get<{ subjects: Subject[] }>('/subjects');
    return response.data.subjects;
  },

  async getById(id: string): Promise<Subject> {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  async create(data: { name: string; color: string; icon?: string }): Promise<Subject> {
    const response = await api.post<Subject>('/subjects', data);
    return response.data;
  },

  async update(id: string, data: Partial<{ name: string; color: string; icon?: string }>): Promise<Subject> {
    const response = await api.put<Subject>(`/subjects/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/subjects/${id}`);
  },

  async getLessons(subjectId: string): Promise<SubjectDetail> {
    const response = await api.get<SubjectDetail>(`/subjects/${subjectId}/lessons`);
    return response.data;
  },
};
