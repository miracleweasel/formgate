# FORMGATE

**FormGate** - Formulaires publics → Tickets Backlog automatiquement via API officielle.

> Stop request chaos.
> Every form submission becomes a proper Backlog issue.

---

## Quick Start

```bash
pnpm install
cp .env.example .env.local  # Configure DATABASE_URL, APP_ENC_KEY, RESEND_API_KEY
pnpm drizzle-kit push       # Apply DB migrations
pnpm dev                    # Start dev server
pnpm test                   # Run 279 tests
pnpm build                  # Production build
```

---

## Current State (19 Feb 2026)

### Implemented Features

| Feature | Status | Key Files |
|---------|--------|-----------|
| **Magic Link Auth** | ✅ Done | `lib/auth/magicLink.ts`, `lib/email/send.ts`, `app/api/auth/verify/route.ts` |
| **Multi-User Support** | ✅ Done | `lib/auth/requireUser.ts`, `lib/auth/getSessionEmail.ts` |
| **Session Management** | ✅ Done | `lib/auth/session.ts`, `lib/auth/cookies.ts` |
| **Form CRUD** | ✅ Done | `app/api/forms/route.ts`, `app/api/forms/[id]/route.ts` |
| **Custom Fields** | ✅ Done | `lib/validation/fields.ts`, `lib/db/schema.ts` |
| **Admin Field Builder UI** | ✅ Done | `components/field-builder/`, `app/(dashboard)/forms/[id]/edit/` |
| **Field Mapping Backlog** | ✅ Done | `lib/validation/backlogMapping.ts`, `lib/backlog/issue.ts` |
| **Public Form Render** | ✅ Dynamic | `app/f/[slug]/public-form-client.tsx` |
| **Form Submission** | ✅ Done | `app/api/public/forms/[slug]/submit/route.ts` |
| **Backlog Connection** | ✅ Done | `lib/backlog/client.ts` |
| **Backlog Auto-Issue** | ✅ Done | Non-blocking on submit, with field mapping |
| **Backlog Project Meta** | ✅ Done | `app/api/integrations/backlog/project-meta/route.ts` |
| **Billing Enforcement** | ✅ Hardened | `lib/billing/planLimits.ts` (atomic, race-condition safe, per-user) |
| **Billing UI** | ✅ Done | `app/(dashboard)/billing/page.tsx` (plan comparison, usage bars, portal) |
| **Branding (server-side)** | ✅ Done | `app/f/[slug]/page.tsx` (per-user subscription check) |
| **Onboarding** | ✅ Done | `components/onboarding/OnboardingChecklist.tsx`, `app/(dashboard)/settings/` |
| **Legal Pages** | ✅ Done | `app/terms/page.tsx`, `app/privacy/page.tsx` |
| **Error Pages** | ✅ Done | `app/error.tsx`, `app/not-found.tsx` |
| **SEO Metadata** | ✅ Done | `app/layout.tsx` (Japanese, proper title/description) |
| **Rate Limiting** | ✅ Hardened | IP 10/min submit, 30/min read, Backlog 500/h, magic link 3/email/10min |
| **CSRF Protection** | ✅ Done | Origin/Referer validation in `proxy.ts` |
| **Encryption** | ✅ AES-256-GCM | `lib/crypto.ts` (PBKDF2 key derivation) |
| **Security Headers** | ✅ Done | `proxy.ts` (CSP, X-Frame-Options, Permissions-Policy, etc.) |
| **Sentry Monitoring** | ✅ Done | `sentry.client.config.ts`, `sentry.server.config.ts`, `global-error.tsx` |
| **Analytics** | ✅ Done | Plausible (conditional via `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) |
| **UI/UX Redesign** | ✅ Done | Fillout.com-inspired aesthetic (Inter font, soft shadows, pill CTAs) |
| **i18n** | ✅ JA/EN | `lib/i18n/` (full coverage) |
| **Subscription Cache** | ✅ 60s TTL | `lib/billing/subscription.ts` |
| **Tests** | ✅ 279 passing | `test/` (security, architecture, i18n, billing, backlog) |

### Pending Features

| Feature | Priority | Notes |
|---------|----------|-------|
| **LemonSqueezy Deploy** | High | Configure store/variant IDs, webhook secret, deploy for public URL |
| **Landing Page Polish** | Medium | Better copywriting, SEO, conversion CTAs |
| **Documentation JP** | Medium | User guide, FAQ |
| **Performance Testing** | Low | Load test, < 3s |

---

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle
- **Validation**: Zod
- **Email**: Resend (magic link delivery)
- **Fonts**: Inter + Noto Sans JP (via `next/font/google`)
- **Tests**: Node.js native `node:test`
- **Package Manager**: pnpm

### Auth System (Magic Link)

1. User enters email on `/login`
2. Server generates token (32 bytes), stores SHA-256 hash in `magic_links` table
3. Email sent via Resend with magic link (`/api/auth/verify?token=xxx`)
4. User clicks link → token verified → user upserted in `users` table → session cookie set
5. First login = automatic registration (no separate signup flow)
6. Rate limited: 3 magic links per email per 10 minutes

### Multi-User Data Isolation

- Every form has a `user_email` column
- All queries scoped by authenticated user's email
- Billing (subscriptions, plan limits) scoped per user
- Integrations (Backlog connections) scoped per user

### Project Structure

```
formgate/
├── app/
│   ├── (dashboard)/           # User pages (protected)
│   │   ├── forms/             # Form management
│   │   │   ├── [id]/          # Form detail, submissions, integrations
│   │   │   │   ├── edit/      # Form field builder UI
│   │   │   │   └── integrations/backlog/  # Backlog settings + field mapping UI
│   │   │   └── new/           # Create form
│   │   ├── billing/           # Subscription management
│   │   └── settings/          # User settings, Backlog connection
│   ├── api/
│   │   ├── auth/              # Login (magic link), verify, logout
│   │   ├── forms/             # Form CRUD API (billing enforced, user-scoped)
│   │   ├── public/forms/[slug]/ # Public submission API (rate limited + billing)
│   │   ├── integrations/      # Backlog connection + project-meta
│   │   └── billing/           # LemonSqueezy checkout, portal, webhooks
│   ├── f/[slug]/              # Public form page
│   └── login/                 # Login page (email-only)
├── lib/
│   ├── auth/                  # Session, cookies, magic link, requireUser guard
│   ├── backlog/               # Backlog API client, issue builder
│   ├── billing/               # Plan limits enforcement (per-user)
│   ├── db/                    # Drizzle schema, connection, queries
│   ├── email/                 # Resend email client
│   ├── http/                  # Rate limiting (hardened), error helpers
│   ├── i18n/                  # Translations (ja, en)
│   └── validation/            # Zod schemas (forms, fields, backlogMapping)
├── drizzle/                   # SQL migrations (0001-0006)
├── test/                      # All tests (279)
├── proxy.ts                   # Auth proxy + security headers + CSRF
├── CLAUDE.md                  # CTO brief for Claude
└── README.md                  # This file
```

---

## Database Schema

### Tables

```sql
-- users: Registered users (auto-created on first magic link login)
users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ
)

