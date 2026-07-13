# Draft Website Check and Change Plan

Date: 2026-05-01

## Purpose

This file explains how to check the current draft website safely, what to compare against production, and which changes should be made next.

The active draft is:

`TECH/WEBSITE/existing-new/work/`

The frozen legacy reference is:

`TECH/WEBSITE/existing/`

Do not modify `existing/`.

Do not read `.env`, `API-KEYS.txt`, credential exports, private keys, customer documents, or private portal records unless a scoped security review is explicitly requested.

## How to check the draft website locally

1. Open a terminal in `TECH/WEBSITE/existing-new/work/`.

2. Build the static site.

```powershell
npm run build
```

3. Start the draft preview server.

```powershell
npm run preview
```

4. Open the draft in a browser.

```text
http://127.0.0.1:4173
```

5. Run the scripted local Playwright audit from a second terminal.

```powershell
npm run audit:site -- http://127.0.0.1:4173
```

6. Check the live site when needed.

```powershell
npm run audit:site -- https://moldartindia.com
```

7. Stop the preview server after checking.

Use `Ctrl+C` in the terminal running `npm run preview`.

## Manual browser checklist

Check these pages on desktop and mobile widths:

- `/`
- `/solutions/`
- `/products/press-plates/`
- `/products/plywood/`
- `/resources/`
- `/insights/`
- `/process/`
- `/contact/`
- `/portal/`
- `/portal/sign-in/`
- `/portal/dashboard/`

Look for:

- Broken layouts or horizontal overflow.
- Missing images or wrong product images.
- Slow hero load or layout shift.
- Contact/resource forms that still depend on third-party passive form handling.
- CTAs that do not produce useful lead context.
- Resource download links that point to uncontrolled or fragile locations.
- Portal prototype pages that should not be public.
- Noindex meta/header behavior on `/portal/*`.
- Duplicate or weak content patterns in generated insight pages.
- Unsupported claims, invented metrics, or proof-free credibility copy.

## Current draft checkpoint

Latest local check completed on 2026-05-01:

- `npm run build` completed.
- 176 pages generated.
- `public-site/` deployment artifact generated.
- Local asset version is `2026.54`.
- Local sitemap has 157 URLs, 157 unique URLs, and 0 duplicates.
- Local Playwright audit passed on desktop and mobile checks.
- 127 insight pages passed phone 360 and phone 430 checks.
- Console error arrays were empty.
- Local `/portal/*` redirects and noindex signals are present.
- Existing warning remains: `page6_img4.webp` could not be replaced during oversized image compression.

Production comparison from earlier audit:

- Live production asset version was `2026.50`.
- Live sitemap had 158 entries and 157 unique URLs.
- Live duplicate URL was `https://moldartindia.com/insights/particleboard-buyers-guide/`.
- Live resource download check passed for 24/24 links.
- Live static portal prototype routes were still publicly reachable, though marked noindex.

## Changes I would make next

### P0 - release alignment and safety

1. Deploy the latest static draft so production moves from asset version `2026.50` to `2026.54`.

2. After deployment, verify production again:

- Asset version is `2026.54`.
- Sitemap has 157 unique URLs and 0 duplicates.
- `/portal/sign-in/`, `/portal/dashboard/`, `/portal/catalog/`, `/portal/rfq/`, `/portal/approvals/`, and `/portal/orders/` redirect to `/portal/`.
- `/portal/*` has both meta noindex and `X-Robots-Tag: noindex, nofollow, noarchive`.
- Download links still pass.

3. Fix the remaining image build warning for `page6_img4.webp` so the build is fully clean.

4. Keep the static `/portal/` as a request-access boundary only. Do not extend the static prototype.

### P0 - lead capture and attribution

5. Replace Formsubmit/Formspree-style form handling with owned intake.

6. Add Cloudflare Turnstile to public forms.

7. Capture lead context:

- Name, email, company, country, phone, message.
- Product interest.
- Page path.
- Resource title.
- UTM source/medium/campaign.
- Referrer.
- Quantity, destination, incoterm, and timeline where relevant.
- Consent timestamp.

8. Store every lead in an owned database table and sync to the chosen CRM.

9. Send internal notifications through a transactional email provider or Microsoft Graph.

10. Track WhatsApp clicks and form submissions in one lead timeline.

### P1 - RFQ and product discovery

11. Add a lightweight RFQ basket for public pages.

12. Let buyers add product/resource interests before contacting Moldart.

13. Add guided RFQ fields:

- Application.
- Dimensions.
- Finish.
- Grade/spec.
- Quantity.
- Destination.
- Incoterm.
- Shipment timing.
- Documents or samples available.

