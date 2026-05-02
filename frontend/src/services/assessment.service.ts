import api from './api';
import type { Assessment, AssessmentGrouped, AssessmentResource } from '../types';

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

  async getResourceById(id: string): Promise<AssessmentResource> {
    const res = await api.get<AssessmentResource>(`/assessments/resources/${id}`);
    return res.data;
  },

  async addLink(id: string, data: { url: string; title?: string }): Promise<AssessmentResource> {
    const res = await api.post<AssessmentResource>(`/assessments/${id}/resources/link`, data);
    return res.data;
  },

  async addDoc(id: string, file: File, title?: string): Promise<AssessmentResource> {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    const res = await api.post<AssessmentResource>(`/assessments/${id}/resources/doc`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async addImage(id: string, file: File, title?: string): Promise<AssessmentResource> {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    const res = await api.post<AssessmentResource>(`/assessments/${id}/resources/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteResource(id: string): Promise<void> {
    await api.delete(`/assessments/resources/${id}`);
  },
};
