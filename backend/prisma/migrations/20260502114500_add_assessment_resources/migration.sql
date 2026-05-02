CREATE TABLE IF NOT EXISTS "assessment_resources" (
  "id" TEXT NOT NULL,
  "assessment_id" TEXT NOT NULL,
  "type" "ResourceType" NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "mime_type" TEXT,
  "file_size" INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "assessment_resources_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assessment_resources_assessment_id_fkey'
  ) THEN
    ALTER TABLE "assessment_resources"
      ADD CONSTRAINT "assessment_resources_assessment_id_fkey"
      FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
