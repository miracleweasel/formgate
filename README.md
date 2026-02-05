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
pnpm test                   # Run 166 tests
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
| **Public Form Render** | ✅ Dynamic | `app/f/[slug]/public-form-client.tsx` |
| **Form Submission** | ✅ Done | `app/api/public/forms/[slug]/submit/route.ts` |
| **Backlog Connection** | ✅ Done | `lib/backlog/client.ts` |
| **Backlog Auto-Issue** | ✅ Done | Non-blocking on submit |
| **Rate Limiting** | ✅ Done | IP 10/min, Backlog 500/h |
| **Encryption** | ✅ AES-256-GCM | `lib/crypto.ts` (PBKDF2 key derivation) |
| **Security Headers** | ✅ Done | `proxy.ts` (CSP, X-Frame-Options, etc.) |
| **i18n** | ✅ JA/EN | `lib/i18n/` |
| **Tests** | ✅ 166 passing | `test/` |

### Pending Features

| Feature | Priority | Notes |
|---------|----------|-------|
| **Field Mapping Backlog** | High | Map form fields → Backlog custom fields |
| **Admin Field Builder UI** | Medium | Visual drag-drop interface for fields |
| **Stripe Integration** | Medium | Billing, subscriptions |
| **Webhooks** | Low | Notify external systems on submit |

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
│   │   │   └── new/           # Create form
│   │   └── billing/           # Subscription management
│   ├── api/
│   │   ├── auth/              # Login/logout
│   │   ├── forms/             # Form CRUD API
│   │   ├── public/forms/[slug]/ # Public submission API
│   │   ├── integrations/      # Backlog connection
│   │   └── billing/           # Stripe webhooks
│   ├── f/[slug]/              # Public form page
│   └── login/                 # Login page
├── lib/
│   ├── auth/                  # Session, password, admin guards
│   ├── backlog/               # Backlog API client, issue builder
│   ├── db/                    # Drizzle schema, connection
│   ├── http/                  # Rate limiting, error helpers
│   ├── i18n/                  # Translations (ja, en)
│   └── validation/            # Zod schemas (forms, fields, etc.)
├── drizzle/                   # SQL migrations
├── test/                      # All tests
├── proxy.ts                   # Auth proxy + security headers
├── CLAUDE.md                  # CTO brief for Claude
└── README.md                  # This file
```

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
- Backlog API: 500/hour per spaceUrl

### Security Headers (`proxy.ts`)
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

---

## API Endpoints

### Auth
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout

### Forms (Admin)
- `GET /api/forms` - List all forms
- `POST /api/forms` - Create form
- `GET /api/forms/[id]` - Get form
- `PATCH /api/forms/[id]` - Update form (name, slug, description, fields)
- `DELETE /api/forms/[id]` - Delete form

### Submissions (Admin)
- `GET /api/forms/[id]/submissions` - List with pagination, filters
- `GET /api/forms/[id]/submissions/export` - CSV export

### Public
- `GET /api/public/forms/[slug]` - Get form info
- `POST /api/public/forms/[slug]/submit` - Submit form

### Integrations
- `GET /api/integrations/backlog` - Get Backlog connection
- `POST /api/integrations/backlog` - Create/update connection
- `DELETE /api/integrations/backlog` - Delete connection
- `POST /api/integrations/backlog/test` - Test connection
- `GET /api/forms/[id]/integrations/backlog` - Form Backlog settings
- `POST /api/forms/[id]/integrations/backlog` - Update form settings

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
APP_ENC_KEY=random-32-char-string-for-encryption
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=hashed-or-plain-password

# Optional
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_API_KEY=...
```

---

## Testing

```bash
pnpm test                    # Run all 166 tests
pnpm test -- --grep "field"  # Run specific tests
```

### Test Categories
- `test/fields.test.ts` - Custom fields validation (23 tests)
- `test/security.comprehensive.test.ts` - Attack simulations
- `test/password.test.ts` - Password hashing
- `test/crypto.test.ts` - Encryption
- `test/rateLimit.test.ts` - Rate limiting
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
# 4e8fb53 fix(config): correct drizzle schema path
# 4f89f66 feat(forms): add custom fields support
# 366696d fix(security): enhance crypto KDF and add security headers
# 487cbf4 merge: J8-2 backlog submit + admin guards

# Branch: main (3 commits ahead of origin)
git push  # To publish
```

---

## Resume Development with Claude

### Context Files (read these first)
1. `CLAUDE.md` - CTO brief, priorities, constraints
2. `README.md` - This file, technical state
3. `lib/validation/fields.ts` - Custom fields system
4. `lib/db/schema.ts` - Database schema

### Next Tasks (Priority Order)

1. **Field Mapping to Backlog** (High)
   - Map form fields → Backlog issue fields (summary, description, custom fields)
   - Files: `lib/backlog/issue.ts`, `app/api/forms/[id]/integrations/backlog/`
   - Add mapping config to `integration_backlog_form_settings` table

2. **Admin Field Builder UI** (Medium)
   - Visual interface to configure form fields
   - Files: `app/(dashboard)/forms/[id]/edit/`, new `components/FieldBuilder.tsx`
   - Drag-drop reordering, field type selection

3. **Stripe Integration** (Medium)
   - Replace LemonSqueezy with Stripe
   - Checkout, webhooks, subscription management
   - Files: `app/api/billing/`

### Useful Prompts

```
"Continue implementing FormGate. Read CLAUDE.md and README.md first.
Current state: custom fields done, need field mapping to Backlog."

"Add Field Builder UI to FormGate admin. Allow drag-drop field
configuration with live preview."

"Implement Stripe billing for FormGate. Plans: Free (1 form),
Starter (5 forms, 2980 JPY/mo), Pro (unlimited, 9800 JPY/mo)."
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
