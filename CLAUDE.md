# FormGate - Brief CTO Complet

## PRODUIT

**Nom:** FormGate
**Concept:** Formulaires publics → Tickets Backlog automatiquement via API officielle
**Problème:** Formulaire → Mail → Copier → Backlog = perte de temps, erreurs, pas de traçabilité
**Solution:** Formulaire → Ticket direct dans Backlog
**Cible:** PME japonaises, équipes IT/support, utilisateurs Backlog (Nulab)
**Valeur:** Gain temps, 0 erreur, traçabilité, sécurité, conformité API officielle

---

## STACK TECHNIQUE

- Next.js 16
- TypeScript
- Drizzle ORM
- PostgreSQL (Supabase)
- Zod validation
- pnpm
- node:test

---

## CONTRAINTES STRICTES

- API officielle Backlog uniquement (PAS de scraping)
- Stockage minimal données
- JST timezone aware (Japon)
- Sécurité stricte : session cookie httpOnly/secure, guards, CSRF
- Pas de secrets côté client

---

## MODE CTO HARDCORE (PERMANENT)

### Rôle Claude
- Développeur senior + stratège marketing
- Responsable : qualité, sécurité, scalabilité, maintenabilité, commercialisation
- Aucun hack non documenté
- Aucune solution fragile
- Aucun compromis sécurité
- Toujours penser long terme + valeur revente

### Priorités (ordre strict)
1. **Sécurité** — non négociable
2. **Stabilité** — ça doit marcher
3. **Simplicité** — code lisible, maintenable
4. **UX** — onboarding < 5 min
5. **Business** — conversion, pricing
6. **Scaling** — prêt pour 1000 clients

### Philosophie
- Court terme : survivre (MVP fonctionnel, sécurisé, premiers clients)
- Moyen terme : stabiliser (rentabilité, processus, qualité)
- Long terme : dominer (scale, acquisition, ou exit)

---

## RISQUES TECHNIQUES IDENTIFIÉS

| Risque | Mitigation |
|--------|------------|
| Rate limit API Backlog (600 req/h) | Queue Bull, documenter limites, plan Pro |
| Échec API Backlog | Fallback email + retry 3x + logs DB |
| Spam formulaire public | Rate limit IP (10/min) + CAPTCHA optionnel + Zod strict |
| RGPD/JP compliance | Mention consentement, stockage 30j max |

---

## AUDIT RÉALISÉ

