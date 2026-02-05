# FORMGATE

**FormGate** - Formulaires publics → Tickets Backlog automatiquement via API officielle.

> Stop request chaos.
> Every form submission becomes a proper Backlog issue.

---

## Quick Start

```bash
pnpm install
cp .env.example .env.local  # Configure DATABASE_URL, APP_ENC_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
pnpm drizzle-kit push       # Apply DB migrations
pnpm dev                    # Start dev server
pnpm test                   # Run 173+ tests
pnpm build                  # Production build
```

---

## Current State (5 Feb 2026)

### Implemented Features

| Feature | Status | Key Files |
|---------|--------|-----------|
| **Auth/Session** | ✅ Done | `lib/auth/session.ts`, `lib/auth/password.ts` |
| **Password Hashing** | ✅ PBKDF2 100k iter | `lib/auth/password.ts` |
| **Form CRUD** | ✅ Done | `app/api/forms/route.ts`, `app/api/forms/[id]/route.ts` |
| **Custom Fields** | ✅ Done | `lib/validation/fields.ts`, `lib/db/schema.ts` |
| **Field Mapping Backlog** | ✅ Done | `lib/validation/backlogMapping.ts`, `lib/backlog/issue.ts` |
| **Public Form Render** | ✅ Dynamic | `app/f/[slug]/public-form-client.tsx` |
| **Form Submission** | ✅ Done | `app/api/public/forms/[slug]/submit/route.ts` |
| **Backlog Connection** | ✅ Done | `lib/backlog/client.ts` |
| **Backlog Auto-Issue** | ✅ Done | Non-blocking on submit, with field mapping |
| **Backlog Project Meta** | ✅ Done | `app/api/integrations/backlog/project-meta/route.ts` |
| **Billing Enforcement** | ✅ Done | `lib/billing/planLimits.ts` (form count + submission limits) |
| **Rate Limiting** | ✅ Hardened | IP 10/min submit, 30/min read, Backlog 500/h |
| **CSRF Protection** | ✅ Done | Origin/Referer validation in `proxy.ts` |
| **Encryption** | ✅ AES-256-GCM | `lib/crypto.ts` (PBKDF2 key derivation) |
| **Security Headers** | ✅ Done | `proxy.ts` (CSP, X-Frame-Options, Permissions-Policy, etc.) |
| **i18n** | ✅ JA/EN | `lib/i18n/` (includes field mapping UI translations) |
| **Tests** | ✅ 173+ passing | `test/` (includes attacker-perspective security tests) |

### Pending Features

| Feature | Priority | Notes |
|---------|----------|-------|
| **Admin Field Builder UI** | High | Visual drag-drop interface for fields |
| **Stripe Integration** | Medium | Billing, subscriptions (replace LemonSqueezy) |
| **Webhooks** | Low | Notify external systems on submit |
| **Error Monitoring** | Low | Sentry integration |

---

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle
- **Validation**: Zod
- **Tests**: Node.js native `node:test`
- **Package Manager**: pnpm

### Project Structure

```
formgate/
├── app/
│   ├── (dashboard)/           # Admin pages (protected)
│   │   ├── forms/             # Form management
│   │   │   ├── [id]/          # Form detail, submissions, integrations
│   │   │   │   └── integrations/backlog/  # Backlog settings + field mapping UI
│   │   │   └── new/           # Create form
│   │   └── billing/           # Subscription management
│   ├── api/
│   │   ├── auth/              # Login/logout
│   │   ├── forms/             # Form CRUD API (billing enforced)
│   │   ├── public/forms/[slug]/ # Public submission API (rate limited + billing)
│   │   ├── integrations/      # Backlog connection + project-meta
│   │   └── billing/           # Stripe webhooks (auth protected)
│   ├── f/[slug]/              # Public form page
│   └── login/                 # Login page
├── lib/
│   ├── auth/                  # Session, password, admin guards
│   ├── backlog/               # Backlog API client, issue builder
│   ├── billing/               # Plan limits enforcement
│   ├── db/                    # Drizzle schema, connection
│   ├── http/                  # Rate limiting (hardened), error helpers
│   ├── i18n/                  # Translations (ja, en)
│   └── validation/            # Zod schemas (forms, fields, backlogMapping)
├── drizzle/                   # SQL migrations
├── test/                      # All tests (173+)
├── proxy.ts                   # Auth proxy + security headers + CSRF
├── CLAUDE.md                  # CTO brief for Claude
└── README.md                  # This file
```

---

## Field Mapping System

### Overview
Maps form submission fields to Backlog issue fields (summary, description, issue type, priority, custom fields).

### Mapping Configuration
```typescript
{
  summary?: {
    mode: "default" | "field" | "template",
    fieldName?: string,          // Map a specific form field
    template?: string            // e.g. "[{company}] {subject}"
  },
  description?: {
    mode: "auto" | "field" | "template",
    fieldName?: string,
    template?: string
  },
  issueTypeId?: number,         // Backlog issue type ID
  priorityId?: number,          // Backlog priority ID (2=High, 3=Normal, 4=Low)
  customFields?: [{
    backlogFieldId: number,
    formFieldName: string        // Map form field → Backlog custom field
  }]
}
```

