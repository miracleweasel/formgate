# FORMGATE

**FORMGATE** is a Backlog-first micro-SaaS that turns structured forms into clean, actionable Backlog issues.

> Stop request chaos.  
> Every form submission becomes a proper Backlog issue.

---

## 🎯 What problem does FORMGATE solve?

In many Japanese teams using Backlog, requests arrive via:
- email
- Slack / LINE
- meetings / oral instructions

Result:
- issues created late or not at all
- inconsistent priority / type / assignee
- messy tracking and follow-up

**FORMGATE removes friction before Backlog**:
- structured public forms
- strict validation
- explicit field mapping
- automatic issue creation via Backlog API

---

## 🧠 Positioning (Non-negotiable)

- 🇯🇵 **Japan-first**
- 🎯 **Backlog-first** (Notion later, optional)
- ❌ **No AI** (generic AI cannot act reliably inside Backlog)
- ❌ No CSV cleaning / no Zapier-style complexity
- 🧱 Utility SaaS, not hype
- Built for **solo dev**, low support, fast ROI

---

## ✨ MVP Scope (Form → Backlog)

### Core
- Public form creation
- Field types: text, textarea, select
- Basic validation (required, length)
- One public URL per form

### Backlog integration
- User-provided Backlog API key
- Select:
  - Project
  - Issue type
  - Priority
  - Assignee
- Field mapping → description / custom fields
- Automatic issue creation on submit

### Platform
- Simple auth
- Usage limits by plan
- Minimal logs (debug / errors only)

---

## 🔐 Security & API

- Uses official Backlog API
- API keys provided by the user
- Keys stored encrypted
- No data reuse outside the user’s intent

---

## 💰 Pricing (indicative)

- **Free**: 1 form / 1 project
- **Pro**: ~1,500 JPY / month
- **Team**: ~3,000 JPY / month

---

## 🧰 Tech Stack

- **Frontend / API**: Next.js (App Router, TypeScript)
- **Database**: Supabase Postgres
- **ORM**: Drizzle
- **Hosting**: Vercel
- **Package manager**: pnpm

No background jobs. No AI. No over-engineering.

---

## 📁 Project structure

```text
formgate/
├─ app/              # Next.js app & API routes
├─ drizzle/          # DB schema & migrations
├─ lib/              # db, env, crypto utilities
├─ public/
├─ README.md
├─ drizzle.config.ts
└─ .env.example