### Phase 1 : Sécurité (CRITIQUE) ✅ COMPLÉTÉ
- [x] Auth/Session : cookie httpOnly/secure/sameSite=lax, expiration 7j, guards admin via getAdminEmail
- [x] Password hashing : PBKDF2 100k iterations SHA-512 (lib/auth/password.ts)
- [x] API Backlog : token storage AES-256-GCM encrypted (PBKDF2 key derivation), rate limit 500 req/h
- [x] Formulaire public : validation Zod stricte, rate limit IP (10/min), max 50 champs, primitives only
- [x] Secrets : .env sécurisé, APP_ENC_KEY pour encryption, pas de secrets côté client
- [x] Logs : sanitized - pas de données sensibles loggées (erreurs sans stack traces)
- [x] Security headers : CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, etc. (proxy.ts)
- [x] Tests sécurité : 300 tests passant, attack simulations (SQL injection, XSS, path traversal, IP spoofing, CSRF, billing bypass)
- [x] CSRF protection : Origin/Referer validation sur toutes les mutations (proxy.ts)
- [x] Billing enforcement : limites form count + submissions/mois côté serveur (lib/billing/planLimits.ts)
- [x] IP extraction hardened : proxy headers ignorés sans TRUSTED_PROXY=1 (anti-spoofing)
- [x] Middleware coverage : /api/integrations/* et /api/billing/* protégés auth
- [x] Public form GET rate limited (30/min anti-enumeration)

### Phase 2 : MVP Features ✅ COMPLÉTÉ
- [x] Custom Fields : champs dynamiques (text, email, number, textarea, select)
  - lib/validation/fields.ts - schémas Zod pour définition des champs
  - lib/db/schema.ts - colonne `fields` JSONB sur table forms
  - Validation dynamique côté serveur avec buildSubmissionSchema()
  - Rendu dynamique dans public-form-client.tsx
  - Backward compatible: DEFAULT_FIELDS (email + message) si pas de champs définis
- [x] Field Mapping Backlog : mapper les champs vers Backlog custom fields
  - lib/validation/backlogMapping.ts - schémas Zod pour mapping
  - lib/backlog/issue.ts - buildMappedIssue() avec templates
  - app/api/integrations/backlog/project-meta/route.ts - metadata Backlog (issueTypes, priorities, customFields)
  - BacklogSettingsClient.tsx - UI complète pour configurer le mapping
  - drizzle/0005_add_backlog_field_mapping.sql - migration field_mapping JSONB
  - 47 tests unitaires (test/backlog.mapping.test.ts)
- [x] Admin Field Builder UI : interface pour configurer les champs
  - components/field-builder/ - Composants UI (FormEditClient, FieldList, FieldEditor, SelectOptionsEditor, FormPreview)
  - app/(dashboard)/forms/[id]/edit/page.tsx - Page d'édition
  - lib/i18n/types.ts, ja.ts, en.ts - Traductions fieldBuilder
  - test/fieldBuilder.test.ts - Tests client-side validation
  - Fonctionnalités: add/remove/reorder fields, type-specific options, live preview, validation temps réel

### Phase 2 : Architecture
- [x] Structure code : séparation, réutilisabilité, testabilité
- [x] Database : indexes, relations, migrations propres (drizzle/0004_add_form_fields.sql)
- [x] Race conditions : transactions atomiques pour forms + submissions (planLimits.ts)
- [x] Branding serveur : vérification subscription côté serveur (app/f/[slug]/page.tsx)
- [x] Billing env validation : 503 clair si LemonSqueezy pas configuré
- [x] Pages légales : CGU + Politique de confidentialité (app/terms/, app/privacy/)
- [x] SEO metadata : titre JP, description, lang="ja" (app/layout.tsx)
- [x] Error pages : 404 + 500 en japonais (app/error.tsx, app/not-found.tsx)
- [x] Billing UI : comparaison plans, barres d'usage, portail client (app/(dashboard)/billing/)
- [x] Dead code cleanup : lib/db.ts supprimé, pg désinstallé
- [ ] Performance : N+1 queries, caching, bundle size
- [ ] Scalabilité : prêt 100/1000 clients, bottlenecks identifiés

### Phase 3 : Produit/UX
- [ ] UI japonaise : conventions JP, terminologie, layout culturel
- [ ] Onboarding : < 5 min réel, points friction, guidance
- [ ] Copywriting : messages clairs JP, erreurs compréhensibles, CTAs efficaces
- [ ] Analytics : tracking events, funnel conversion

---

## BUSINESS MODEL

### Pricing
| Plan | Limites | Prix |
|------|---------|------|
| Free | 1 form, 50 sub/mois, branding | 0¥ |
| Starter | 5 forms, 500 sub/mois, sans branding | 2,980¥/mois (~18€) |
| Pro | Illimité, 5000 sub/mois, support prioritaire | 9,800¥/mois (~60€) |
| Enterprise | Custom, SLA, onboarding | 30,000¥+ (~180€+) |

### Marché
- TAM : 52,500 utilisateurs Backlog estimés
- SAM : 3,150 ont besoin intégration + prêts payer
- SOM An 1 : 31 clients = 6,700€ ARR (1% pénétration)

### Différenciateurs vs Zapier/Make
- Setup < 5 min (vs 20-30 min)
- Support japonais natif
- Spécialisé Backlog (pas généraliste)
- UI/UX japonaise
- Prix compétitif

---

## GO-TO-MARKET (Budget 0€)

1. **Partenariat Nulab** — devenir partenaire officiel, App Marketplace
2. **Content SEO JP** — Qiita, Note.com ("Backlog連携", "フォーム自動化")
3. **Community** — Nulab forums, Facebook groups PME JP
4. **Freemium viral** — watermark "Powered by FormGate"
5. **Outreach direct** — 20 emails/semaine ciblés

---

## PROJECTIONS (Side project 1-2h/jour)

### Timeline
- Mois 1-2 : Dev MVP (40-80h)
- Mois 3-4 : Validation marché (50-100 signups free)
- Mois 5-6 : Premiers payants (5-10 clients)
- Mois 7-12 : Croissance organique (20-50 clients)

### Seuils de décision
| Mois | Stop/Pivot | Continuer | Accélérer |
|------|------------|-----------|-----------|
| 6 | < 3 clients | 5-10 clients | > 15 clients |
| 12 | < 500€ MRR | 500-1,500€ MRR | > 2,000€ MRR |

---

## CHECKLIST PRÉ-LANCEMENT

### Technique
- [x] Tests sécurité passés (173+ tests, attack simulations, attacker-perspective tests)
- [x] Rate limiting actif (IP 10/min submit, 30/min read, Backlog API 500/h)
- [x] CSRF protection (proxy.ts)
- [x] Billing enforcement server-side (lib/billing/planLimits.ts)
- [ ] Error monitoring (Sentry)
- [ ] Backups DB automatiques
- [ ] SSL/HTTPS
- [ ] Performance < 3s load

### Produit
- [ ] Onboarding testé
- [ ] Documentation JP
- [ ] FAQ rédigée
- [ ] Email templates
- [ ] Terms of Service JP
- [ ] Privacy Policy (RGPD + JP)

### Business
- [ ] Stripe configuré
- [ ] Invoicing automatique
- [ ] Support email
- [ ] Analytics (Plausible)
- [ ] Landing page SEO

---

## WORKFLOW GIT

- Branches : `main` (prod), `dev` (développement), `feature/*` (features)
- Commits : messages clairs en anglais, format conventionnel
- PR : documentées, review avant merge
- Push : après chaque feature/fix complète

---

## INSTRUCTIONS CLAUDE CODE

1. Lis ce fichier + README.md en entier avant toute action
2. Fais un audit complet avant de modifier
3. Priorise sécurité > stabilité > reste
4. Commit + push chaque changement significatif
5. Messages commit clairs : `fix(security): ...`, `feat(form): ...`, `refactor(api): ...`
6. Si doute → demande avant d'agir
7. **OBLIGATOIRE : Mettre à jour README.md à chaque changement significatif** avec :
   - État actuel (features implémentées/en cours)
   - Derniers commits (hash + description)
   - Fichiers modifiés (avec leur rôle)
   - Prochaines tâches (priorité + fichiers concernés)
   - Prompts de reprise pour Claude (copy-paste ready)

---

*Dernière mise à jour : 14 février 2026*
