-- CreateTable
CREATE TABLE "bulletins" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "school_year" TEXT NOT NULL,
    "trimester" INTEGER NOT NULL,
    "class_name" TEXT,
    "class_size" INTEGER,
    "rank" INTEGER,
    "general_average" DECIMAL(5,2),
    "is_projection" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulletins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulletin_subjects" (
    "id" TEXT NOT NULL,
    "bulletin_id" TEXT NOT NULL,
    "subject_id" TEXT,
    "name" TEXT NOT NULL,
    "coefficient" DECIMAL(4,2) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "oral" DECIMAL(5,2),
    "tp" DECIMAL(5,2),
    "examen_ecrit" DECIMAL(5,2),
    "dc1" DECIMAL(5,2),
    "dc2" DECIMAL(5,2),
    "devoir_synthese" DECIMAL(5,2),
    "moyenne" DECIMAL(5,2),
    "rank" INTEGER,
    "total" DECIMAL(6,2),
    "exempted" BOOLEAN NOT NULL DEFAULT false,
    "teacher_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulletin_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bulletins_user_id_school_year_trimester_is_projection_key" ON "bulletins"("user_id", "school_year", "trimester", "is_projection");

-- CreateIndex
CREATE UNIQUE INDEX "bulletin_subjects_bulletin_id_name_key" ON "bulletin_subjects"("bulletin_id", "name");

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletin_subjects" ADD CONSTRAINT "bulletin_subjects_bulletin_id_fkey" FOREIGN KEY ("bulletin_id") REFERENCES "bulletins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletin_subjects" ADD CONSTRAINT "bulletin_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
