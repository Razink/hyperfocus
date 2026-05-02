import prisma from '../utils/prisma';
import { z } from 'zod';

const createLessonSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  contentPercent: z.number().min(0).max(100).default(0)
});

const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  contentPercent: z.number().min(0).max(100).optional()
});

const revisedSchema = z.object({
  isRevised: z.boolean()
});

export class LessonService {
  async getBySubjectId(subjectId: string, userId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, userId },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!subject) {
      const error: any = new Error('Matière non trouvée');
      error.status = 404;
      error.code = 'SUBJECT_NOT_FOUND';
      throw error;
    }

    return {
      subject: {
        id: subject.id,
        name: subject.name,
        color: subject.color
      },
      lessons: subject.lessons
    };
  }

  async getById(id: string, userId: string) {
    const lesson = await prisma.lesson.findFirst({
      where: { id, subject: { userId } },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        resources: { orderBy: { order: 'asc' } }
      }
    });

    if (!lesson) {
      const error: any = new Error('Cours non trouvé');
      error.status = 404;
      error.code = 'LESSON_NOT_FOUND';
      throw error;
    }

    return lesson;
  }

  async create(subjectId: string, userId: string, data: { title: string; contentPercent?: number }) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, userId }
    });

    if (!subject) {
      const error: any = new Error('Matière non trouvée');
      error.status = 404;
      error.code = 'SUBJECT_NOT_FOUND';
      throw error;
    }

    const validated = createLessonSchema.parse(data);

    const maxOrder = await prisma.lesson.findFirst({
      where: { subjectId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const lesson = await prisma.lesson.create({
      data: {
        subjectId,
        title: validated.title,
        contentPercent: validated.contentPercent,
        order: (maxOrder?.order ?? 0) + 1
      }
    });

    return lesson;
  }

  async update(id: string, userId: string, data: { title?: string; contentPercent?: number }) {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id,
        subject: { userId }
      }
    });

    if (!lesson) {
      const error: any = new Error('Cours non trouvé');
      error.status = 404;
      error.code = 'LESSON_NOT_FOUND';
      throw error;
    }

    const validated = updateLessonSchema.parse(data);

    const updated = await prisma.lesson.update({
      where: { id },
      data: validated
    });

    return updated;
  }

  async updateRevised(id: string, userId: string, data: { isRevised: boolean }) {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id,
        subject: { userId }
      }
    });

    if (!lesson) {
      const error: any = new Error('Cours non trouvé');
      error.status = 404;
      error.code = 'LESSON_NOT_FOUND';
      throw error;
    }

    const validated = revisedSchema.parse(data);

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        isRevised: validated.isRevised,
        revisedAt: validated.isRevised ? new Date() : null
      },
      select: {
        id: true,
        isRevised: true,
        revisedAt: true
      }
    });

    return updated;
  }

  async updateScreenshot(id: string, userId: string, screenshotUrl: string) {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id,
        subject: { userId }
      }
    });

    if (!lesson) {
      const error: any = new Error('Cours non trouvé');
      error.status = 404;
      error.code = 'LESSON_NOT_FOUND';
      throw error;
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: { screenshotUrl },
      select: { screenshotUrl: true }
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id,
        subject: { userId }
      }
    });

    if (!lesson) {
      const error: any = new Error('Cours non trouvé');
      error.status = 404;
      error.code = 'LESSON_NOT_FOUND';
      throw error;
    }

    await prisma.lesson.delete({
      where: { id }
    });

    return { message: 'Cours supprimé avec succès' };
  }
}
