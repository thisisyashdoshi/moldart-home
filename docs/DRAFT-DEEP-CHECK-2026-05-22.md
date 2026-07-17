# Moldart Draft Deep Check — 2026-05-22

## Review guardrail
- **No production deployment was made.**
- **No Git push was made.**
- Draft preview currently runs locally at: `http://127.0.0.1:4173/`
- Build artifact for Cloudflare Pages remains local at: `public-site/`

## Current objective score
**Draft artifact score: 92 / 100**

This is now strong enough for owner review, but not yet a defensible 99–100/100 because several items require external/manual validation: real Lighthouse/PageSpeed runs against a public preview URL, final case-study/social-proof content, production form endpoint hardening, full removal of inline styles from CSP, and Cloudflare/GitHub account-level checks.

## Checks completed

### Local build and generated artifact
- `npm run build` — PASS
- `npm run release:check` — PASS
- `npm run goal` — PASS
- `npm run compare:live-draft` — PASS
- `node --check generate.js` — PASS
- Public artifact generated at `public-site/` with 643 files.
- Public artifact includes `_headers`, `_redirects`, `robots.txt`, sitemap, LLMS files, core CSS/JS, images, downloads, product pages, resources, insights, and contact page.

### Internal integrity scan
- 193 HTML files scanned in `public-site/`.
- 6,256 internal references checked.
- JSON-LD blocks parsed: 241.
- Broken public artifact references after allowing Cloudflare redirects: **0**.
- Bad JSON-LD blocks: **0**.
- Social image PNGs: **all 1200×630** after fix.

### GitHub / repo check
- Branch: `master`
- Remote: `https://github.com/thisisyashdoshi/moldart-home.git`
- Worktree has many local modifications and untracked files, so do **not** push blindly.
- GitHub workflows detected:
  - `.github/workflows/links.yml`
  - `.github/workflows/quality.yml`
- No deploy workflow was triggered or added in this pass.

### Cloudflare / deployment config check
- `wrangler.toml` exists.
- Cloudflare Pages output directory: `public-site`.
- `_headers` present in artifact.
- `_redirects` present in artifact.
- Portal paths are redirected/noindexed rather than shipped as public static portal files.
- Private/runtime paths are excluded from `public-site`.

## Fixes completed during this pass
1. **Social preview image correctness**
   - Fixed generator so social PNGs regenerate unless they are valid `1200×630` PNGs.
   - Rebuilt all invalid core social images that were previously 192×192 or invalid PNG content.

2. **Public artifact missing JS**
   - Added `lead-forms.js` to `build.js` public artifact copy list.
   - Added long-cache header for `/lead-forms.js` in `_headers`.
   - Rebuilt and confirmed public artifact has no missing internal references.

3. **Build safety**
   - Confirmed all current output remains local-only.
   - Confirmed artifact release gate passes.

## Remaining changes needed to reach 99–100/100

### P0 — must do before production push
1. **Review draft manually in browser**
   - Home, Solutions, Products, Resources, Insights, Contact.
   - Mobile widths: 360px, 390px, 430px.
   - Check nav, search, forms, WhatsApp/email CTAs, product cards, article pages.

2. **Create a real external preview URL**
   - Recommended only after manual approval: Cloudflare Pages preview deployment from a draft branch, not production.
   - Do not run production deploy from `master` until approved.

3. **Run Lighthouse/PageSpeed on the preview URL**
   - Required for real 99–100 score because local script checks do not replace browser field/lab scoring.

### P1 — recommended for 99/100
1. **Replace remaining `style-src 'unsafe-inline'`**
   - Move remaining inline styles into CSS classes or use CSP hashes.
   - This is a security hardening improvement; current script-src has been tightened, but style-src still allows inline styles.

2. **Harden product schema accuracy**
   - Current product pages include B2B offer metadata for structured data completeness.
   - For maximum accuracy, replace placeholder RFQ-style pricing with real price bands, MOQ, or omit rich-result targeting if no price can be public.

3. **Add proof/case-study section**
   - Add 2–4 anonymized real supply examples with sector, product route, approval flow, and outcome.
   - This is the biggest remaining trust/E-E-A-T gap.

4. **Form endpoint production hardening**
   - Move final lead handling to Cloudflare Functions/Pages Functions with spam protection, validation, and server-side notifications.
   - Confirm Formspree/FormSubmit fallbacks only if intentionally retained.

5. **Final OG image design review**
   - Images are technically correct now, but should be visually approved for brand quality before publishing.

### P2 — optional path to 100/100
1. Add Playwright visual regression snapshots for core templates.
2. Add CI gates for build, release gate, link scan, and Lighthouse CI on preview.
3. Add Cloudflare security/account checks: TLS mode, Always Use HTTPS, Brotli, Early Hints, asset caching, redirects, analytics.
4. Add Search Console/Bing verification and submit updated sitemap after production approval.
5. Add real customer proof, downloadable RFQ templates, and deeper product comparison tables.

## Current recommendation
Use the local preview first: `http://127.0.0.1:4173/`

If the draft looks visually correct, the next safe step is to create a **non-production Cloudflare Pages preview deployment** from a draft branch, then run Lighthouse/PageSpeed against that preview URL before merging or publishing production.
