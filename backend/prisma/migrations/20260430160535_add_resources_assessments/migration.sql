-- CreateEnum (safe: ignore if already exists)
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ELEVE', 'PARENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ResourceType" AS ENUM ('LINK', 'DOC', 'IMAGE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable (safe: pre-existing tables are skipped)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ELEVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "subjects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "lessons" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "content_percent" INTEGER NOT NULL DEFAULT 0,
    "screenshot_url" TEXT,
    "is_revised" BOOLEAN NOT NULL DEFAULT false,
    "revised_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable (new)
CREATE TABLE IF NOT EXISTS "lesson_resources" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable (new)
CREATE TABLE IF NOT EXISTS "assessments" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "trimester" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "is_past" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable (new)
CREATE TABLE IF NOT EXISTS "assessment_lessons" (
    "assessment_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,

    CONSTRAINT "assessment_lessons_pkey" PRIMARY KEY ("assessment_id","lesson_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "revision_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "start_time" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "subject" TEXT NOT NULL,
    "lesson_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revision_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "assessments_subject_id_trimester_kind_key" ON "assessments"("subject_id", "trimester", "kind");

-- AddForeignKey (safe: ignore if already exists)
DO $$ BEGIN
    ALTER TABLE "subjects" ADD CONSTRAINT "subjects_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "lessons" ADD CONSTRAINT "lessons_subject_id_fkey"
        FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "lesson_resources" ADD CONSTRAINT "lesson_resources_lesson_id_fkey"
        FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "assessments" ADD CONSTRAINT "assessments_subject_id_fkey"
        FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "assessment_lessons" ADD CONSTRAINT "assessment_lessons_assessment_id_fkey"
        FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "assessment_lessons" ADD CONSTRAINT "assessment_lessons_lesson_id_fkey"
        FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "revision_sessions" ADD CONSTRAINT "revision_sessions_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "revision_sessions" ADD CONSTRAINT "revision_sessions_lesson_id_fkey"
        FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
