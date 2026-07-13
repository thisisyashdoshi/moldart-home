# Moldart Website — Final Section-by-Section 100-Point Audit

**Date:** 2026-05-22  
**Scope:** `TECH/WEBSITE/existing-new/work/` source + generated `public-site/` + Cloudflare/GitHub/Pi tooling evidence.  
**Correction:** Scores below are **per section/part out of 100**, not one overall site score.

## Evidence checked

- Local/source files: `generate.js`, `build.js`, `_headers`, `_redirects`, `robots.txt`, `site.webmanifest`, `lead-forms.js`, `main.js`, CSS, data JSON, functions, workflows, docs.
- Artifact: `public-site/` has **643 files**, **193 HTML files**, **83 sitemap URLs**, **241 JSON-LD blocks**, **0 invalid JSON-LD**, **0 missing internal references across 6,256 checked references**.
- Social images: **34 PNGs** in source and artifact, all valid **1200×630**.
- Pi tooling: `pi-use-claude-seo` installed with **25 skills**, **18 agents**, **31 scripts**; `pi.csv` has **2,939 rows** and was searched for SEO/audit/security/performance tooling.
- Tests run and passed: `node --check generate.js`, `npm run build`, `npm run release:check`, `npm run goal`, `node scripts/test-lead-intake.mjs`, `npm run preview:ensure`, `node scripts/moldart-quality-monitor.mjs --base=http://127.0.0.1:4173`, `npm run audit:site -- http://127.0.0.1:4173`, `npm run compare:live-draft -- --draft=http://127.0.0.1:4173 --live=https://moldartindia.com`.
- Hard blockers found: dirty worktree (**373 changed paths**), GitHub quality workflow references missing scripts, stale Lighthouse evidence, remaining `style-src 'unsafe-inline'`, 404 meta description too short.

## Section scores

| Section / part | Score /100 | Aggressive verdict |
|---|---:|---|
| Homepage | **88** | Strong, not perfect. Needs fresh Lighthouse, less inline styling, stronger above-fold proof. |
| About | **86** | Improved human story, but still not enough trust/proof/timeline for a 100 B2B credibility page. |
| Contact + lead UX | **88** | Good form UX and dry-run API pass; production D1/webhook/Turnstile path unproven. |
| Explore/search hub | **90** | Excellent discovery hub; heavy page and needs mobile/search QA proof. |
| Products hub + 16 pages | **91** | Strongest commercial section after insights; schema valid, but B2B offer semantics/proof need hardening. |
| Solutions hub + 6 pages | **89** | Good architecture; needs outcome proof, wrong-fit/right-fit guidance, and comparison tables. |
| Resources/downloads | **90** | Strong utility layer; needs document freshness/versioning and gated-download QA. |
| Insights hub + 52 live articles | **92** | Best content section; needs author/reviewer/freshness improvements and inline-style cleanup. |
| FAQ + Process | **88** | Correct schema; process content is too light for a perfect sourcing workflow page. |
| Legacy redirects/applications/old insights | **82** | Functional noindex redirect layer; meta-refresh/HTML stubs are not ideal. |
| 404/error handling | **78** | Lowest page-quality score; meta description is only 29 chars and recovery UX is weak. |
| Portal/login public boundary | **84** | Static portal safely excluded; final Next portal routing and public entry policy still need hardening. |
| Search/JS/interactions | **86** | Lean JS and no console errors; needs automated keyboard/a11y interaction tests. |
| SEO/crawl/schema system | **93** | Excellent foundation; needs external rich-result validation, 404 fix, preview noindex policy review. |
| Performance/assets/CWV | **84** | Good stack, but not 99: `site-overrides.css` is 112.2KB, Lighthouse missing/stale, inline styles remain. |
| Security/CSP/headers | **86** | Strong headers; script CSP hash is good, but `style-src 'unsafe-inline'` remains. |
| Cloudflare/GitHub/release process | **76** | Weakest operational area: dirty worktree and workflow/package-script mismatch make blind release unsafe. |
| Forms/API backend | **86** | Modular and testable; dry-run passes, but production bindings and unit-test wiring are incomplete. |

## Key section findings and exact path to 99–100

### 1. Homepage — 88/100
Evidence: 1 H1, title 60 chars, description 136 chars, 4 JSON-LD blocks, nav/footer/OG present, ~821 words, 7 inline styles.  
To reach 99–100: move inline styles to classes, add a compact verifiable trust strip, run fresh mobile/desktop Lighthouse on Cloudflare preview, manually verify CTA paths.

### 2. About — 86/100
Evidence: 1 H1, title 26 chars, description 165 chars, WebPage + BreadcrumbList, ~567 words, 13 inline styles.  
To reach 99–100: add a 1989-to-now timeline, 2–3 anonymized proof blocks, clearer leadership expertise bullets, and CSS-class-based team image styling.

### 3. Contact + lead UX — 88/100
Evidence: ContactPage schema, valid metadata, form present, `test-lead-intake` returns `201` dry-run.  
To reach 99–100: test real Cloudflare preview POST, confirm D1/webhook/Turnstile env bindings, add API rate limiting/WAF rule, and add lead tests to release gate.

### 4. Explore/search hub — 90/100
Evidence: 1 H1, valid metadata/schema, ~4,064 words, ~188.9KB HTML, no broken references.  
To reach 99–100: test filters/search on 360/390/430 widths, lazy-render dense below-fold blocks if needed, add search/no-result/download analytics.

### 5. Products — 91/100
Evidence: 17 live pages, all with valid H1/meta/canonical/OG/nav/footer; 51 JSON-LD blocks; average ~705 words.  
To reach 99–100: review B2B `Offer` schema accuracy, add MOQ/lead-time/RFQ tables where truthful, add product proof/checkpoints, reduce 152 inline styles.

