ALTER TABLE "assessments"
  ALTER COLUMN "kind" TYPE TEXT USING "kind"::text;
