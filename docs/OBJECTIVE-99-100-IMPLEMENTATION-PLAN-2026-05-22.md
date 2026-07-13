# Moldart Website — Objective 99–100/100 Implementation Plan

**Date:** 2026-05-22  
**Goal:** Raise the Moldart public website to an objectively defensible 99–100/100 overall score, not by opinion, but by passing measurable release gates.

## 1. Definition of 99 or 100/100 overall

| Category | Weight | 99–100 requirement |
|---|---:|---|
| Technical SEO + indexability | 15 | 100% canonical, sitemap, robots, metadata, schema, redirects, no broken links. |
| Performance + Core Web Vitals | 20 | Lighthouse preview: Performance ≥95 mobile and desktop; LCP ≤2.5s, CLS ≤0.05, TBT ≤100ms. |
| Accessibility + UX | 15 | Lighthouse Accessibility ≥95; keyboard/mobile/manual checks pass; no critical a11y defects. |
| Security + privacy | 15 | Strong headers; no script unsafe-inline; remove/justify style unsafe-inline; protected forms; no leaked secrets. |
| Content/E-E-A-T/conversion | 15 | Real proof, clear company story, product/solution trust content, strong CTAs, no thin critical pages. |
| Forms/API reliability | 10 | Cloudflare preview + local lead-intake tests pass; D1/webhook/Turnstile/env validated. |
| Release process/maintainability | 10 | Clean branch, CI green, no blind generated-file chaos, rollback documented. |

**Target:** 99+ weighted score.  
**100/100 allowed only if every gate passes with no material caveats.**

## 2. Current blockers preventing objective 99–100

1. Current worktree had **373 changed paths**; release state must be cleaned/classified.
2. `.github/workflows/quality.yml` references missing package scripts.
3. Fresh Lighthouse proof is missing; old `lighthouse-home.json` is stale.
4. `style-src 'unsafe-inline'` remains because inline styles remain.
5. `404.html` meta description is only 29 characters.
6. `site-overrides.css` is 112.2KB and needs dead/duplicate CSS audit.
7. Lead intake passes local dry-run but needs Cloudflare preview POST/env validation.
8. About/Solutions/Products/Process need stronger proof and E-E-A-T content.

## 3. Implementation phases

### Phase 1 — Release-state cleanup and safety
- Create a clean release branch.
- Inventory all changed paths.
- Classify each as source, generated artifact, docs, config, or unwanted.
- Keep only intentional release changes.

**Gate:** clean/intentionally dirty release branch with a file classification note.

### Phase 2 — Fix CI and local quality gates
- Add or align missing scripts: `format:check`, `lint:js`, `test:unit`, `secretlint:check`, `license:check`, `security:deps`, `lint:css`, `lint:html`, `unused:check`.
- Add missing dev dependencies where needed, especially `vitest` and `lighthouse`.
- Wire `tests/lead-intake-core.test.mjs` into `npm run test:unit`.

**Gate:** `npm ci`, `npm run build`, `npm run release:check`, `npm run goal`, and `npm run test:unit` all pass locally and in GitHub Actions.

### Phase 3 — Technical SEO hardening
- Fix 404 meta description in `generate.js`.
- Rebuild.
- Validate titles, descriptions, H1, canonicals, OG, JSON-LD, sitemap, redirects, noindex.
- Review Product `Offer` semantics for truthful B2B use.
- Decide and enforce Cloudflare preview noindex policy.

**Gate:** 0 invalid JSON-LD, 0 broken references, 0 metadata defects, representative rich-result validation passes.

### Phase 4 — Performance and Core Web Vitals
- Add Lighthouse tooling or Lighthouse CI.
- Audit/reduce `site-overrides.css`.
- Move reusable inline styles from `generate.js` into CSS classes.
- Rebuild.

**Gate on Cloudflare preview:** Performance ≥95, Accessibility ≥95, Best Practices ≥95, SEO 100, LCP ≤2.5s, CLS ≤0.05, TBT ≤100ms.

### Phase 5 — Accessibility and interaction QA
- Keyboard-test nav, command palette, mobile menu, contact form, resource gate.
- Screen-reader label/status checks.
- Test mobile widths 360/390/430/tablet/desktop.

**Gate:** no console errors, no mobile overflow, Lighthouse Accessibility ≥95, manual keyboard checklist passes.

### Phase 6 — Security/CSP/forms hardening
- Remove inline styles or replace with hashes/classes.
- Remove `style-src 'unsafe-inline'` if possible.
- Verify headers on representative preview routes.
- Align API routing to Cloudflare Pages Functions.
- Test lead endpoint for valid, invalid, spam, Turnstile-required, and preview-safe success paths.
- Add rate-limit/WAF recommendation.

**Gate:** no script unsafe-inline, preferably no style unsafe-inline, preview API tests pass, no secrets exposed.

### Phase 7 — Content/E-E-A-T/conversion hardening
- About: timeline, leadership expertise, proof blocks.
- Products: RFQ tables, sample/approval checkpoints.
- Solutions: right-fit/wrong-fit guidance, outcome proof.
- Process: RFQ → sample → document → dispatch → reorder workflow.
- FAQ: MOQ, lead time, samples, QC, China sourcing, payment/logistics objections.

**Gate:** no thin critical pages; every major conversion route has proof + next step; copy is accurate and not overclaiming.

### Phase 8 — Cloudflare preview validation
Run against preview URL:
```bash
npm run release:check
npm run goal
node scripts/moldart-quality-monitor.mjs --base=https://<preview-url>
npm run audit:site -- https://<preview-url>
npm run compare:live-draft -- --draft=https://<preview-url> --live=https://moldartindia.com
```
Also verify `/`, `/products/`, `/solutions/`, `/resources/`, `/insights/`, `/contact/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/api/lead-intake`.

**Gate:** all preview gates pass, Lighthouse passes, manual visual QA passes.

### Phase 9 — Final production release checklist
- Prepare final release notes.
- Include changed files, test outputs, Lighthouse results, preview URL, rollback instructions.
- Get explicit approval.
- Deploy production only after approval.
- Run post-deploy smoke tests.

## 4. Exact final evidence required to claim 99–100

The final report must include:
1. Git branch and clean status summary.
2. Cloudflare preview URL.
3. Local gate outputs.
4. Cloudflare preview gate outputs.
5. Lighthouse mobile/desktop JSON summary.
6. Internal link scan: 0 missing.
7. JSON-LD validation: 0 invalid.
8. Metadata scan: 0 defects.
9. Header scan for representative routes.
10. Lead-intake preview API test result.
11. Manual QA checklist.
12. Rollback instructions.

Without these, the honest score remains below 99.

## 5. Expected outcome

If all gates pass:

| Category | Target score |
|---|---:|
| Technical SEO + indexability | 15/15 |
| Performance + Core Web Vitals | 19–20/20 |
| Accessibility + UX | 15/15 |
| Security + privacy | 14–15/15 |
| Content/E-E-A-T/conversion | 14–15/15 |
| Forms/API reliability | 10/10 |
| Release process/maintainability | 10/10 |

Expected defensible outcome: **99/100**.  
Possible **100/100** only if Lighthouse, CSP, CI, API, and manual QA have zero caveats.
