import { z } from 'zod';
import fs from 'fs';
import path from 'path';
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

const linkSchema = z.object({
  url: z.string().url().max(2000),
  title: z.string().min(1).max(200).optional(),
});

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

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

async function verifyResourceOwnership(resourceId: string, userId: string) {
  const resource = await prisma.assessmentResource.findFirst({
    where: { id: resourceId, assessment: { subject: { userId } } },
    include: {
      assessment: {
        select: {
          id: true,
          kind: true,
          trimester: true,
          subject: { select: { id: true, name: true, color: true } }
        }
      }
    }
  });
  if (!resource) {
    const err: any = new Error('Ressource de devoir non trouvée');
    err.status = 404; err.code = 'ASSESSMENT_RESOURCE_NOT_FOUND';
    throw err;
  }
  return resource;
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
        resources: { orderBy: { order: 'asc' } },
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
        resources: { orderBy: { order: 'asc' } },
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

  async getResourceById(resourceId: string, userId: string) {
    return verifyResourceOwnership(resourceId, userId);
  }

  async addResourceLink(assessmentId: string, userId: string, body: unknown) {
    await verifyOwnership(assessmentId, userId);
    const { url, title } = linkSchema.parse(body);
    const maxOrder = await prisma.assessmentResource.findFirst({
      where: { assessmentId, type: 'LINK' },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return prisma.assessmentResource.create({
      data: {
        assessmentId,
        type: 'LINK',
        url,
        title: title || domainFromUrl(url),
        order: (maxOrder?.order ?? 0) + 1,
      },
    });
  }

  async addResourceDoc(assessmentId: string, userId: string, file: Express.Multer.File, title?: string) {
    await verifyOwnership(assessmentId, userId);
    const maxOrder = await prisma.assessmentResource.findFirst({
      where: { assessmentId, type: 'DOC' },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return prisma.assessmentResource.create({
      data: {
        assessmentId,
        type: 'DOC',
        url: `/uploads/assessment-docs/${file.filename}`,
        title: title || file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        order: (maxOrder?.order ?? 0) + 1,
      },
    });
  }

  async addResourceImage(assessmentId: string, userId: string, file: Express.Multer.File, title?: string) {
    await verifyOwnership(assessmentId, userId);
    const maxOrder = await prisma.assessmentResource.findFirst({
      where: { assessmentId, type: 'IMAGE' },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return prisma.assessmentResource.create({
      data: {
        assessmentId,
        type: 'IMAGE',
        url: `/uploads/assessment-images/${file.filename}`,
        title: title || file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        order: (maxOrder?.order ?? 0) + 1,
      },
    });
  }

  async deleteResource(resourceId: string, userId: string) {
    const resource = await verifyResourceOwnership(resourceId, userId);
    if (resource.type !== 'LINK' && resource.url) {
      const filePath = path.join(process.cwd(), resource.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.assessmentResource.delete({ where: { id: resourceId } });
    return { message: 'Ressource supprimée' };
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
