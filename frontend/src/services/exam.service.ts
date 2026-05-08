import api from './api';

export interface Exam {
  id: string;
  subject: string;
  date: string;
  detail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamData {
  subject: string;
  date: string;
  detail?: string | null;
}

export const examService = {
  async getAll(): Promise<Exam[]> {
    const response = await api.get<{ exams: Exam[] }>('/exams');
    return response.data.exams;
  },

  async create(data: CreateExamData): Promise<Exam> {
    const response = await api.post<Exam>('/exams', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateExamData>): Promise<Exam> {
    const response = await api.put<Exam>(`/exams/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/exams/${id}`);
  },
};
