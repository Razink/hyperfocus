import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import prisma from '../utils/prisma';

const linkSchema = z.object({
  url: z.string().url().max(2000),
  title: z.string().min(1).max(200).optional()
});

const renameSchema = z.object({
  title: z.string().min(1).max(200)
});

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function verifyLessonOwnership(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, subject: { userId } }
  });
  if (!lesson) {
    const err: any = new Error('Cours non trouvé');
    err.status = 404;
    err.code = 'LESSON_NOT_FOUND';
    throw err;
  }
  return lesson;
}

async function verifyResourceOwnership(resourceId: string, userId: string) {
  const resource = await prisma.lessonResource.findFirst({
    where: { id: resourceId, lesson: { subject: { userId } } }
  });
  if (!resource) {
    const err: any = new Error('Ressource non trouvée');
    err.status = 404;
    err.code = 'RESOURCE_NOT_FOUND';
    throw err;
  }
  return resource;
}

export class ResourceService {
  async addLink(lessonId: string, userId: string, body: { url: string; title?: string }) {
    await verifyLessonOwnership(lessonId, userId);
    const { url, title } = linkSchema.parse(body);

    const maxOrder = await prisma.lessonResource.findFirst({
      where: { lessonId, type: 'LINK' },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    return prisma.lessonResource.create({
      data: {
        lessonId,
        type: 'LINK',
        url,
        title: title || domainFromUrl(url),
        order: (maxOrder?.order ?? 0) + 1
      }
    });
  }

  async addDoc(lessonId: string, userId: string, file: Express.Multer.File, title?: string) {
    await verifyLessonOwnership(lessonId, userId);

    const maxOrder = await prisma.lessonResource.findFirst({
      where: { lessonId, type: 'DOC' },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    return prisma.lessonResource.create({
      data: {
        lessonId,
        type: 'DOC',
        url: `/uploads/docs/${file.filename}`,
        title: title || file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        order: (maxOrder?.order ?? 0) + 1
      }
    });
  }

  async addImage(lessonId: string, userId: string, file: Express.Multer.File, title?: string) {
    await verifyLessonOwnership(lessonId, userId);

    const maxOrder = await prisma.lessonResource.findFirst({
      where: { lessonId, type: 'IMAGE' },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    return prisma.lessonResource.create({
      data: {
        lessonId,
        type: 'IMAGE',
        url: `/uploads/lesson-images/${file.filename}`,
        title: title || file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        order: (maxOrder?.order ?? 0) + 1
      }
    });
  }

  async rename(resourceId: string, userId: string, body: { title: string }) {
    await verifyResourceOwnership(resourceId, userId);
    const { title } = renameSchema.parse(body);
    return prisma.lessonResource.update({ where: { id: resourceId }, data: { title } });
  }

  async reorder(lessonId: string, userId: string, body: { ids: string[] }) {
    await verifyLessonOwnership(lessonId, userId);

    await prisma.$transaction(
      body.ids.map((id, idx) =>
        prisma.lessonResource.updateMany({
          where: { id, lessonId },
          data: { order: idx + 1 }
        })
      )
    );
    return { ok: true };
  }

  async delete(resourceId: string, userId: string) {
    const resource = await verifyResourceOwnership(resourceId, userId);

    if (resource.type !== 'LINK' && resource.url) {
      const filePath = path.join(process.cwd(), resource.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.lessonResource.delete({ where: { id: resourceId } });
    return { message: 'Ressource supprimée' };
  }
}