### 6. Solutions — 89/100
Evidence: 7 live pages, all valid metadata/canonical/OG/nav/footer; 14 JSON-LD blocks; average ~649 words.  
To reach 99–100: add per-solution proof, right-fit/wrong-fit guidance, comparison tables, and only add Service/OfferCatalog schema if factually accurate.

### 7. Resources/downloads — 90/100
Evidence: 27 downloads, 18 PDFs, 0 PDFs above Cloudflare 25MB asset limit, resource page metadata valid.  
To reach 99–100: add document version/last-reviewed labels, file size/type labels, and preview-test every gated/ungated download.

### 8. Insights — 92/100
Evidence: 52 live articles, 0 live metadata/schema/nav/footer defects, 155 live JSON-LD blocks, average live article ~1,619 words, mobile audit found 0 overflow/table/console errors.  
To reach 99–100: add author/reviewer/last-reviewed components, prune or justify 95 noindex redirect pages, move 518 inline styles to CSS, run fresh Lighthouse.

### 9. FAQ + Process — 88/100
Evidence: FAQPage and HowTo schema present; both pages structurally valid.  
To reach 99–100: expand process proof around RFQ inputs, samples, documents, dispatch, reorder; add real buyer-objection FAQs around MOQ, lead time, samples, QC, payment, China sourcing.

### 10. Legacy redirects — 82/100
Evidence: 7 application redirects and 95 old insight redirects are noindex/refresh with canonicals.  
To reach 99–100: move legacy mappings into `_redirects` where possible, keep HTML stubs only where necessary, validate every old URL destination.

### 11. 404 — 78/100
Evidence: 1 H1, title 30 chars, description 29 chars, nav/footer/OG present.  
To reach 99–100: expand description to 80–150 chars, add search and key route recovery links, add contact fallback CTA.

### 12. Portal/login boundary — 84/100
Evidence: `public-site/portal/index.html` excluded; `login/index.html` is noindex; repo rules say real portal belongs in `trade-portal/`.  
To reach 99–100: enforce artifact exclusion continuously, finalize `/portal` public routing policy, keep protected routes in Next middleware/server checks.

### 13. Search/JS/interactions — 86/100
Evidence: `main.js` 15.2KB, `lead-forms.js` 6.4KB, 111 search items, no console errors in audit.  
To reach 99–100: add Playwright/DOM tests for nav/search/forms, keyboard-only QA, screen-reader status checks.

### 14. SEO/crawl/schema — 93/100
Evidence: 83 sitemap URLs, 241 valid JSON-LD blocks, AI crawler-friendly robots, LLMS files pass release gate.  
To reach 99–100: run external rich-results validation, fix 404 description, review product Offer semantics, decide preview noindex policy because preview root returns `index, follow` while non-root pages return `noindex`.

### 15. Performance/assets/CWV — 84/100
Evidence: `styles.css` 36.2KB, `pages.css` 61.7KB, `site-overrides.css` 112.2KB, `main.js` 15.2KB, `lead-forms.js` 6.4KB. `lighthouse` is not currently resolvable as a dependency; old Lighthouse file is stale.  
To reach 99–100: add/run Lighthouse on preview, reduce/de-duplicate `site-overrides.css`, remove inline styles, prove Performance/Accessibility/Best Practices ≥95 and SEO 100.

### 16. Security/CSP/headers — 86/100
Evidence: strong headers; precise CSP check shows `script-src` has no `unsafe-inline`, but `style-src` still has `unsafe-inline`.  
To reach 99–100: remove inline styles, remove `style-src 'unsafe-inline'`, align Cloudflare API routes, add route-level header tests and API rate limits.

### 17. Cloudflare/GitHub/release — 76/100
Evidence: `master`, GitHub remote correct, `wrangler.toml` correct, but worktree has 373 changed paths and `.github/workflows/quality.yml` references missing package scripts.  
To reach 99–100: create clean release branch, classify all changed paths, fix `package.json` scripts or workflow, add CI for build/release/goal/link/Lighthouse, require preview gate before production.

### 18. Forms/API backend — 86/100
Evidence: Pages Function exists, shared core/handler exist, lead-intake dry-run passes, tests exist but `package.json` lacks `test:unit`/visible `vitest`.  
To reach 99–100: wire `vitest`, add `test:unit`, run in CI, test preview POST with allowed origin, confirm production notification destination.

## No-compromise priority list

1. Fix GitHub Actions/package-script mismatch.
2. Clean/classify the 373-path worktree before any release.
3. Fix 404 meta description.
4. Add/run fresh Lighthouse on Cloudflare preview.
5. Validate Cloudflare preview lead-intake POST with real preview-safe env.
6. Decide preview noindex policy and stop draft URLs being indexable.
7. Move inline styles to CSS and remove `style-src 'unsafe-inline'`.
8. Reduce/de-duplicate `site-overrides.css`.
9. Add proof/timeline/case-study content to About, Solutions, Products, and Process.
10. Production deploy only after local gates + Cloudflare preview gates + manual QA + rollback notes.

## Final judgment

The strongest sections are **SEO/crawl/schema (93/100)** and **Insights (92/100)**. The weakest website page is **404 (78/100)**. The weakest operational part is **Cloudflare/GitHub/release process (76/100)**.

The website is materially strong, but **no section should be called 100/100 yet**. The path to 99–100 per section is clear and finite, but it requires proof: fixed CI, clean release branch, fresh Lighthouse, preview API validation, stronger proof content, and CSP/style cleanup.