14. Add product-specific prompt blocks so press plates, press pads, decor paper, plywood, flooring, furniture, and stainless steel routes ask different questions.

15. Allow the buyer to submit, email, or WhatsApp a structured brief summary.

### P1 - resources and downloads

16. Move large PDFs and controlled downloads to Cloudflare R2 or another owned bucket.

17. Keep public brochure downloads simple where appropriate, but track resource interest as lead context.

18. Add stable download metadata:

- Title.
- Product route.
- File size.
- Last reviewed date.
- Owner.
- Source/approval status.

19. Avoid GitHub raw URLs for buyer-facing downloads.

### P1 - trust proof and content quality

20. Add approved proof assets where available:

- Inspection photos.
- Packaging photos.
- Dispatch/shipment milestones.
- Certificate examples.
- Finish/tolerance examples.
- Document-pack examples.

21. Create a claim register so every public claim maps to an approved source or internal approval.

22. Add application-specific case notes without exposing confidential buyer names.

23. Improve product pages with richer galleries from the existing product asset folders.

24. Remove or rewrite any copy that sounds generic, inflated, or unsupported.

### P1 - SEO governance

25. Keep the local sitemap duplicate check as a release gate.

26. Review generated insight pages for thin or repetitive variants.

27. Merge weak pages where they do not carry distinct search or buyer value.

28. Add freshness dates and review owners to important guides.

29. Strengthen internal linking from product pages to resources, process, insights, and RFQ/contact.

30. Add schema validation to release checks.

### P1 - search and navigation

31. Upgrade static search with Pagefind if the current search experience is not enough.

32. Improve product-route discovery with clear buyer paths:

- Laminates and panel tooling.
- Furniture and engineered wood.
- Flooring.
- Decorative stainless steel.
- Industrial press plates.

33. Add comparison entry points where buyers need help choosing between materials or processes.

### P2 - authenticated trade portal

34. Deploy `trade-portal/` separately at `portal.moldartindia.com` or `app.moldartindia.com` when ready.

35. Complete portal Phase 1 before external beta:

- Email verification.
- Invites.
- Company approval.
- Product create/edit.
- Document upload.
- Quote PDF.
- Notification center.
- Audit export.
- Admin review flows.
- Buyer/seller/admin role isolation tests.

36. Add file scanning and signed document access before buyer documents are uploaded.

37. Add error monitoring and uptime monitoring before any external beta.

### P2 - operations and analytics

38. Choose CRM source of truth before adding automation.

39. Recommended free/open-source-first CRM shortlist:

- Twenty CRM.
- Odoo Community Edition.
- EspoCRM.
- SuiteCRM.

40. Add privacy-conscious analytics:

- Umami or Matomo for public-site analytics.
- PostHog self-host for portal/product funnels if needed.

41. Add weekly dashboards:

- Leads by source.
- RFQ quality.
- Conversion to quote.
- Quote response time.
- Download-to-lead.
- Top search queries.
- Broken links.
- Page speed.

42. Use automation only for routing, reminders, summaries, and document collection. Keep commercial approval human-controlled.

### P2 - release automation and QA

43. Add repeatable release commands/scripts for:

- Local audit.
- Live audit.
- Sitemap duplicate check.
- Download link check.
- Header check.
- Lighthouse CI.
- Pa11y/axe accessibility checks.
- Release notes.

44. Add secret scanning and dependency checks:

- Gitleaks.
- OSV-Scanner.
- Semgrep.
- Trivy if containers are used.

45. Gradually reduce CSP risk by replacing broad inline allowances where feasible.

### P3 - AI and advanced workflows

46. Do not add a buyer-facing AI assistant until product documents, claims, portal records, and retrieval permissions are clean.

47. If AI is added later, evaluate it with approved documents only and log failures with Langfuse or an equivalent evaluation system.

48. Keep AI tools away from raw secrets and private buyer/seller records by default.

## What I would not do

- I would not read or paste raw API keys.
- I would not publish the static portal prototype as a real authenticated portal.
- I would not add invented metrics, fake global-office claims, or generic AI imagery.
- I would not overbuild automation before CRM ownership is chosen.
- I would not self-host production email unless deliverability ownership is clear.
- I would not add RAG/AI chat before the approved document base and access rules are ready.

## Best next sprint

The best next sprint is:

1. Deploy current static draft.
2. Confirm production asset version, sitemap, downloads, headers, and portal redirects.
3. Fix `page6_img4.webp` build warning.
4. Implement owned lead intake with Turnstile and lead storage.
5. Add attribution capture and CRM sync.
6. Add the first RFQ basket/prospec brief flow on the highest-value product pages.
7. Move large PDFs to controlled storage.
