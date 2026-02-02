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

## AUDIT À FAIRE

### Phase 1 : Sécurité (CRITIQUE)
- [ ] Auth/Session : cookie httpOnly/secure, CSRF, expiration, guards admin
- [ ] API Backlog : token storage encrypted, pas côté client, rate limit, error handling
- [ ] Formulaire public : validation Zod stricte, rate limit IP, CAPTCHA, SQL injection
- [ ] Secrets : .env sécurisé, variables env, rotation tokens
- [ ] Logs : pas de données sensibles loggées

### Phase 2 : Architecture
- [ ] Structure code : séparation, réutilisabilité, testabilité
- [ ] Database : indexes, relations, migrations propres
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
- [ ] Tests sécurité passés
- [ ] Rate limiting actif
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

1. Lis ce fichier en entier avant toute action
2. Fais un audit complet avant de modifier
3. Priorise sécurité > stabilité > reste
4. Commit + push chaque changement significatif
5. Messages commit clairs : `fix(security): ...`, `feat(form): ...`, `refactor(api): ...`
6. Si doute → demande avant d'agir

---

*Dernière mise à jour : 2 février 2026*
