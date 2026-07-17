# Moldart Website — Deep Catalogue Audit and Final Review Draft

**Completed:** 2026-07-12  
**Production deployed:** **No**  
**Stable draft:** https://draft-audit-fixes.moldart-home.pages.dev  
**Immutable reviewed deployment:** https://af1f859d.moldart-home.pages.dev  
**Build:** `2026.07.12.ab153fee40e3.de75e18501`

## 1. Executive result

The website has been audited and improved across every public section, product discovery, claim handling, supplier privacy, structured data, accessibility, performance, security, content integrity, and branch-release verification.

The draft is technically suitable for stakeholder and evidence review. It is not yet eligible for an honest 99/100 or 100/100 production score because business, technical-review, media-rights, legal, production-operation, manual-accessibility, and field evidence remain incomplete.

The last fully defensible holistic assessment remains approximately **91/100**. Automated technical quality is materially higher, but unverified points have not been awarded.

## 2. Section-by-section audit outcome

| Section | Completed | Remaining before production |
|---|---|---|
| Global navigation and search | Product pages now activate Products rather than Solutions; product breadcrumbs use Products; search includes approved FPC tooling terms; conditional systems are excluded | Human keyboard/device testing and consent-compliant search analytics |
| Home | Existing RFQ-led hierarchy, responsive layout, fast text-first render, and route matrix retained | Stakeholder decision on whether electronics tooling needs additional homepage prominence |
| Explore | Starts without dumping the complete inventory; current approved products and FPC route are discoverable | Measure buyer searches and empty-result terms after launch |
| Products | Six planned systems map to existing public product routes; unsupported exact values were removed from generated product sheets; claim notices remain | Resolve 71 capability/application statements against approved evidence |
| Solutions | PCB/CCL solution expanded safely to PCB, CCL, FPC, smart-card, IC-substrate, security, and technical-laminate tooling requirements | Electronics consumables remain withheld until qualification |
| Resources | Existing gated documents and checklists remain available | Verify rights, revision, file format, review date, and technical applicability for each document |
| Insights | All 51 permanent URLs remain intact; taxonomy and media controls remain enforced | Named technical review of all 51 guides and media-rights approval |
| FAQ | Existing sourcing/RFQ content remains | Business-approved payment, sample, inspection, complaint, and dispatch language |
| About | Verified identity-led presentation retained | Approved team/process photographs, timeline, and genuine proof assets |
| Contact and lead intake | Privacy acknowledgement, server validation, preview dry-run, and accessible alert/status live regions pass | Production Turnstile, D1, webhook/email, rate-limit, retry, monitoring, and retention proof |
| Privacy and Terms | Pages, footer links, sitemap entries, and consent enforcement pass | Qualified legal counsel approval |
| Technical delivery | Strict preview CSP, security headers, noindex controls, accessibility, performance, route, schema, and release gates pass | Clean release worktree, least-privilege Cloudflare token, manual browser/a11y testing, and production field evidence |

## 3. Intended product-system coverage

Supplier identities, contacts, bank details, legal records, and qualification evidence remain outside the public artifact and ignored by Git.

| Intended system | Public status | Current treatment |
|---|---|---|
| Wood press pads and cushion accessories | **Partial active** | Press Pads page retained with requirement-led press, stack, construction, service-life, and replacement inputs. Brass, high-elastic, felt, wire-mesh, and related accessories remain qualification-only. |
| Wood press plates | **Partial active** | Press Plates page covers requirement-led MFC/TFL, HPL/CPL/compact, flooring, door, and furniture programmes. Finish, grade, chrome, hardness, flatness, and construction remain evidence-controlled. |
| Decor paper, MIP, films, and foils | **Printed decor paper active; other routes withheld** | Printed Decor Paper remains public. MIP and PP/PVC/PET/PETG films/foils are not presented as available until TDS, COA, sample-roll, process, and supplier evidence are approved. |
| Engineered boards, flooring, furniture components, and HPL | **Partial active** | Existing plywood, MDF/HDF, OSB, particleboard, flooring, accessories, and furniture routes remain. Special board declarations, HPL/compact, prelam, UV/AFP, fronts, and emission routes require separate approval. |
| Genuine vegetable parchment | **Withheld** | No public product, search result, solution claim, or availability statement. Requires legal identity, official contact, material proof, TDS, sample, use-case, and supply qualification. |
| Decorative stainless sheets and profiles | **Partial active** | Public nomenclature corrected to Decorative Stainless Steel Sheets. Grade, finish, coating, protection, fabrication, packing, and project fit remain programme-specific. |
| PCB/CCL/FPC plates and tooling | **Partial active** | Industrial Press Plates and PCB/CCL solution now include FPC, smart-card, IC-substrate, separator, carrier, top, bonding, caul, protection, and related tooling as requirement-led routes. Exact values require approved finished-part/QC evidence. |
| PCB/FPC pads and release/conformal/carrier films | **Withheld** | No public product or search result. Requires exact material, thickness, thermal/pressure conditions, process compatibility, TDS, sample, and qualified supply evidence. |

Private scope controls:

- `internal/planned-product-scope.json`
- `internal/SUPPLIER-QUALIFICATION-CHECKLIST.md`
- `internal/` is ignored by Git and excluded from the public build.

