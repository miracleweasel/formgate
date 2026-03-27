-- 0003_add_backlog_integration.sql
-- Backlog integration tables (MVP)

CREATE TABLE IF NOT EXISTS integration_backlog_connections (
  id uuid PRIMARY KEY,
  user_email text NOT NULL,
  space_url text NOT NULL,
  api_key text NOT NULL,
  default_project_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ibc_user_email_idx
  ON integration_backlog_connections (user_email);


CREATE TABLE IF NOT EXISTS integration_backlog_form_settings (
  form_id uuid PRIMARY KEY
    REFERENCES forms(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  project_key text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ibfs_enabled_idx
  ON integration_backlog_form_settings (enabled);
