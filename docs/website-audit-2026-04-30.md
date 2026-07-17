# Website audit and implementation report — 2026-04-30

## Scope

Website repo:

`C:\Users\recoveryadmin\OneDrive - Deco Metal\WORK\OTHERS\MASTER - YASH\MARKETING\TECH\WEBSITE\existing-new\work`

Focus:

- Website only.
- Process page.
- Portal boundary page.
- Insights/articles image usage from `C:\Users\recoveryadmin\OneDrive - Deco Metal\OTHERS\Desktop\website`.
- Local build and audit readiness.

## Frontend-design skill considered

Reviewed `https://skills.sh/anthropics/skills/frontend-design`.

Relevant guidance applied:

- Avoid generic AI-looking frontend output.
- Choose a clear aesthetic direction.
- Match implementation complexity to purpose.
- Use distinctive visual assets and production-grade details.

Decision for Moldart:

- Use a refined industrial / technical-trade aesthetic, not playful/maximalist redesign.
- Keep process and portal pages controlled and sober because they communicate trust, workflow discipline, and private access boundaries.
- Use the custom editorial images for articles instead of generic generated poster-only visuals.

## Implemented in this pass

### 1. Editorial insight images integrated

Source folder checked:

`C:\Users\recoveryadmin\OneDrive - Deco Metal\OTHERS\Desktop\website`

Findings:

- 31 individual `ChatGPT Image...png` files.
- 5 contact sheet JPGs.
- Individual images are `1672x941`.

Action:

- Created optimized 1200x630 editorial JPGs under:

`images/insights/editorial/`

- Created 31 article-specific images.
- Updated insight preview/OG logic to prefer editorial images when available.
- Generated product-library insight posters remain as fallback for generated articles.

Validation:

- `editorialJpgCount=31`
- Example article now uses:

`/images/insights/editorial/press-plates-pads-smart-tooling-perfect-panels.jpg?v=2026.52`

### 2. Process page improved

Page:

`/process/`

Changes:

- Fixed H1 text accessibility so extracted text is now:

`FROM INQUIRY TO CONTROLLED DELIVERY.`

- Added `HowTo` schema for the six-step RFQ-to-delivery sequence.

Validation:

- Desktop/mobile overflow: none.
- Console errors: none.
- Bad network responses: none.
- Empty images: 0.

### 3. Portal page checked and kept private

Page:

`/portal/`

Current decision:

- Keep as private access boundary.
- Keep `noindex, nofollow, noarchive`.
- Do not expose real dashboard/RFQ/order pages publicly.

Changes:

- Contact intent links now prefill form route for:
  - `/contact/?intent=portal-access`
  - `/contact/?intent=buyer-rfq`

Validation:

- Desktop/mobile overflow: none.
- Console errors: none.
- Bad network responses: none.
- Empty images: 0.

### 4. Sitewide static issues fixed

Changes:

- Removed empty lightbox image placeholder that created `<img src="">` across generated pages.
- Added noindex, description, and H1 content to legacy redirect pages.

Validation:

Static public artifact audit:

- HTML files checked: 170.
- Issue counts: `{}`.

### 5. Version bumped

- Previous local ready version: `2026.51`.
- New local ready version after this pass: `2026.52`.

## Validation run

Passed:

- `node --check generate.js`
- `npm run test:ows-intake`
- `npm run build`
- static public artifact audit: no issues found
- process/portal browser audit: pass
- full Playwright site audit: pass
- preview smoke: pass
- sitemap duplicate check: pass

Sitemap:

- `sitemap_locs=157`
- `sitemap_unique=157`
- `sitemap_dupes=0`

Playwright audit:

- Key desktop pages: no overflow.
- Mobile home: no overflow.
- Insight phone audit: 127 article URLs at 360px and 430px.
- Console errors: none.
- Table overflow: none.
- H1 too small: none.

## Known remaining limitations

- Production live site is still not updated unless deployed.
- Full Lighthouse was not run because Lighthouse is not installed locally.
- Build skipped optional asset processing because local optional tools were unavailable:
  - `sharp`
  - `cleancss`
  - `terser`

## Recommended next step

Next best step is visual review of the 31 editorial article images in-browser before deployment.

Why:

- The images are now technically integrated and optimized.
- Need human confirmation that each image matches its article topic well.
- After visual approval, deploy `public-site/` as website version `2026.52`.
