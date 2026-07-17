# Moldart Internal Review Package - 2026-05-06

## Status

Ready for internal review. Not ready for production deploy until the review group approves UI, workflow behavior, credentials, payment/logistics policy, and the remaining non-critical accessibility cleanup.

No production deployment was made.

## Draft Links

- Public website draft: http://127.0.0.1:4173/
- Portal draft: http://127.0.0.1:3100/portal
- Mailpit preview for this run: http://100.88.195.111:8025
- MinIO console for this run: http://100.88.195.111:19001

Note: Docker is currently using the `dell-debian-docker` context, so Mailpit and MinIO are reachable through the Tailscale host address in this review run. The website draft is served locally on `127.0.0.1:4173`. The portal review link is exposed locally on `127.0.0.1:3100` through an internal review proxy to the healthy Docker portal service, so database, Redis, and storage all remain available without printing or copying service credentials.

## What Changed

- Public website: tightened the static site around the current minimal B2B sourcing direction and kept the public `/portal/` page as a private access boundary.
- Homepage: simplified the first screen and supporting sections so buyers see the route to RFQ, specs, quality proof, and documents without repeated marketing blocks.
- Product pages: replaced the separate spec dashboard/RFQ readiness blocks with one buyer-clarity section covering application fit, buyer benefits, technical checks, quality checks, documents to request, and RFQ inputs before purchase.
- RFQ intake: strengthened `/contact/` with structured fields for product/category, application/use, quantity/MOQ, destination, target timing, incoterm/delivery basis, documents/files, optional HS/HSN, and message.
- Imagegen: rejected the first busy visual direction, tested a minimal v2 set, then demoted those images from the primary public pages because the buyer decision needs clear specification/application content rather than abstract editorial graphics.
- Portal UI: added FOSS-first portal improvements with shadcn-style local components, Radix Slot, TanStack Table, React Hook Form, Zod validation, and lucide icons.
- Portal dashboards: upgraded buyer, seller, and admin dashboard queues with searchable tables, clearer status chips, and role-specific next-action surfaces.
- Portal RFQ flow: upgraded buyer RFQ creation with client-side validation while keeping the server action as the source of truth.
- Portal runtime: fixed the local draft by removing the malformed app-level favicon that caused Next to return 500 on `/portal`.

## Review Screenshots

Folder:

`docs/review-screenshots/2026-05-06`

Included coverage:

- Static site: home, solutions, resources, process, contact, and portal boundary at mobile, tablet, desktop, and wide desktop.
- Portal login: desktop and mobile.
- Buyer portal: dashboard, RFQ creation, quotes, orders, payments, logistics, documents.
- Seller portal: dashboard, inquiries, quotes, orders, logistics, documents.
- Admin portal: dashboard, RFQs, quotes, orders, payments, logistics, documents, audit.
- Reports: `browser-qa-report.json` and `portal-role-guard-report.json`.

Minimal imagegen screenshot folder:

`docs/review-screenshots/2026-05-06-imagegen-minimal`

Buyer clarity screenshot folder:

`docs/review-screenshots/2026-05-06-buyer-clarity`

Generated imagegen draft assets kept in the repo:

- `images/ai-generated/contact-rfq-brief.webp`
- `images/ai-generated/process-brief-to-delivery.webp`
- `images/ai-generated/portal-buyer-seller-record.webp`
- `data/ai-visual-manifest.json`

These are abstract visual drafts only. They are not product proof, factory proof, certification proof, payment proof, logistics proof, or client proof, and they are no longer used as the primary explanation layer on contact, process, portal boundary, or product pages.

## Checks Passed

Public website release gate passed against `http://127.0.0.1:4173`:

- `npm run build`
- `node scripts/check-sitemap.js`
- `node scripts/check-downloads.js`
- `node scripts/check-headers.js`
- `node scripts/check-public-artifact.js`
- `node scripts/check-search.js`
- `node scripts/check-secrets.js`
- `npm audit --audit-level=moderate`
- `node scripts/site-audit.js http://127.0.0.1:4173`
- `node scripts/check-a11y.js http://127.0.0.1:4173`

Portal checks passed:

- `npm run prisma:push`
- `npm run seed`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- Production portal start on `http://127.0.0.1:3100`
- `GET /api/portal/health` returned database, Redis, and storage ready.

Browser QA passed:

- 47 captured pages.
- 0 failed page loads.
- 0 offline-shell findings.
- 0 visible seed-credential blocks.
- 0 browser console issues.
- 6 role-guard checks passed across buyer, seller, and admin route boundaries.

Minimal imagegen QA passed:

- Contact, process, and portal boundary checked at desktop and mobile.
- 0 failed page loads.
- 0 broken generated-image resources.
- 0 overflow findings.
- 0 browser console issues.

Buyer clarity QA passed:

- Press plates, decorative stainless steel panels, wood flooring, contact, process, and portal boundary checked at desktop and mobile.
- 12/12 page and viewport checks passed.
- Product pages contained the new buyer-clarity section.
- Contact, process, portal boundary, and checked product pages no longer referenced `/images/ai-generated/`.
- 0 broken images.
- 0 page overflow findings.
- 0 browser console or page errors.

Final browser QA passed:

- Home, press plates, contact, process, static portal boundary, and portal app checked at desktop and mobile.
- 12/12 page and viewport checks passed.
- Portal app at `http://127.0.0.1:3100/portal` returned 200 with database, Redis, and storage healthy.
- Product page contained the buyer-clarity section.
- Checked pages had no generated-image dependency, no overflow, no offline portal copy, and no browser console/page errors.
- Report: `docs/review-screenshots/2026-05-06-buyer-clarity/final-browser-qa-report.json`.

Lighthouse did not pass the strict local budget:

- Performance 0.91, accessibility 0.96, best practices 1.00, SEO 1.00.
- LCP 1835ms and CLS 0.032 passed.
- TBT 341ms exceeded the 200ms budget.
- Chrome/Lighthouse also emitted a OneDrive temp cleanup permission warning after writing the report.

## Known Limitations

- No production deploy was performed.
- Payments are still mock/manual. A real payment gateway must be selected and reviewed before live money movement.
- Logistics are still manual milestone tracking. Carrier or forwarder API automation should come later after provider selection.
- Mailpit, MinIO, and the healthy portal service are on the remote Docker context in this run, not pure Windows localhost.
- Accessibility check still reports minor non-serious violations on home, solutions, and contact. Serious/critical count is 0.
- Lighthouse still needs a performance pass: the latest run missed the strict total-blocking-time budget, and the OneDrive temp folder produced a Chrome cleanup permission warning.
- Build emitted one image warning for `page6_img4.webp`; the existing asset was kept.
- Review credentials are intentionally not visible on the public portal screen. Create named reviewer accounts before wider beta sharing.

## Recommendation

Use this build for internal review now. Do not deploy production yet.

Approval gates before production:

- Confirm final reviewer accounts and password handling.
- Review screenshots and role dashboards.
- Confirm RFQ fields and trade milestone language.
- Decide payment provider and logistics provider.
- Clear remaining minor accessibility issues.
- Run the same release and portal checks again immediately before deployment.
