# Moldart Website — Final Draft Implementation Report

**Date:** 2026-05-23  
**Production deployed:** No  
**Draft alias:** https://draft-audit-fixes.moldart-home.pages.dev  
**Unique draft deployment:** https://f086087a.moldart-home.pages.dev

## What was implemented

1. **Performance-safe hero asset tightening**
   - Homepage now preloads the primary above-fold hero image: `/images/page5_img2.webp`.
   - Only the primary hero image remains `loading="eager"` + `fetchpriority="high"`.
   - Secondary hero images now load lazily, avoiding three competing high-priority hero image requests.

2. **Schema accuracy tightened**
   - Product schema no longer claims `price: 0` or fixed `priceCurrency`.
   - Product `Offer` now states the truth: B2B pricing, MOQ, Incoterm, and delivery timing are quoted after RFQ review.
   - JSON-LD remains syntactically valid across the generated artifact.

3. **E-E-A-T / proof content strengthened**
   - About page now includes an “Evidence discipline / Proof before promise” section.
   - Added explicit proof logic for RFQ review, approval control, and route honesty.
   - This supports the site’s commercial trust profile without overclaiming private case studies.

4. **Cloudflare preview form validation**
   - `/api/lead-intake` tested on the draft Cloudflare Pages deployment.
   - Preview POST returns `201` with `destinations:["preview-dry-run"]` and no warnings.

5. **Draft-only Cloudflare deployment completed**
   - Deployed to branch `draft-audit-fixes` only.
   - No production deployment was run.

## Evidence gates run

| Gate | Result |
|---|---:|
| `npm run build` | PASS |
| `npm run format:check` | PASS |
| `npm run lint:js` | PASS |
| `npm run test:unit` | PASS |
| `npm run secretlint:check` | PASS |
| `npm run license:check` | PASS |
| `npm run security:deps` | PASS, 0 high vulnerabilities |
| `npm run lint:css` | PASS |
| `npm run lint:html` | PASS |
| `npm run unused:check` | PASS |
| `npm run release:check` | PASS |
| `npm run goal` | PASS |
| Preview quality monitor | PASS |
| Preview full site audit | PASS |
| Live/draft comparison | PASS |
| Preview `/api/lead-intake` POST | PASS, 201 |
| Preview homepage CSP unsafe-inline check | PASS, no unsafe-inline on main homepage CSP |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 |
| Lighthouse Performance | FAIL, still below target |

## Current final draft scores

| Parameter | Current draft rating | Notes |
|---|---:|---|
| Technical SEO / metadata / links | 100/100 | Release gate and audit pass. |
| Structured data syntax | 100/100 | 241 JSON-LD blocks, 0 invalid after rebuild. |
| Schema truthfulness | 94/100 | Misleading zero-price claim removed; rich-result manual validation still required. |
| Accessibility | 100/100 | Lighthouse Accessibility 100 and mobile audit clean. |
| Best Practices | 100/100 | Lighthouse Best Practices 100. |
| Security headers, main pages | 96/100 | Main homepage CSP has no unsafe-inline; legacy `/open-wood-science/*` keeps scoped unsafe-inline. |
| Forms/API preview reliability | 92/100 | Preview dry-run passes; production D1/webhook/Turnstile still needs live validation. |
| Content / E-E-A-T | 86/100 | About proof section added; still needs deeper case-style proof and author/reviewer modules. |
| Mobile UX | 100/100 | 360/430 checks pass with 0 overflow and 0 console errors. |
| Release process | 88/100 | Local gates pass; worktree remains dirty and needs clean release branch before production. |
| Observability | 62/100 | Monitoring/logging not yet provisioned. |
| Performance / Core Web Vitals lab | 61–79/100 observed | Lighthouse remains variable and below the 99–100 target. Latest preview: Performance 0.61, LCP ~4.9s, TBT ~899ms. Best local post-fix observed: Performance 0.79, TBT 0, LCP ~4.9s. |

## Honest status

The draft is substantially tightened and safe to review, but it is **not yet objectively 100/100 for every website parameter** because Lighthouse Performance/Core Web Vitals and observability remain below the required evidence threshold.

The site is now stronger than the prior draft in schema truthfulness, proof messaging, hero image priority, local quality gates, and Cloudflare preview form behavior. The remaining gap is real and measurable: homepage LCP is still too slow in Lighthouse because the LCP element is the homepage H1 text block and render timing remains above target.

## Remaining work to reach defensible 99–100/100

1. Split critical homepage CSS from the large shared CSS system without delaying hero rendering.
2. Reduce `site-overrides.css` and `pages.css` substantially; current Lighthouse still reports large unused CSS savings.
3. Move remaining legacy `/open-wood-science/*` inline styles/scripts to external files and remove the scoped unsafe-inline CSP exception.
4. Provision production Cloudflare D1, webhook secrets, Turnstile secret, WAF/rate-limit rule, and synthetic uptime check.
5. Add production observability: Cloudflare Web Analytics or equivalent, function logs/Logpush, uptime checks.
6. Run Lighthouse on a clean non-OneDrive environment or CI runner to avoid the Chrome temp cleanup `EPERM` issue and collect final mobile/desktop JSON.
7. Cut a clean release branch from the current dirty worktree before any production deployment.

## Review link

Open this draft for visual/content review:

https://draft-audit-fixes.moldart-home.pages.dev

Production remains untouched.
