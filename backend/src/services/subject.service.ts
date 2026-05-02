import prisma from '../utils/prisma';
import { z } from 'zod';
import { ASSESSMENT_SLOTS } from './assessment.service';

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Format couleur invalide (ex: #FF5733)'),
  icon: z.string().max(10).optional()
});

const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().max(10).optional()
});

export class SubjectService {
  async getAll(userId: string) {
    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: {
        lessons: {
          select: {
            id: true,
            contentPercent: true,
            isRevised: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
      lessonsCount: subject.lessons.length,
      progressPercent: subject.lessons.length > 0
        ? Math.round(subject.lessons.reduce((sum, l) => sum + l.contentPercent, 0) / subject.lessons.length)
        : 0,
      revisedCount: subject.lessons.filter(l => l.isRevised).length,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt
    }));
  }

  async getById(id: string, userId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id, userId },
      include: {
        lessons: {
          select: {
            id: true,
            contentPercent: true,
            isRevised: true
          }
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
      id: subject.id,
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
      lessonsCount: subject.lessons.length,
      progressPercent: subject.lessons.length > 0
        ? Math.round(subject.lessons.reduce((sum, l) => sum + l.contentPercent, 0) / subject.lessons.length)
        : 0,
      revisedCount: subject.lessons.filter(l => l.isRevised).length,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt
    };
  }

  async create(userId: string, data: { name: string; color: string; icon?: string }) {
    const validated = createSubjectSchema.parse(data);

    const subject = await prisma.$transaction(async (tx) => {
      const s = await tx.subject.create({
        data: { userId, name: validated.name, color: validated.color, icon: validated.icon }
      });
      await tx.assessment.createMany({
        data: ASSESSMENT_SLOTS.map(slot => ({ subjectId: s.id, ...slot })),
        skipDuplicates: true,
      });
      return s;
    });

    return {
      id: subject.id,
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
      lessonsCount: 0,
      progressPercent: 0,
      revisedCount: 0,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt
    };
  }

  async update(id: string, userId: string, data: { name?: string; color?: string; icon?: string }) {
    const validated = updateSubjectSchema.parse(data);

    const subject = await prisma.subject.findFirst({
      where: { id, userId }
    });

    if (!subject) {
      const error: any = new Error('Matière non trouvée');
      error.status = 404;
      error.code = 'SUBJECT_NOT_FOUND';
      throw error;
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: validated,
      include: {
        lessons: {
          select: {
            id: true,
            contentPercent: true,
            isRevised: true
          }
        }
      }
    });

    return {
      id: updated.id,
      name: updated.name,
      color: updated.color,
      icon: updated.icon,
      lessonsCount: updated.lessons.length,
      progressPercent: updated.lessons.length > 0
        ? Math.round(updated.lessons.reduce((sum, l) => sum + l.contentPercent, 0) / updated.lessons.length)
        : 0,
      revisedCount: updated.lessons.filter(l => l.isRevised).length,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }

  async delete(id: string, userId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id, userId }
    });

    if (!subject) {
      const error: any = new Error('Matière non trouvée');
      error.status = 404;
      error.code = 'SUBJECT_NOT_FOUND';
      throw error;
    }

    await prisma.subject.delete({
      where: { id }
    });

    return { message: 'Matière supprimée avec succès' };
  }
}