-- magic_links: Magic link tokens for authentication
magic_links (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,      -- SHA-256 hash of token
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,           -- Set when used (single-use)
  created_at TIMESTAMPTZ
)

-- forms: Form definitions (user-scoped)
forms (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  fields JSONB DEFAULT '[]',     -- Custom field definitions
  user_email TEXT,               -- Owner email (multi-user)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- submissions: Form submissions
submissions (
  id UUID PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ
)

-- subscriptions: Billing (LemonSqueezy)
subscriptions (
  id UUID PRIMARY KEY,
  user_email TEXT NOT NULL,
  status TEXT NOT NULL,          -- 'active' | 'inactive'
  ls_subscription_id TEXT UNIQUE,
  ls_customer_id TEXT,
  updated_at TIMESTAMPTZ
)

-- integration_backlog_connections: Global Backlog config (per user)
integration_backlog_connections (
  id UUID PRIMARY KEY,
  user_email TEXT NOT NULL,
  space_url TEXT NOT NULL,
  api_key TEXT NOT NULL,         -- AES-256-GCM encrypted
  default_project_key TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- integration_backlog_form_settings: Per-form Backlog settings
integration_backlog_form_settings (
  form_id UUID PRIMARY KEY REFERENCES forms(id),
  enabled BOOLEAN DEFAULT false,
  project_key TEXT,
  field_mapping JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

## API Endpoints

### Auth
- `POST /api/auth/login` - Send magic link email
- `GET /api/auth/verify?token=xxx` - Verify magic link, create session
- `POST /api/auth/logout` - Logout

### Forms (Authenticated, user-scoped, billing enforced)
- `GET /api/forms` - List user's forms
- `POST /api/forms` - Create form (checks plan form limit)
- `GET /api/forms/[id]` - Get form (ownership verified)
- `PATCH /api/forms/[id]` - Update form
- `DELETE /api/forms/[id]` - Delete form

### Submissions (Authenticated)
- `GET /api/forms/[id]/submissions` - List with pagination, filters
- `GET /api/forms/[id]/submissions/export` - CSV export

### Public (rate limited, billing enforced)
- `GET /api/public/forms/[slug]` - Get form info (30/min rate limit)
- `POST /api/public/forms/[slug]/submit` - Submit form (10/min rate limit)

### Integrations (Authenticated)
- `GET /api/integrations/backlog` - Get Backlog connection
- `POST /api/integrations/backlog` - Create/update connection
- `DELETE /api/integrations/backlog` - Delete connection
- `POST /api/integrations/backlog/test` - Test connection
- `GET /api/integrations/backlog/project-meta` - Get issue types, priorities, custom fields
- `GET /api/forms/[id]/integrations/backlog` - Form Backlog settings
- `POST /api/forms/[id]/integrations/backlog` - Update form settings

### Billing
- `POST /api/billing/checkout` - LemonSqueezy checkout
- `GET /api/billing/portal` - Customer portal
- `GET /api/billing/status` - Subscription status
- `POST /api/billing/webhook` - LemonSqueezy webhook (public, HMAC-verified)

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
APP_ENC_KEY=random-32-char-string-for-encryption
AUTH_SECRET=random-secret-for-session-signing

# Email (magic link)
RESEND_API_KEY=re_...                    # Resend API key
EMAIL_FROM=onboarding@resend.dev         # Sender (prod: noreply@formgate.jp)

# Optional
APP_URL=https://formgate.jp              # Public URL (for magic link emails)
TRUSTED_PROXY=1                          # Enable proxy header trust
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_VARIANT_ID=...
NEXT_PUBLIC_SENTRY_DSN=...
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=...
```

---

## Security Implementation

### Magic Link Auth (`lib/auth/magicLink.ts`)
- 32-byte cryptographically random token
- SHA-256 hash stored in DB (token never stored in plaintext)
- 15-minute expiration
- Single-use (marked as used atomically)
- Rate limited: 3 per email per 10 minutes

### Encryption (`lib/crypto.ts`)
- AES-256-GCM authenticated encryption
- Key derivation: PBKDF2 from APP_ENC_KEY
- 12-byte random IV per encryption
- Used for: Backlog API keys

### Rate Limiting (`lib/http/rateLimit.ts`)
- In-memory sliding window
- Public form submit: 10/min per IP
- Public form read: 30/min per IP (anti-enumeration)
- Magic link: 3/email/10min + 10/IP/10min
- Backlog API: 500/hour per spaceUrl
- **Hardened IP extraction**: Proxy headers only trusted when `TRUSTED_PROXY=1`

### CSRF Protection (`proxy.ts`)
- Origin/Referer header validation on all mutations
- Allows JSON content-type without Origin (curl/server-to-server)

### Billing Enforcement (`lib/billing/planLimits.ts`)
- Atomic transactions (race-condition safe)
- All limits scoped per user (multi-user safe)
- Free plan: 1 form, 50 submissions/month

### Security Headers (`proxy.ts`)
- Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- X-XSS-Protection, Referrer-Policy, Permissions-Policy

---

## Testing

```bash
pnpm test                    # Run all 279 tests
pnpm test -- --grep "field"  # Run specific tests
```

### Test Categories
- `test/fields.test.ts` - Custom fields validation
- `test/fieldBuilder.test.ts` - Field builder client-side validation
- `test/backlog.mapping.test.ts` - Field mapping functions and schemas
- `test/security.exploits.test.ts` - Attacker-perspective security tests
- `test/security.comprehensive.test.ts` - Security comprehensive tests
- `test/security.api-auth.test.ts` - Cookie/input security
- `test/rateLimit.test.ts` - Rate limiting with TRUSTED_PROXY
- `test/api.backlog-form-settings.handlers.test.ts` - Backlog settings handlers
- `test/auth.requireUser.test.ts` - Auth helpers
- `test/crypto.test.ts` - Encryption
- `test/i18n.test.ts` - Translations
- `test/architecture.test.ts` - Code organization

---

## Recent Commits

```
76a246c feat(auth): replace password auth with magic link + multi-user support
4e5c32f fix(deploy): copy static assets into standalone output for Railway
61f7ab9 fix(deploy): require Node >= 20.9.0 for Next.js 16
b329bd4 feat(onboarding,settings,monitoring): onboarding flow, settings page, Sentry, Plausible, Railway
0239997 style(ui): redesign all pages with Fillout.com-inspired aesthetic
```

---

## Pricing Model

| Plan | Forms | Submissions | Price |
|------|-------|-------------|-------|
| Free | 1 | 50/month | 0 JPY |
| Starter | 5 | 500/month | 2,980 JPY/month |
| Pro | Unlimited | 5,000/month | 9,800 JPY/month |
| Enterprise | Custom | Custom | 30,000+ JPY/month |

---

## License

Proprietary. All rights reserved.

---

*Last updated: 19 February 2026*