### Key Files
- `lib/validation/backlogMapping.ts` - Zod schemas + template functions
- `lib/backlog/issue.ts` - `buildMappedIssue()` builds summary/description from mapping
- `app/api/integrations/backlog/project-meta/route.ts` - Fetches issue types, priorities, custom fields from Backlog API
- `app/(dashboard)/forms/[id]/integrations/backlog/BacklogSettingsClient.tsx` - Mapping UI

---

## Database Schema

### Tables

```sql
-- forms: Form definitions
forms (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  fields JSONB DEFAULT '[]',  -- Custom field definitions
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- submissions: Form submissions
submissions (
  id UUID PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,     -- Submitted data
  created_at TIMESTAMPTZ
)

-- subscriptions: Billing (LemonSqueezy)
subscriptions (
  id UUID PRIMARY KEY,
  user_email TEXT NOT NULL,
  status TEXT NOT NULL,       -- 'active' | 'inactive'
  ls_subscription_id TEXT UNIQUE,
  ls_customer_id TEXT,
  updated_at TIMESTAMPTZ
)

-- integration_backlog_connections: Global Backlog config
integration_backlog_connections (
  id UUID PRIMARY KEY,
  user_email TEXT NOT NULL,
  space_url TEXT NOT NULL,
  api_key TEXT NOT NULL,      -- AES-256-GCM encrypted
  default_project_key TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- integration_backlog_form_settings: Per-form Backlog settings
integration_backlog_form_settings (
  form_id UUID PRIMARY KEY REFERENCES forms(id),
  enabled BOOLEAN DEFAULT false,
  project_key TEXT,           -- Override default
  field_mapping JSONB,        -- Field mapping configuration
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

## Custom Fields System

### Field Types
- `text` - Single line text (minLength, maxLength)
- `email` - Email validation
- `number` - Numeric (min, max)
- `textarea` - Multi-line text
- `select` - Dropdown with options

### Field Definition Schema
```typescript
{
  name: string,       // ^[a-zA-Z][a-zA-Z0-9_]*$ (max 50)
  label: string,      // Display label (max 200)
  type: "text" | "email" | "number" | "textarea" | "select",
  required: boolean,
  placeholder?: string,
  options?: { value: string, label: string }[]  // For select
}
```

### Default Fields (backward compatibility)
```typescript
[
  { name: "email", label: "Email", type: "email", required: false },
  { name: "message", label: "Message", type: "textarea", required: true }
]
```

### Key Files
- `lib/validation/fields.ts` - Field schemas, buildSubmissionSchema()
- `lib/db/schema.ts` - forms.fields JSONB column
- `app/f/[slug]/public-form-client.tsx` - Dynamic field rendering
- `app/api/public/forms/[slug]/submit/route.ts` - Dynamic validation

---

## Security Implementation

### Password Hashing (`lib/auth/password.ts`)
- PBKDF2 with 100,000 iterations
- SHA-512 digest
- 32-byte random salt
- 64-byte derived key
- Format: `{salt_hex}:{hash_hex}`

### Encryption (`lib/crypto.ts`)
- AES-256-GCM authenticated encryption
- Key derivation: PBKDF2 from APP_ENC_KEY
- 12-byte random IV per encryption
- Used for: Backlog API keys

### Rate Limiting (`lib/http/rateLimit.ts`)
- In-memory sliding window
- Public form submit: 10/min per IP
- Public form read: 30/min per IP (anti-enumeration)
- Backlog API: 500/hour per spaceUrl
- **Hardened IP extraction**: Proxy headers (X-Forwarded-For, X-Real-IP) only trusted when `TRUSTED_PROXY=1`
- Without TRUSTED_PROXY: uses request fingerprint (`fp:{hash}`) to prevent IP spoofing via headers

### CSRF Protection (`proxy.ts`)
- Origin/Referer header validation on all mutation requests (POST/PUT/PATCH/DELETE)
- Blocks cross-origin form submissions
- Allows JSON content-type without Origin (for curl/server-to-server)
- Applied to both public and admin endpoints

### Billing Enforcement (`lib/billing/planLimits.ts`)
- `canCreateForm()`: enforces form count limits per plan
- `canSubmit()`: enforces monthly submission limits per plan
- Checked server-side on every form creation and submission
- Free plan: 1 form, 50 submissions/month

### Security Headers (`proxy.ts`)
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Middleware Route Coverage (`proxy.ts`)
- **Admin paths** (require auth): `/forms/*`, `/billing/*`, `/api/forms/*`, `/api/integrations/*`, `/api/billing/*`
- **Public paths** (no auth): `/`, `/login`, `/api/auth/*`, `/f/*`, `/api/public/*`, `/api/billing/webhook`, `/api/health/*`

### Security Audit Results
| Vulnerability | Severity | Status |
|--------------|----------|--------|
| Zero billing enforcement | CRITICAL | ✅ Fixed |
| Rate limit IP spoofing via XFF | HIGH | ✅ Fixed |
| `/api/billing/status` no auth | HIGH | ✅ Fixed |
| Middleware missing `/api/integrations/*` | MEDIUM | ✅ Fixed |
| No CSRF origin check | MEDIUM | ✅ Fixed |
| Public form GET no rate limit | LOW | ✅ Fixed |

---

## API Endpoints

### Auth
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout

### Forms (Admin, billing enforced)
- `GET /api/forms` - List all forms
- `POST /api/forms` - Create form (checks plan form limit)
- `GET /api/forms/[id]` - Get form
- `PATCH /api/forms/[id]` - Update form (name, slug, description, fields)
- `DELETE /api/forms/[id]` - Delete form

### Submissions (Admin)
- `GET /api/forms/[id]/submissions` - List with pagination, filters
- `GET /api/forms/[id]/submissions/export` - CSV export

### Public (rate limited, billing enforced)
- `GET /api/public/forms/[slug]` - Get form info (30/min rate limit)
- `POST /api/public/forms/[slug]/submit` - Submit form (10/min rate limit, monthly limit)

### Integrations (Admin)
- `GET /api/integrations/backlog` - Get Backlog connection
- `POST /api/integrations/backlog` - Create/update connection
- `DELETE /api/integrations/backlog` - Delete connection
- `POST /api/integrations/backlog/test` - Test connection
- `GET /api/integrations/backlog/project-meta` - Get issue types, priorities, custom fields
- `GET /api/forms/[id]/integrations/backlog` - Form Backlog settings (with field mapping)
- `POST /api/forms/[id]/integrations/backlog` - Update form settings (with field mapping)

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
APP_ENC_KEY=random-32-char-string-for-encryption
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=hashed-or-plain-password
AUTH_SECRET=random-secret-for-session-signing

# Optional
TRUSTED_PROXY=1                    # Enable proxy header trust (for reverse proxy setups)
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_API_KEY=...
```

---

## Testing

```bash
pnpm test                    # Run all 173+ tests
pnpm test -- --grep "field"  # Run specific tests
```

### Test Categories
- `test/fields.test.ts` - Custom fields validation (23 tests)
- `test/backlog.mapping.test.ts` - Field mapping functions and schemas (47 tests)
- `test/security.exploits.test.ts` - Attacker-perspective security tests (38 tests)
- `test/security.comprehensive.test.ts` - Security comprehensive tests
- `test/rateLimit.test.ts` - Rate limiting with TRUSTED_PROXY awareness
- `test/api.backlog-form-settings.handlers.test.ts` - Backlog settings handlers (10 tests)
- `test/password.test.ts` - Password hashing
- `test/crypto.test.ts` - Encryption
- `test/i18n.test.ts` - Translations

---

## Development Commands

```bash
pnpm dev                     # Start dev server (localhost:3000)
pnpm build                   # Production build
pnpm start                   # Start production server
pnpm test                    # Run tests
pnpm lint                    # ESLint
pnpm drizzle-kit push        # Apply schema changes to DB
pnpm drizzle-kit studio      # Open Drizzle Studio
```

---

## Git Workflow

```bash
# Current state
git log --oneline -5
# 11637c4 docs(claude): add mandatory README update instruction
# 2f07c28 docs: comprehensive README with technical state and resume instructions
# 4e8fb53 fix(config): correct drizzle schema path
# 4f89f66 feat(forms): add custom fields support
# 366696d fix(security): enhance crypto KDF and add security headers
```

---

## Resume Development with Claude

### Context Files (read these first)
1. `CLAUDE.md` - CTO brief, priorities, constraints
2. `README.md` - This file, technical state
3. `lib/validation/fields.ts` - Custom fields system
4. `lib/validation/backlogMapping.ts` - Field mapping schemas
5. `lib/db/schema.ts` - Database schema

### Next Tasks (Priority Order)

1. **Admin Field Builder UI** (High)
   - Visual interface to configure form fields
   - Files: `app/(dashboard)/forms/[id]/edit/`, new `components/FieldBuilder.tsx`
   - Drag-drop reordering, field type selection, live preview

2. **Stripe Integration** (Medium)
   - Replace LemonSqueezy with Stripe
   - Checkout, webhooks, subscription management
   - Files: `app/api/billing/`

3. **Error Monitoring** (Low)
   - Sentry integration for production error tracking

### Useful Prompts

```
"Continue implementing FormGate. Read CLAUDE.md and README.md first.
Current state: field mapping done, security hardened. Next: Admin Field Builder UI."

"Add Field Builder UI to FormGate admin. Allow drag-drop field
configuration with live preview. Read lib/validation/fields.ts for field types."

"Implement Stripe billing for FormGate. Plans: Free (1 form),
Starter (5 forms, 2980 JPY/mo), Pro (unlimited, 9800 JPY/mo).
Replace LemonSqueezy. Read lib/billing/planLimits.ts for plan enforcement."
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

*Last updated: 5 February 2026*
