import api from './api';
import type { LessonResource } from '../types';

export const resourceService = {
  async addLink(lessonId: string, data: { url: string; title?: string }): Promise<LessonResource> {
    const res = await api.post<LessonResource>(`/lessons/${lessonId}/resources/link`, data);
    return res.data;
  },

  async addDoc(lessonId: string, file: File, title?: string): Promise<LessonResource> {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    const res = await api.post<LessonResource>(`/lessons/${lessonId}/resources/doc`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async addImage(lessonId: string, file: File, title?: string): Promise<LessonResource> {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    const res = await api.post<LessonResource>(`/lessons/${lessonId}/resources/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async rename(id: string, title: string): Promise<LessonResource> {
    const res = await api.patch<LessonResource>(`/resources/${id}`, { title });
    return res.data;
  },

  async reorder(lessonId: string, ids: string[]): Promise<void> {
    await api.put(`/lessons/${lessonId}/resources/reorder`, { ids });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/resources/${id}`);
  },
};
