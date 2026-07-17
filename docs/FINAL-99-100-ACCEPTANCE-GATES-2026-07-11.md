# Moldart Website — Frozen 99/100 and 100/100 Acceptance Gates

**Frozen:** 2026-07-11  
**Applies to:** the exact immutable release candidate and its production promotion  
**Rule:** weights and thresholds must not be changed after testing begins.

## Score interpretation

- **99/100 — release-ready:** every release-critical technical, content-integrity, privacy, security, accessibility, operational, and release-hygiene gate passes. At most one documented non-critical maturity item may remain.
- **100/100 — point-in-time evidence result:** the 99/100 candidate plus completed human, legal, business, media-rights, production-operation, user-testing, and field-performance evidence.
- **Not allowed:** rounding up, changing weights, hiding production features from tests, treating local Lighthouse or Axe alone as complete proof, or inventing claims, dates, reviews, clients, certifications, media rights, or performance evidence.

A 100/100 result is a dated test outcome, not a permanent guarantee.

## Frozen scorecard

| Category | Weight | Release-critical acceptance evidence |
|---|---:|---|
| UI and visual system | 8 | Approved desktop/mobile screenshots; spacing, typography, icons, radii, contrast, and responsive composition pass the locked design system. |
| UX and conversion | 10 | Representative buyer tasks complete without dead ends; clear RFQ path; forms and recovery states work; human task testing passes. |
| Mobile and responsive | 8 | No horizontal overflow or obstructed controls at 320, 360, 390, 430, 768, and 1024 px; current iOS and Android browser checks pass. |
| Accessibility | 10 | Automated Axe checks pass; keyboard, zoom, forced-colour, reduced-motion, NVDA/Chrome, and VoiceOver/Safari checks pass with recorded reviewer evidence. |
| Performance | 10 | Exact-build lab budgets pass; production field p75 LCP ≤2.5 s, INP ≤200 ms, and CLS ≤0.1 over the agreed 28-day window. |
| Technical SEO and discovery | 10 | Crawl, canonicals, sitemap, redirects, metadata, schema, robots, social previews, Search Console coverage, and permanent 51-insight URL contract pass. |
| Security | 10 | Strict headers/CSP, dependency gate, secret scan, origin and payload controls, Turnstile, WAF/rate limits, least-privilege deployment credential, and external application scan pass. |
| Privacy and legal | 8 | Consent enforcement passes and qualified counsel approves Privacy, Terms, retention, processors, rights requests, and jurisdiction wording. |
| Content, claims, and trust | 12 | Every public claim has source, method, condition, scope, revision, owner, and contractual status; all 51 guides receive named technical review; media provenance is approved. |
| Reliability and operations | 8 | Production-like lead delivery, retries, deduplication, D1/webhook/email, monitoring, alerts, backup, synthetic checks, and rollback are proven. |
| Maintainability and release hygiene | 6 | Clean isolated release worktree, intentional diff, reproducible build, immutable artifact, change approval, rollback manifest, and complete audit report. |
| **Total** | **100** | **No open P0/P1 defect or unqualified public claim.** |

## Evidence tiers

1. **Automated:** build, lint, unit, release gate, route, Axe, security-header, dependency, and exact-artifact checks.
2. **Human:** visual, keyboard, screen-reader, browser/device, technical-content, and buyer-task reviews with reviewer/date/result.
3. **Business/legal:** approved claim sources, media rights, counsel review, processors, retention, and named owners.
4. **Production/field:** real delivery checks, monitoring, Search Console, RUM/CrUX, incident and rollback evidence.

Automated evidence can qualify the candidate for technical review; it cannot substitute for tiers 2–4.

## Required release evidence package

- Immutable build ID and deployment URL.
- Full intentional-change manifest and clean Git status for the release candidate.
- Machine-readable artifact release report with zero failures.
- Product claim evidence register with zero unresolved public claims.
- 51-guide technical-review register.
- Media provenance and rights register.
- Counsel approval record for Privacy and Terms.
- Manual accessibility and browser/device matrix.
- Production-like lead-delivery and abuse-control report.
- External security scan report and least-privilege credential confirmation.
- Exact-build performance report plus 28-day production field report.
- Crawl, schema, redirect, sitemap, and Search Console evidence.
- Buyer-task usability report.
- Monitoring, alerting, backup, rollback, and post-deployment smoke report.

## Current rule for scoring

Until every required evidence item exists, report the last fully evidenced holistic score and list newer technical improvements separately. Do not award unverified points in advance.
