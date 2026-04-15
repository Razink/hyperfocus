import prisma from '../utils/prisma';
import { z } from 'zod';

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)').optional().nullable(),
  duration: z.number().min(15, 'Durée minimum 15 min').max(480, 'Durée maximum 8h').default(60),
  subject: z.string().min(1, 'La matière est requise').max(100),
  lessonId: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

const updateSchema = createSchema.partial();

export class RevisionService {
  async getByWeek(userId: string, weekStart: string, weekEnd: string) {
    const sessions = await prisma.revisionSession.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
      include: {
        lesson: {
          select: { id: true, title: true, subjectId: true }
        }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    return sessions;
  }

  async getAll(userId: string) {
    return prisma.revisionSession.findMany({
      where: { userId },
      include: {
        lesson: {
          select: { id: true, title: true, subjectId: true }
        }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async create(userId: string, data: any) {
    const validated = createSchema.parse(data);

    // If lessonId provided, verify it belongs to user
    if (validated.lessonId) {
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: validated.lessonId,
          subject: { userId },
        },
      });
      if (!lesson) {
        const error: any = new Error('Leçon non trouvée');
        error.status = 404;
        error.code = 'LESSON_NOT_FOUND';
        throw error;
      }
    }

    return prisma.revisionSession.create({
      data: {
        userId,
        date: validated.date,
        startTime: validated.startTime || null,
        duration: validated.duration,
        subject: validated.subject,
        lessonId: validated.lessonId || null,
        notes: validated.notes || null,
      },
      include: {
        lesson: {
          select: { id: true, title: true, subjectId: true }
        }
      },
    });
  }

  async update(userId: string, id: string, data: any) {
    const validated = updateSchema.parse(data);

    const existing = await prisma.revisionSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error: any = new Error('Séance non trouvée');
      error.status = 404;
      error.code = 'SESSION_NOT_FOUND';
      throw error;
    }

    return prisma.revisionSession.update({
      where: { id },
      data: {
        ...(validated.date !== undefined && { date: validated.date }),
        ...(validated.startTime !== undefined && { startTime: validated.startTime || null }),
        ...(validated.duration !== undefined && { duration: validated.duration }),
        ...(validated.subject !== undefined && { subject: validated.subject }),
        ...(validated.lessonId !== undefined && { lessonId: validated.lessonId || null }),
        ...(validated.notes !== undefined && { notes: validated.notes || null }),
      },
      include: {
        lesson: {
          select: { id: true, title: true, subjectId: true }
        }
      },
    });
  }

  async delete(userId: string, id: string) {
    const existing = await prisma.revisionSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      const error: any = new Error('Séance non trouvée');
      error.status = 404;
      error.code = 'SESSION_NOT_FOUND';
      throw error;
    }

    await prisma.revisionSession.delete({ where: { id } });
  }
}
