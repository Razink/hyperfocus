import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExamService {
  async getAll(userId: string) {
    return prisma.exam.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  async create(userId: string, data: { subject: string; date: string; detail?: string | null }) {
    return prisma.exam.create({
      data: { userId, subject: data.subject, date: data.date, detail: data.detail ?? null },
    });
  }

  async update(userId: string, id: string, data: { subject?: string; date?: string; detail?: string | null }) {
    const exam = await prisma.exam.findFirst({ where: { id, userId } });
    if (!exam) throw Object.assign(new Error('Examen non trouvé'), { status: 404, code: 'NOT_FOUND' });
    return prisma.exam.update({ where: { id }, data });
  }

  async delete(userId: string, id: string) {
    const exam = await prisma.exam.findFirst({ where: { id, userId } });
    if (!exam) throw Object.assign(new Error('Examen non trouvé'), { status: 404, code: 'NOT_FOUND' });
    return prisma.exam.delete({ where: { id } });
  }
}
