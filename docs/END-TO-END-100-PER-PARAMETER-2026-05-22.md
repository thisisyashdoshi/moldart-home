# Moldart Website — End-to-End 100/100 Per-Parameter Report

**Date:** 2026-05-22
**Scope:** Public marketing website under `MARKETING/TECH/WEBSITE/existing-new/work/` and its Cloudflare Pages artifact, GitHub repo, Cloudflare account state, and the broader `MARKETING/` workspace it sits inside.
**Goal:** Rate every measurable web parameter today, then define exactly what is required to take each one to 100/100.
**Guardrail:** This report does not deploy production. All current deploy/preview activity is on the non-production Cloudflare Pages branch `draft-audit-fixes`.

## 1. Methodology

I treat the website as 8 measurement domains and 22 measurable parameters. Each parameter has a scoring source, a current score out of 100 with evidence, and a plan to 100/100.

Domains:
1. Performance & Core Web Vitals
2. Accessibility
3. SEO & Discoverability
4. Structured Data & AI Search Readiness
5. Security & Privacy
6. Content / E-E-A-T / Conversion
7. Reliability & Forms/API
8. Release Process, Infra, and Observability

## 2. Summary table

| # | Parameter | Source | Current | Target | Gap to 100 |
|---|---|---|---:|---:|---|
| 1 | Lighthouse Performance (lab) | `.tmp/lighthouse-home.json` | 70 | 100 | LCP 5,218ms vs 2,500ms target; 168KB unused CSS. |
| 2 | Largest Contentful Paint (LCP) | Lighthouse | 19 | 100 | Heavy CSS, font hop, no above-fold image priority discipline. |
| 3 | First Contentful Paint (FCP) | Lighthouse | 69 | 100 | Render-blocking CSS chain. |
| 4 | Total Blocking Time (TBT) | Lighthouse | 88 | 100 | 315ms TBT vs 100ms target. |
| 5 | Cumulative Layout Shift (CLS) | Lighthouse | 100 | 100 | Already 0.0. |
| 6 | Interaction to Next Paint (INP) (field) | CrUX, not yet measured | n/a | Good <200ms | Need CrUX/PageSpeed field run. |
| 7 | Lighthouse Accessibility | Lighthouse | 100 | 100 | Hold + automated regression + manual reader pass. |
| 8 | Lighthouse Best Practices | Lighthouse | 100 | 100 | Hold + CSP-report drift. |
| 9 | Lighthouse SEO | Lighthouse | 100 | 100 | Hold + Rich Results verification. |
| 10 | On-page metadata integrity | Public scan | 100 | 100 | 193 pages, 0 issues. |
| 11 | Internal link/asset integrity | Public scan | 100 | 100 | 6,256 refs checked, 0 broken. |
| 12 | Sitemap/robots/LLMS files | Release gate | 100 | 100 | 83 URLs, llms.txt + llms-full.txt published; AI bots allowed. |
| 13 | Structured data validity | JSON-LD parse | 100 | 100 | 241 blocks, 0 invalid. |
| 14 | Schema breadth/accuracy | Manual + rich-result | 88 | 100 | Product Offer semantics need real B2B price/MOQ or removal. |
| 15 | Security headers + CSP | _headers + response | 96 | 100 | CSP hash-based; unsafe-inline only on /open-wood-science/*. |
| 16 | Forms / API (Cloudflare Function) | preview POST + dry-run | 88 | 100 | Production D1, Turnstile secret, WAF rate-limit still required. |
| 17 | PWA / Manifest correctness | manifest + sw.js | 92 | 100 | Manifest `display: browser`; sw.js self-unregisters; finalize policy. |
| 18 | Content E-E-A-T / proof | Manual content audit | 78 | 100 | Add proof/case studies, author/reviewer, timeline. |
| 19 | Conversion paths / CTA hygiene | Manual UX | 84 | 100 | Mobile CTA QA, intent copy, downloadable RFQ kits. |
| 20 | Mobile UX (360/390/430) | `audit:site` | 100 | 100 | 0 overflow, 0 console errors. |
| 21 | Release process / CI / Cloudflare | Repo + workflow + Wrangler | 86 | 100 | Worktree dirty (379 paths); CI now wired but needs clean branch. |
| 22 | Observability / monitoring | Cloudflare + logs | 62 | 100 | No production analytics/log drains/uptime checks documented. |

Strict overall weighted score (current): ~84/100.
After full plan executes and is proven: 99–100/100.

## 3. Domain-by-domain detail and exact path to 100

### Domain 1 — Performance & Core Web Vitals

Current evidence:
- Lighthouse local: Performance 70, A11y 100, BP 100, SEO 100.
- LCP 5,218 ms (target 2,500 ms).
- FCP 2,459 ms.
- TBT 315 ms.
- CLS 0.0.
- 168 KB unused CSS across site-overrides.css (115 KB), pages.css (63 KB), styles.css (37 KB).

To reach 100:
1. Build a minimal critical.css with only above-the-fold layout + typography rules; inline only if CSP hashes are added.
2. Defer non-critical CSS via rel=preload+media=print swap to media=all on DOMContentLoaded, with noscript fallback.
3. Audit and prune site-overrides.css by at least 50%.
4. Preload hero image with fetchpriority=high, set width/height, provide AVIF + WebP.
5. Verify font-display: swap and only preconnect what is used.
6. Run Lighthouse mobile + desktop on Cloudflare preview, target Performance ≥99 and LCP ≤2.5 s.
7. Add a PageSpeed/CrUX field gate before claiming 100.

Definition of done:
- Lighthouse Performance ≥99 on mobile and desktop on preview.
- LCP ≤2.5 s, CLS ≤0.05, TBT ≤100 ms.

### Domain 2 — Accessibility

Current evidence:
- Lighthouse Accessibility 100.
- audit:site mobile pass: 0 overflow, 0 console errors at 360/430 across 52 articles.
- Visible main nav restored; mobile menu has aria-expanded.

To reach 100 — and stay there:
1. Add Playwright (or equivalent) keyboard + reader tests for nav, command palette, mobile menu, contact form, resource gate.
2. Add automated axe-core pass on representative templates in CI.
3. Verify focus order and form-error messaging.
4. Document keyboard checklist in docs/.

### Domain 3 — SEO & Discoverability

Current evidence:
- Lighthouse SEO 100.
- 193 HTML pages, 0 metadata issues.
- Sitemap (83 URLs), image sitemap, llms.txt, llms-full.txt served.
- AI bots GPTBot/ClaudeBot/CCBot allowed in robots.txt.

To reach 100:
1. Validate Google Rich Results for Organization, Product, Article, FAQ.
2. Submit sitemap to Search Console + Bing Webmaster after production deploy is approved.
3. Confirm preview pages stay noindex, production stays indexable.
4. Keep insights `lastmod` discipline current.

### Domain 4 — Structured Data & AI Search Readiness

Current evidence:
- 241 JSON-LD blocks parsed; 0 invalid.
- Schemas include Organization+LocalBusiness, WebSite, WebPage, BreadcrumbList, Article, FAQPage, Product+Offer, ContactPage, HowTo.
- llms.txt / llms-full.txt published, pass release gate.

To reach 100:
1. Replace placeholder Offer data with truthful B2B pricing/MOQ/availability or remove pricing fields.
2. Add Person schema to author bylines for E-E-A-T.
3. Add reviewer/date-modified to insights where it exists editorially.
4. Re-run rich-result tests after any change.

### Domain 5 — Security & Privacy

Current evidence:
- Full security header set: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP.
- CSP uses per-script SHA-256 hashes, no `script-src unsafe-inline`.
- `style-src 'self'` site-wide; `unsafe-inline` only on `/open-wood-science/*` legacy subpages.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Light secret scan clean.

To reach 100:
1. Remove the `unsafe-inline` override on `/open-wood-science/*` by externalizing its inline styles/scripts.
2. Add Cloudflare WAF + rate-limit rules for `/api/lead-intake`.
3. Enforce Turnstile + bot management for write endpoints.
4. Add CSP-Report-Only collector for drift detection.
5. Confirm Cloudflare zone: Always Use HTTPS, TLS 1.2+, Brotli, HTTP/3.

### Domain 6 — Content / E-E-A-T / Conversion

Current evidence:
- 52 live insights, 16 products, 6 solutions, 27 downloads (18 PDFs).
- Average 585 words/HTML page; insights average ~1,619 words.
- About has founder/leadership narrative.

To reach 100:
1. Add explicit company timeline 1989→present with 4–6 milestones.
2. Add 2–3 anonymized sourcing proof blocks (sector, route, outcome).
3. Add visible author + reviewer + last-reviewed on insights.
4. Expand `/process/` into a real RFQ → sample → documents → dispatch → reorder workflow.
5. Add product RFQ confirmation tables and "what to confirm" lists.
6. Add a "what we will not quote on" trust block.
7. Wire analytics events for downloads, search, no-result, form submit.

### Domain 7 — Reliability & Forms/API

Current evidence:
- Cloudflare Pages Function /api/lead-intake returns 201 on Cloudflare preview with destinations: ["preview-dry-run"].
- Local test:unit (lead intake dry-run) passes and returns 201.
- CORS now allows *.moldart-home.pages.dev preview origins explicitly.
- D1, Turnstile, and webhook are wired but not validated end-to-end in production.

To reach 100:
1. Provision and bind production D1 LEADS_DB.
2. Set production secrets: TURNSTILE_SECRET_KEY, LEAD_WEBHOOK_URL, LEAD_WEBHOOK_TOKEN, ALLOWED_ORIGINS.
3. Add Cloudflare WAF + rate limit for /api/lead-intake.
4. Add synthetic post-deploy health check.
5. Vitest in CI (already wired via test:unit).
6. Split staging vs production environments in Cloudflare Pages.

### Domain 8 — Release Process, Infra, and Observability

Current evidence:
- Branch master, remote thisisyashdoshi/moldart-home.
- Worktree: 379 paths changed/untracked (232 M, 1 D, 146 untracked).
- wrangler.toml: pages_build_output_dir = "public-site".
- GitHub quality.yml referenced 9 missing scripts; all 9 are now wired in package.json.
- Full local gate sequence (12 scripts) currently passes.
- Lighthouse wired as lighthouse:check; first JSON report exists.
- Live preview at https://draft-audit-fixes.moldart-home.pages.dev (non-production).

To reach 100:
1. Cut a clean release branch; classify every changed path; drop noise.
2. Re-run the full gate sequence in GitHub Actions on the clean branch.
3. Add a Lighthouse step in CI for mobile + desktop on the preview URL.
4. Split Cloudflare Pages preview vs production environments.
5. Add observability: Cloudflare Web Analytics (or Plausible/Matomo), Logpush for /api/lead-intake, Uptime Kuma/Cloudflare health checks for moldartindia.com and /api/lead-intake.
6. Document a rollback plan.
7. Production deploy only after preview + Lighthouse + manual QA pass.

## 4. Current vs future ratings, side-by-side

| Parameter | Today | After plan |
|---|---:|---:|
| Lighthouse Performance | 70 | 99–100 |
| LCP | 19 | 100 (≤2.5s) |
| FCP | 69 | 100 |
| TBT | 88 | 100 |
| CLS | 100 | 100 |
| INP (field) | not measured | 100 (Good in CrUX) |
| Accessibility | 100 | 100 + automated guard |
| Best Practices | 100 | 100 + CSP report drift |
| Lighthouse SEO | 100 | 100 + Rich Results verified |
| Metadata integrity | 100 | 100 |
| Internal links | 100 | 100 |
| Sitemap/robots/LLMS | 100 | 100 |
| Structured data validity | 100 | 100 |
| Schema breadth/accuracy | 88 | 100 |
| Security headers + CSP | 96 | 100 |
| Forms/API | 88 | 100 |
| PWA/Manifest | 92 | 100 |
| Content / E-E-A-T | 78 | 99–100 |
| Conversion paths | 84 | 99–100 |
| Mobile UX | 100 | 100 |
| Release/CI/Cloudflare | 86 | 100 |
| Observability | 62 | 100 |
| Strict weighted overall | ~84 | 99–100 |

## 5. Minimal next steps, in order

1. Cut a clean release branch.
2. Reduce site-overrides.css and apply critical-CSS+defer strategy until Lighthouse Performance ≥95.
3. Re-deploy to the Cloudflare preview branch and re-run lighthouse:check, audit:site, goal, release:check.
4. Wire production secrets and bindings; test /api/lead-intake against the production project on the preview branch.
5. Add Cloudflare Web Analytics, Logpush, and uptime checks.
6. Add the content E-E-A-T blocks (timeline, proof, author/reviewer/last-reviewed, full process).
7. Submit Search Console / Rich Results checks.
8. Production deploy only after explicit approval.

## 6. Honest closing assessment

The website is technically very strong: schema is valid, headers are tight, links are intact, accessibility audits are clean, mobile UX is overflow-free, and AI/search bots are explicitly allowed. The two structural blockers preventing a real 99–100 today are performance (LCP) and release/observability hygiene. Both are concrete and finite.

Following the steps above gets every parameter to a defensible 99–100/100, supported by Lighthouse JSON, CI gates, Cloudflare preview evidence, and structured-data validation. Until that evidence exists, the honest current score is ~84/100 weighted, not 100.
