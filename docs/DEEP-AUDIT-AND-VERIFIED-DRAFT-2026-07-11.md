# Moldart Website — Deep Audit and Verified Draft

> **Superseded:** Use `docs/DEEP-CATALOGUE-AUDIT-AND-FINAL-DRAFT-2026-07-12.md` for the current catalogue audit, immutable deployment, verification evidence, and production blockers.

**Updated:** 2026-07-11  
**Production deployed:** **No**  
**Stable review draft:** https://draft-audit-fixes.moldart-home.pages.dev  
**Immutable verified deployment:** https://78deb77a.moldart-home.pages.dev  
**Verified build:** `2026.07.11.ab153fee40e3.b35e5ee230`  
**Production:** https://moldartindia.com

## 1. Executive result

The draft has materially improved across performance, visual consistency, mobile behaviour, accessibility, privacy, security, content integrity, SEO safety, and release verification. Production remains untouched.

The last fully defensible holistic assessment remains approximately **91/100**. The current artifact passes the automated technical release matrix, but it is **not honestly certifiable as 99/100 or 100/100** until required human, legal, business-evidence, operational, field-performance, and clean-release evidence exists.

The frozen acceptance standard is documented in `docs/FINAL-99-100-ACCEPTANCE-GATES-2026-07-11.md`:

- **99/100:** every release-critical gate passes, zero open P0/P1 defects, and at most one documented non-critical maturity item remains.
- **100/100:** the 99/100 candidate plus completed human, legal, business, media-rights, production-operation, user-testing, and field evidence.

A 100/100 result is a dated evidence result, not a permanent guarantee.

## 2. What has been achieved

### Performance and delivery

- Homepage CSS is generated through fail-closed PurgeCSS processing.
- Homepage CSS is approximately **42.7 KiB**, down from approximately **185.2 KiB** for the full site bundle.
- Homepage PurgeCSS now uses homepage markup rather than retaining route-only classes found in shared JavaScript.
- Removed the non-LCP hero-image preload that competed with the text-first render; the image remains eagerly discoverable in page markup.
- Kept content-hashed asset versions and strict required-selector checks.
- Reduced avoidable layout and animation work and preserved reduced-motion behaviour.

### UI, UX, and mobile

- Locked the interface to Montserrat display headings and DM Sans body/UI text.
- Standardized desktop/mobile spacing, card radii, shadows, icon sizes, and icon strokes.
- Rebalanced the homepage hero and clarified the buyer-led RFQ path.
- Corrected mobile product ordering and insight metadata wrapping.
- Improved CTA wording, minimum RFQ guidance, search readiness, mobile menu behaviour, and WhatsApp access.
- Current exact-build screenshots show intact desktop and mobile rendering after the CSS reduction.

### Content integrity and permanent URLs

- Preserved all **51 permanent insight URLs** through `data/insight-url-contract.json`.
- Preserved scheduled LinkedIn destinations by rewriting content in place instead of changing insight URLs.
- Corrected the flooring category to **Laminate Flooring Systems** while retaining legacy URL paths.
- Removed unsupported flooring measurements and incorrect engineered-flooring claims.
- Removed Custom Furniture/CAD-CNC contamination from product-neutral sourcing guides.
- Corrected known HPL/LPL and other cross-product bindings.
- Removed fabricated publication dates and unsupported individual authorship.
- Removed generic article padding, public editorial counters, misleading “Optional” document labels, and known repeated boilerplate.
- Added scope, exclusions, evidence boundaries, RFQ inputs, workflows, and claim-status notices.
- Changed Explore to start without displaying the entire inventory until the buyer filters or searches.
- Added direct 301 mappings for surviving legacy furniture insight routes.

### Media integrity

- All 51 insight pages retain a visible cover.
- Every current generated cover is labelled **ILLUSTRATIVE RENDER** and explicitly excluded from product, project, facility, test, or certification evidence.
- Videos render only when directly and specifically mapped to an article.
- **19** guides currently have a directly mapped video; **32** correctly show no video instead of generic corporate padding.

### Privacy, security, and lead intake

- Added Privacy and Terms pages and linked them from the site footer and sitemap.
- Added mandatory privacy acknowledgement to contact and resource forms.
- Enforced consent in the server-side lead validator.
- Missing consent returns HTTP 400 in unit tests.
- Draft CSP excludes `unsafe-inline` and includes the required security-header set.
- High-severity dependency findings remain at zero; 17 moderate development-only Lighthouse/OpenTelemetry advisories remain.
- Secret and licence checks pass.

### Automated evidence registers

The artifact release gate now generates:

- `.tmp/product-claim-evidence-register.json` — **64** public product claims across 16 products.
- `.tmp/insight-technical-review-register.json` — **51** permanent guides awaiting named human technical review.
- `.tmp/media-rights-provenance-register.json` — **51** insight media records awaiting rights/provenance approval.

