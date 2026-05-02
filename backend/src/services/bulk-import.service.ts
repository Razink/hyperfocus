import { z } from 'zod';
import prisma from '../utils/prisma';

const lessonInputSchema = z.object({
  title: z.string().min(1).max(200),
  contentPercent: z.number().int().min(0).max(100).default(0),
  isRevised: z.boolean().default(false),
  trimester: z.number().int().min(1).max(3).default(1),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const bulkSchema = z.object({
  lessons: z.array(lessonInputSchema).min(1),
});

const lessonColors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#ef4444'];

export class BulkImportService {
  async import(subjectId: string, userId: string, body: unknown) {
    const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId } });
    if (!subject) {
      const err: any = new Error('Matière non trouvée');
      err.status = 404; err.code = 'SUBJECT_NOT_FOUND';
      throw err;
    }

    const { lessons } = bulkSchema.parse(body);

    const maxOrder = await prisma.lesson.findFirst({
      where: { subjectId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const base = maxOrder?.order ?? 0;

    const created = await prisma.$transaction(
      lessons.map((l, i) =>
        prisma.lesson.create({
          data: {
            subjectId,
            title: l.title,
            contentPercent: l.contentPercent,
            isRevised: l.isRevised,
            revisedAt: l.isRevised ? new Date() : null,
            trimester: l.trimester,
            color: l.color || lessonColors[(base + i + 1) % lessonColors.length],
            order: base + i + 1,
          },
        })
      )
    );

    return { count: created.length, lessons: created };
  }
}
