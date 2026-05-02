import api from './api';
import type { Lesson, LessonDetail } from '../types';

export const lessonService = {
  async getById(id: string): Promise<LessonDetail> {
    const response = await api.get<LessonDetail>(`/lessons/${id}`);
    return response.data;
  },

  async create(subjectId: string, data: { title: string; contentPercent?: number }): Promise<Lesson> {
    const response = await api.post<Lesson>(`/subjects/${subjectId}/lessons`, data);
    return response.data;
  },

  async update(id: string, data: Partial<{ title: string; contentPercent: number; isRevised: boolean }>): Promise<Lesson> {
    const response = await api.put<Lesson>(`/lessons/${id}`, data);
    return response.data;
  },

  async updateRevised(id: string, isRevised: boolean): Promise<{ id: string; isRevised: boolean; revisedAt?: string }> {
    const response = await api.patch(`/lessons/${id}/revised`, { isRevised });
    return response.data;
  },

  async uploadScreenshot(id: string, file: File): Promise<{ screenshotUrl: string }> {
    const formData = new FormData();
    formData.append('screenshot', file);
    const response = await api.post(`/lessons/${id}/screenshot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/lessons/${id}`);
  },
};