Null fields are intentional blockers. The system does not infer or invent business evidence, reviewer approval, or media rights.

## 3. Exact-build verification

### Automated checks

| Check | Result |
|---|---|
| Build and source/artifact version match | PASS |
| Format, JavaScript, CSS, and HTML checks | PASS |
| Unused/required-file check | PASS |
| Unit and consent-rejection tests | PASS |
| Secret scan | PASS |
| OSS licence scan | PASS |
| Dependency audit at high severity | PASS |
| Artifact release gate | PASS — 0 failures |
| Quality monitor | PASS |
| Axe on 11 representative routes | PASS — 0 violations |
| Site/browser audit | PASS — no tested overflow or console errors |
| All 52 insight routes at 360 px and 430 px | PASS |
| Three-valid-run Lighthouse budget | PASS |

### Exact-build Lighthouse median

| Metric | Result | Budget |
|---|---:|---:|
| Performance | **95** | ≥90 |
| Accessibility | **100** | ≥85 |
| Best Practices | **100** | ≥85 |
| SEO | **100** | ≥90 |
| FCP | **1.394 s** | ≤1.8 s |
| LCP | **1.835 s** | ≤2.5 s |
| CLS | **0.0034** | ≤0.1 |
| TBT | **200 ms** | ≤200 ms |

Windows Chrome still exits non-zero during temporary-profile cleanup, but all three Lighthouse reports were valid and parsed before cleanup. This known harness issue is not represented as a website failure.

### Remote draft verification

- Stable and immutable draft URLs serve build `2026.07.11.ab153fee40e3.b35e5ee230`.
- Seven representative routes were checked on both hosts and returned HTTP 200.
- Both draft hosts return `X-Robots-Tag: noindex, nofollow, noarchive`.
- Laminate taxonomy, sourcing-guide neutrality, and illustrative-media labels were confirmed remotely.
- Immutable preview lead intake returned HTTP 201 with `destinations:["preview-dry-run"]`.
- Production returned HTTP 200 and remains `index, follow`.

## 4. Current blockers to 99/100 and 100/100

### Release-critical evidence still missing

1. **Product claim approval:** all 64 public specification claims require approved source, test method, conditions, product/lot scope, revision, owner, and contractual status.
2. **Technical review:** all 51 guides require a named competent reviewer, qualification, review date, approved revision, and result.
3. **Legal approval:** Privacy, Terms, processors, retention, rights-request handling, and jurisdiction wording require qualified counsel.
4. **Media rights:** all insight covers require rights/provenance and business approval; social preview crops should be normalized to 1200×630.
5. **Manual accessibility:** keyboard, zoom, forced-colour, reduced-motion, NVDA/Chrome, and VoiceOver/Safari evidence is required.
6. **Browser/device testing:** current Safari, Firefox, Edge, iOS, and Android evidence is required.
7. **Production lead operations:** Turnstile, D1, webhook/email delivery, retries, deduplication, WAF/rate limits, monitoring, alerts, backup, and rollback are not proven by preview dry-run.
8. **Field performance and SEO:** 28-day production p75 LCP/INP/CLS, production crawl, schema validation, Search Console coverage, and sitemap monitoring are required.
9. **Buyer-task testing:** representative buyers must complete product discovery, evidence review, and RFQ tasks successfully.
10. **Clean release hygiene:** the authoritative worktree is heavily dirty. Production must be prepared in an isolated clean Git worktree with an intentional diff and rollback manifest.
11. **Least-privilege deployment:** the scoped Cloudflare token still fails authentication; the draft used the existing Infisical-managed global-key fallback. Production must use a repaired least-privilege token.

### Known non-production dependency risk

`npm audit` reports 17 moderate findings in Lighthouse’s development-only Sentry/OpenTelemetry chain. The available forced fix would downgrade Lighthouse and is not accepted without a controlled compatibility review.

## 5. Required path to the final score

1. Complete and approve the three generated evidence registers.
2. Obtain legal review and record the approved revision.
3. Run and record the manual accessibility and browser/device matrix.
4. Prove lead delivery and abuse controls in a production-like environment.
5. Repair the least-privilege Cloudflare credential.
6. Create an isolated clean release worktree and port only approved changes.
7. Rebuild and rerun the complete exact-artifact matrix.
8. Obtain explicit production approval before any production or DNS action.
9. Deploy the exact approved artifact, run post-deployment smoke and rollback checks, and monitor for 24 hours.
10. Complete the agreed 28-day field-performance, Search Console, and buyer-task evidence window.

No code or visual tuning can truthfully substitute for these approvals and field results.

## 6. Production safety statement

No production deployment, DNS change, production Cloudflare setting change, or live content replacement was performed. All publishing remained on the existing `draft-audit-fixes` Cloudflare Pages branch. Production requires separate explicit approval after stakeholder, technical, legal, and release review.
