# Moldart Website Release System

This is the operating system for taking the current local static draft to production without losing source control, repeating audits manually, or accidentally publishing weak portal/work-in-progress routes.

## Current Source Of Truth

- Active public website draft source: `TECH/WEBSITE/existing-new/work`.
- Generated public artifact: `public-site/`.
- Frozen/reference copies are not release sources.
- Older deployed/export folders are useful for comparison only, not durable editing.
- Production is not the proof of source. A production page can be stale even when local source is ahead.

## Release Rule

Do not publish straight from local preview to production. The only safe path is:

1. Local source gate.
2. Local rendered preview gate.
3. Generated artifact gate.
4. Cloudflare Pages preview gate.
5. Production deploy gate.
6. Post-production drift monitor.

## Local Source Gate

Run from this folder:

```powershell
npm run goal
npm run release:check
```

Pass condition:

- Generator syntax passes.
- 51 insight pages remain published in the draft.
- Every published insight has one image.
- Every published insight has one selected Moldart YouTube card.
- `public-site/` excludes private, backup, runtime, and static portal output.
- `llms.txt`, `llms-full.txt`, `_headers`, `_redirects`, sitemap, and public assets are present.

Stop condition:

- Any release-gate failure.
- Any private/runtime path appears in `public-site/`.
- Any portal workspace route leaks into the static public artifact.
- Any deploy would require secrets, DNS changes, billing changes, or destructive changes.

## Local Rendered Preview Gate

Run:

```powershell
npm run preview:ensure
node scripts/moldart-quality-monitor.mjs --base=http://127.0.0.1:4173
npm run audit:site -- http://127.0.0.1:4173
npm run compare:live-draft -- --draft=http://127.0.0.1:4173 --live=https://moldartindia.com
```

Pass condition:

- Home and representative insight routes return `200`.
- Sitemap route check passes.
- 24/24 resource PDF links pass in the artifact gate.
- Key pages have no horizontal overflow.
- Mobile insight audits have no overflow, table overflow, dense-grid issue, small paragraph issue, or console errors.
- The live-vs-draft report explains every live gap that the draft closes.

## Cloudflare Preview Gate

Create a Cloudflare Pages preview from the static draft. Do not use production as the first platform test.

Run the same gates against the preview URL:

```powershell
node scripts/moldart-quality-monitor.mjs --base=<cloudflare-preview-url>
npm run audit:site -- <cloudflare-preview-url>
npm run compare:live-draft -- --draft=<cloudflare-preview-url> --live=https://moldartindia.com
```

Also verify manually:

- `_headers` are visible in HTTPS responses: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP.
- `_redirects` behave correctly: `/products/` stays `/products/`; `/portal` and `/portal/*` go to `/contact/?intent=portal-access`.
- `llms.txt` and `llms-full.txt` return `200`.
- `sitemap.xml` uses apex `https://moldartindia.com/`.
- Representative products, resources, insights, contact, and FAQ render correctly on desktop and mobile.
- Resource PDFs and oversized public-download routes behave as expected.

## Production Gate

Production deploy is allowed only after:

- Local source gate passes.
- Local rendered preview gate passes.
- Cloudflare preview gate passes.
- The user explicitly approves production deploy for this exact source and target.

Production deploy must report:

- Source commit or artifact timestamp.
- Cloudflare preview URL tested.
- Production URL after deploy.
- Rollback target.
- Commands/checks run.
- Any remaining non-blocking risks.

## Four Business Decisions Before Final Production

1. Confirm this static draft is the public website source of truth.
2. Confirm FormSubmit is acceptable for RFQ/resource forms, or replace it with a controlled endpoint.
3. Confirm long-term hosting for oversized PDFs: current public-download route or controlled R2/download endpoint.
4. Approve favicon/manifest branding.

## Automation System

Use one main recurring automation, not many overlapping monitors.

Automation name: `moldart-website-quality-loop`

Purpose:

- Keep the active draft and live site compared.
- Detect source/artifact drift.
- Detect missing routes, headers, `llms` files, insight/media coverage, PDF issues, public portal leakage, and mobile overflow.
- Report exact P0/P1/P2 issues and a launch/no-launch recommendation.

Cadence:

- Every 6 hours while the site is actively changing or before launch.
- Weekly after production is stable for four clean runs.
- Monthly after four clean weekly runs and no content changes.

Allowed:

- Read this workspace.
- Run safe local checks.
- Start or verify local preview.
- Write reports under `.tmp/`.
- Compare draft vs live.
- Recommend fixes.

Forbidden:

- Deploy.
- Push.
- Change DNS.
- Change Cloudflare production settings.
- Read or print secrets.
- Send real emails, WhatsApp, campaigns, or webhooks.
- Modify portal authentication or databases.
- Touch frozen/reference copies.

## Score Model

Use these bands:

- `10/10`: Cloudflare preview and production both pass all gates, source of truth confirmed, business decisions closed, no P0/P1 drift.
- `9.7/10`: Local draft passes all gates, but Cloudflare preview has not yet proven platform behavior.
- `9.0-9.4/10`: Production works but lacks draft improvements, metadata, headers, route count, or media coverage.
- `<9/10`: Missing routes, broken images, portal leakage, weak sitemap, failed forms, failed PDFs, or unresolved public-copy issues.

## Future Workflow

For every future website improvement:

1. Make the smallest source change in this workspace.
2. Regenerate `public-site/`.
3. Run local source and preview gates.
4. Update reports.
5. Use Cloudflare preview for platform proof.
6. Deploy production only after explicit approval.
7. Let automation watch drift and report exceptions.
