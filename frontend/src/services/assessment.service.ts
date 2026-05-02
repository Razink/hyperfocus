import api from './api';
import type { Assessment, AssessmentGrouped } from '../types';

export const assessmentService = {
  async getBySubject(subjectId: string): Promise<AssessmentGrouped> {
    const res = await api.get<AssessmentGrouped>(`/subjects/${subjectId}/assessments`);
    return res.data;
  },

  async getById(id: string): Promise<Assessment> {
    const res = await api.get<Assessment>(`/assessments/${id}`);
    return res.data;
  },

  async patch(id: string, data: { isPast?: boolean; date?: string | null }): Promise<Assessment> {
    const res = await api.patch<Assessment>(`/assessments/${id}`, data);
    return res.data;
  },

  async setLessons(id: string, lessonIds: string[]): Promise<Assessment> {
    const res = await api.put<Assessment>(`/assessments/${id}/lessons`, { lessonIds });
    return res.data;
  },
};
