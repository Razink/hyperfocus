import { z } from 'zod';
import prisma from '../utils/prisma';

const ASSESSMENT_SLOTS = [
  { trimester: 1, kind: 'DC1' },
  { trimester: 1, kind: 'DC2' },
  { trimester: 1, kind: 'DS1' },
  { trimester: 2, kind: 'DC1' },
  { trimester: 2, kind: 'DC2' },
  { trimester: 2, kind: 'DS1' },
  { trimester: 3, kind: 'DC1' },
  { trimester: 3, kind: 'DC2' },
  { trimester: 3, kind: 'DS1' },
];

export { ASSESSMENT_SLOTS };

const patchSchema = z.object({
  isPast: z.boolean().optional(),
  date: z.string().datetime({ offset: true }).nullable().optional(),
});

const setLessonsSchema = z.object({
  lessonIds: z.array(z.string().uuid()),
});

async function verifyOwnership(id: string, userId: string) {
  const assessment = await prisma.assessment.findFirst({
    where: { id, subject: { userId } },
  });
  if (!assessment) {
    const err: any = new Error('Devoir non trouvé');
    err.status = 404; err.code = 'ASSESSMENT_NOT_FOUND';
    throw err;
  }
  return assessment;
}

export class AssessmentService {
  /** Called once on subject creation to seed the 9 fixed assessments. */
  async createForSubject(subjectId: string) {
    return prisma.assessment.createMany({
      data: ASSESSMENT_SLOTS.map(s => ({ subjectId, ...s })),
      skipDuplicates: true,
    });
  }

  async getBySubject(subjectId: string, userId: string) {
    const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId } });
    if (!subject) {
      const err: any = new Error('Matière non trouvée');
      err.status = 404; err.code = 'SUBJECT_NOT_FOUND';
      throw err;
    }

    const assessments = await prisma.assessment.findMany({
      where: { subjectId },
      include: {
        lessons: {
          include: {
            lesson: { select: { id: true, title: true, contentPercent: true, isRevised: true } },
          },
        },
      },
      orderBy: [{ trimester: 'asc' }, { kind: 'asc' }],
    });

    // Group by trimester
    const grouped: Record<number, typeof assessments> = { 1: [], 2: [], 3: [] };
    for (const a of assessments) grouped[a.trimester].push(a);

    return { subject: { id: subject.id, name: subject.name, color: subject.color }, grouped };
  }

  async getById(id: string, userId: string) {
    const assessment = await prisma.assessment.findFirst({
      where: { id, subject: { userId } },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        lessons: {
          include: {
            lesson: { select: { id: true, title: true, contentPercent: true, isRevised: true } },
          },
        },
      },
    });
    if (!assessment) {
      const err: any = new Error('Devoir non trouvé');
      err.status = 404; err.code = 'ASSESSMENT_NOT_FOUND';
      throw err;
    }
    return assessment;
  }

  async patch(id: string, userId: string, body: unknown) {
    await verifyOwnership(id, userId);
    const data = patchSchema.parse(body);
    const updateData: any = {};
    if (data.isPast !== undefined) updateData.isPast = data.isPast;
    if (data.date !== undefined) updateData.date = data.date ? new Date(data.date) : null;
    return prisma.assessment.update({ where: { id }, data: updateData });
  }

  async setLessons(id: string, userId: string, body: unknown) {
    const assessment = await verifyOwnership(id, userId);
    const { lessonIds } = setLessonsSchema.parse(body);

    // All lessons must belong to the same subject
    if (lessonIds.length > 0) {
      const count = await prisma.lesson.count({
        where: { id: { in: lessonIds }, subjectId: assessment.subjectId },
      });
      if (count !== lessonIds.length) {
        const err: any = new Error('Certains cours n\'appartiennent pas à cette matière');
        err.status = 400; err.code = 'INVALID_LESSON';
        throw err;
      }
    }

    await prisma.$transaction([
      prisma.assessmentLesson.deleteMany({ where: { assessmentId: id } }),
      ...lessonIds.map(lessonId =>
        prisma.assessmentLesson.create({ data: { assessmentId: id, lessonId } })
      ),
    ]);

    return this.getById(id, userId);
  }

  async getUpcoming(userId: string) {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    now.setHours(0, 0, 0, 0);

    return prisma.assessment.findMany({
      where: {
        subject: { userId },
        date: { gte: now, lte: in7Days },
        isPast: false,
      },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        lessons: {
          include: {
            lesson: { select: { id: true, title: true, contentPercent: true, isRevised: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}
