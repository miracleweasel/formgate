-- drizzle/0001_create_forms.sql
CREATE TABLE IF NOT EXISTS "forms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(200) NOT NULL,
  "slug" varchar(200) NOT NULL,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "forms_slug_unique" ON "forms" ("slug");
