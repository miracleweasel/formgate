// test/setup-env.js
// Env minimal pour que les imports côté server ne crashent pas en tests.
// IMPORTANT: jamais de vrais secrets ici.

// process.env.NODE_ENV = "test";

// requis par lib/env ou lib/db chez toi
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/formgate_test";

// si tu as un check strict genre Missing env: APP_ENC_KEY
process.env.APP_ENC_KEY =
  process.env.APP_ENC_KEY || "00000000000000000000000000000000";

// optionnel mais utile si certains modules lisent ça
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
process.env.APP_URL = process.env.APP_URL || "http://localhost:3000";

// requis pour makeSessionCookieValue (session signing)
process.env.AUTH_SECRET =
  process.env.AUTH_SECRET || "test_secret_32_chars_minimum_ok";
