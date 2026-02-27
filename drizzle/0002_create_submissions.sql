-- drizzle/0002_create_submissions.sql
CREATE TABLE IF NOT EXISTS "submissions" (
  "id" uuid PRIMARY KEY,
  "form_id" uuid NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE "submissions"
    ADD CONSTRAINT "submissions_form_id_forms_id_fk"
    FOREIGN KEY ("form_id") REFERENCES "forms"("id")
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "submissions_form_id_idx" ON "submissions" ("form_id");
CREATE INDEX IF NOT EXISTS "submissions_created_at_idx" ON "submissions" ("created_at");
