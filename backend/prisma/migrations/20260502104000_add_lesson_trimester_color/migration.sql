ALTER TABLE "lessons"
  ADD COLUMN IF NOT EXISTS "trimester" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "color" TEXT NOT NULL DEFAULT '#3b82f6';

UPDATE "lessons"
SET "trimester" = 1
WHERE "trimester" IS NULL OR "trimester" NOT IN (1, 2, 3);

UPDATE "lessons"
SET "color" = CASE (ABS(("order" + 1)) % 8)
  WHEN 0 THEN '#3b82f6'
  WHEN 1 THEN '#22c55e'
  WHEN 2 THEN '#f97316'
  WHEN 3 THEN '#a855f7'
  WHEN 4 THEN '#ec4899'
  WHEN 5 THEN '#14b8a6'
  WHEN 6 THEN '#eab308'
  ELSE '#ef4444'
END
WHERE "color" IS NULL OR "color" = '#3b82f6';