## 4. Claim and structured-data corrections

- Replaced unsupported exact public values in the generated product sheets with requirement-led selection and approval inputs.
- Removed the product-schema `InStock` declaration because no approved inventory record exists.
- Removed the Moldart `brand` declaration from sourced-product schema because brand ownership is not established for every route.
- Preserved technical evidence notices on all 16 product pages.
- Expanded the claim register from only specification rows to summaries, specifications, applications, customization statements, and grades.
- Current register result:
  - **164** public statements inventoried.
  - **93** are requirement-led boundary statements.
  - **71** capability/application statements still require approved business evidence.
- Confirmed the generated product pages no longer contain the previously identified unsupported cycle, width, GSM, tensile, density, thickness, hardness, roughness, flatness, tolerance, or certification values.

## 5. Supplier privacy and qualification controls

- No supplier names, contacts, WeChat IDs, Chinese telephone numbers, private mailboxes, bank details, or qualification packs were added to public source data or the deployment artifact.
- The release gate scans public text artifacts for supplier-contact patterns.
- Generic marketplace or industry evidence is not accepted as supplier-specific proof.
- The private qualification checklist requires legal identity, export authority, bank match, product evidence, samples, production/QC proof, inspection, packing, corrective action, named approval, expiry, and risk status.
- No supplier route should be described as fully approved until its private evidence pack is completed.

## 6. Verification evidence

### Exact-build automated checks

| Check | Result |
|---|---|
| Build and source/artifact version match | PASS |
| Format, JavaScript, CSS, HTML, and unused-file checks | PASS |
| Unit and consent-rejection tests | PASS |
| Secret and OSS licence scans | PASS |
| High-severity dependency threshold | PASS |
| Artifact release gate | PASS — 0 failures |
| Quality monitor | PASS — 0 failures |
| Axe on 11 representative routes | PASS — 0 violations |
| Site/browser audit | PASS |
| All 52 insight routes at 360 px and 430 px | PASS |
| Three-valid-run Lighthouse budget | PASS |
| Independent read-only reviewer | GO for draft deployment |

### Exact-build Lighthouse median

| Metric | Result | Budget |
|---|---:|---:|
| Performance | **98** | ≥90 |
| Accessibility | **100** | ≥85 |
| Best Practices | **100** | ≥85 |
| SEO | **100** | ≥90 |
| FCP | **1.667 s** | ≤1.8 s |
| LCP | **2.115 s** | ≤2.5 s |
| CLS | **0.0057** | ≤0.1 |
| TBT | **0 ms** | ≤200 ms |

### Remote draft verification

- Stable and immutable hosts serve build `2026.07.12.ab153fee40e3.de75e18501`.
- Eleven representative routes returned HTTP 200 on both draft hosts.
- Both draft hosts return `noindex, nofollow, noarchive`.
- FPC tooling coverage, decorative stainless sheet naming, Products navigation, and safe structured data were confirmed remotely.
- Vegetable parchment and electronics consumables are absent from public search.
- No supplier-contact pattern appears in public search data.
- Immutable preview lead intake returned HTTP 201 with `preview-dry-run`.
- Production remains on its prior homepage and `/styles.css?v=2026.53`; the draft build is absent from production.

## 7. Remaining blockers to 99/100 and 100/100

1. **71 public statements** need approved business/technical evidence or removal.
2. **51 insight guides** need named competent technical review.
3. **51 media records** need rights and provenance approval.
4. Privacy and Terms need qualified legal approval.
5. Supplier legal/export/bank/product/sample/QC packs are incomplete.
6. Production Turnstile, D1, webhook/email, WAF/rate-limit, retry, monitoring, backup, and rollback are unproven.
7. Keyboard, zoom, forced-colour, NVDA, VoiceOver, Safari, Firefox, Edge, iOS, and Android evidence is incomplete.
8. Buyer-task usability testing is incomplete.
9. Production Search Console, crawl, schema, sitemap monitoring, and 28-day field Core Web Vitals are unavailable before launch.
10. The source worktree remains heavily dirty; production requires an isolated clean release candidate.
11. The scoped Cloudflare token still needs repair; the draft used the existing Infisical-managed global-key fallback.
12. Seventeen moderate development-only Lighthouse/OpenTelemetry advisories remain; the available forced fix is a breaking downgrade and was not applied.

## 8. Production release rule

Do not deploy production from the current dirty worktree.

Required sequence:

1. Complete or disposition the 71 statement records.
2. Obtain technical, legal, media, supplier, accessibility, browser, and operational approvals.
3. Build an isolated clean release worktree containing only approved changes.
4. Rerun the complete exact-artifact matrix.
5. Obtain explicit approval for the immutable candidate.
6. Deploy the exact approved artifact.
7. Run immediate and 24-hour smoke, lead-delivery, monitoring, and rollback checks.
8. Complete the agreed 28-day field-performance and Search Console evidence window.

## 9. Production safety statement

No production deployment, DNS change, production Cloudflare setting change, or live content replacement was performed. All publishing remained on the `draft-audit-fixes` branch. Production requires a separate explicit approval after the unresolved evidence and release gates are closed.
