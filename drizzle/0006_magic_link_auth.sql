-- 0006_magic_link_auth.sql
-- Multi-user auth with magic links

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX users_email_idx ON users (email);

-- Magic links table
CREATE TABLE magic_links (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX magic_links_email_idx ON magic_links (email);
CREATE INDEX magic_links_token_hash_idx ON magic_links (token_hash);

-- Add user_email to forms (for multi-user scoping)
ALTER TABLE forms ADD COLUMN user_email TEXT;
CREATE INDEX forms_user_email_idx ON forms (user_email);
