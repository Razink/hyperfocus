import prisma from '../utils/prisma';

export class DashboardService {
  async getData(userId: string) {
    // 1. All subjects with their lessons
    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            contentPercent: true,
            isRevised: true,
            revisedAt: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });

    // 2. Revision sessions this week
    const now = new Date();
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const toDateStr = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    const revisionSessions = await prisma.revisionSession.findMany({
      where: {
        userId,
        date: { gte: toDateStr(weekStart), lte: toDateStr(weekEnd) }
      }
    });

    // ── Stats ──────────────────────────────────────────
    const subjectsCount = subjects.length;

    const allLessons = subjects.flatMap(s => s.lessons.map(l => ({ ...l, subjectName: s.name, subjectColor: s.color })));
    const totalLessons = allLessons.length;
    const revisedCount = allLessons.filter(l => l.isRevised).length;

    const globalProgress = subjects.length > 0
      ? Math.round(
          subjects.reduce((sum, s) => {
            const pct = s.lessons.length > 0
              ? s.lessons.reduce((a, l) => a + l.contentPercent, 0) / s.lessons.length
              : 0;
            return sum + pct;
          }, 0) / subjects.length
        )
      : 0;

    const revisionMinutesThisWeek = revisionSessions.reduce((sum, r) => sum + r.duration, 0);

    // ── Recent activity ────────────────────────────────
    // Combine: recently revised lessons + recently created lessons
    type ActivityEvent = {
      type: 'revised' | 'created';
      lessonId: string;
      lessonTitle: string;
      subjectName: string;
      subjectColor: string;
      date: Date;
    };

    const events: ActivityEvent[] = [];

    for (const lesson of allLessons) {
      if (lesson.isRevised && lesson.revisedAt) {
        events.push({
          type: 'revised',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          subjectName: lesson.subjectName,
          subjectColor: lesson.subjectColor,
          date: lesson.revisedAt,
        });
      }
      events.push({
        type: 'created',
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        subjectName: lesson.subjectName,
        subjectColor: lesson.subjectColor,
        date: lesson.createdAt,
      });
    }

    // Sort by date desc, deduplicate (prefer revised over created for same lesson)
    const seen = new Set<string>();
    const recentActivity = events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .filter(e => {
        const key = `${e.lessonId}-${e.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8)
      .map(e => ({
        type: e.type,
        lessonTitle: e.lessonTitle,
        subjectName: e.subjectName,
        subjectColor: e.subjectColor,
        date: e.date.toISOString(),
      }));

    // ── Next exams (from subjects, no exam model yet — return empty) ──
    // Will be useful once exam model is added

    // ── Per-subject breakdown ──────────────────────────
    const subjectStats = subjects.map(s => ({
      id: s.id,
      name: s.name,
      color: s.color,
      icon: s.icon,
      lessonsCount: s.lessons.length,
      revisedCount: s.lessons.filter(l => l.isRevised).length,
      progressPercent: s.lessons.length > 0
        ? Math.round(s.lessons.reduce((a, l) => a + l.contentPercent, 0) / s.lessons.length)
        : 0,
    }));

    return {
      stats: {
        subjectsCount,
        totalLessons,
        revisedCount,
        globalProgress,
        revisionMinutesThisWeek,
      },
      recentActivity,
      subjectStats,
    };
  }
}
