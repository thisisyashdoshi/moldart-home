# Website deep audit and 100x operating plan - 2026-05-01

## Scope

Website workspace audited:

`C:\Users\Yash\OneDrive - Deco Metal\WORK\OTHERS\MASTER - YASH\MARKETING\TECH\WEBSITE\existing-new\work`

Production audited:

`https://moldartindia.com`

Related draft work reviewed:

- Static marketing site in `existing-new/work/`.
- Static portal prototype in `existing-new/work/portal/` and `portal-app.js`.
- Real Next.js trade portal in `existing-new/work/trade-portal/`.
- Open Wood Science draft pages and functions under `existing-new/work/open-wood-science/`, `functions/`, and `netlify/functions/`.
- OpenCode configuration in `TECH/WEBSITE/opencode.json`.

Secrets note:

- `trade-portal/.env` exists locally and was not read.
- Keep `.env` out of commits, reports, screenshots, and AI context.

## Executive decision

The current website is already strong as a static B2B marketing base. The biggest improvement is not a visual redesign. The 100x move is to turn the site into a measurable B2B sourcing system:

- Public site gets sharper product discovery, owned lead capture, trust proof, and SEO governance.
- Downloads move from static/generic gating to tracked resource intent.
- Portal moves out of the static prototype into the real authenticated Next.js app.
- Operations connect to CRM, WhatsApp, email, documents, analytics, and audit logs.
- OpenCode gets repeatable audit, deploy, content, and portal-security workflows.

## What is live now

Production status from live checks:

- Domain: `https://moldartindia.com`.
- Current production asset version: `2026.50`.
- Sitemap: 158 entries, 157 unique URLs.
- Unique sitemap URLs checked by `HEAD`: 157 OK, 0 bad.
- Resource download links checked: 24 links, 0 bad.
- Live scripted audit passed: no desktop overflow, no mobile homepage overflow, no console errors, no mobile insight table overflow, no insight H1/body-size failures.
- Live headers include HSTS, CSP, COOP, CORP, Permissions-Policy, Referrer-Policy, X-Content-Type-Options, and X-Frame-Options.
- Live CSP already allows Cloudflare Insights script/connect sources.
- `robots.txt` is live with search allowed, AI training disallowed, and `llms.txt` is live.

Live public routes and content groups:

- Core pages: home, explore, solutions, resources, insights, contact, about, FAQ, process.
- Product pages: 16 product URLs.
- Solution pages: solutions index plus 6 solution routes.
- Insights: 128 live sitemap entries including the insights index and article pages.
- Resources: 24 downloadable PDFs grouped into 6 sections.
- Contact: Formsubmit form, WhatsApp links, email, LinkedIn, Microsoft Bookings link.
- Search: static command palette backed by `data/search-index.json`.
- Portal: static noindex prototype pages are still live at `/portal/`, `/portal/sign-in/`, `/portal/dashboard/`, `/portal/catalog/`, `/portal/rfq/`, `/portal/approvals/`, and `/portal/orders/`.

Live integrations already present:

- Cloudflare hosting and security headers.
- Cloudflare Web Analytics compatibility in CSP.
- Formsubmit for public inquiry/resource forms.
- WhatsApp deep links.
- Email links.
- LinkedIn company and personal profile links.
- Microsoft Bookings meeting link.
- GitHub raw links for some large PDF downloads.
- Static JSON search index.

## Live issues found

### P0 - deployment alignment

- Production is behind local work: live assets are `2026.50`, while local pages reference `2026.54`.
- Local sitemap lastmod is `2026-04-30`, but live sitemap lastmod is older.
- Previous local audit report says local ready work reached at least `2026.52`; production is not caught up.

### P0 - portal prototype exposure

- Production still returns `200 OK` for static prototype portal routes.
- These pages are marked `noindex` in HTML, but they still expose a non-functional private draft surface.
- Local `_redirects` already redirects these prototype paths back to `/portal/`, but that redirect behavior is not live.
- Production portal responses checked did not include `X-Robots-Tag`; rely-on-meta is weaker than header + meta.

### P0 - sitemap duplicate

- Live sitemap contains one duplicate URL: `https://moldartindia.com/insights/particleboard-buyers-guide/`.
- Local sitemap has no duplicate for that URL, so this is likely fixed locally and needs deployment.

### P1 - lead capture is not owned yet

- Contact and resource gate submit to Formsubmit.
- This is acceptable for a temporary static site, but it is not a proper B2B lead system.
- Missing pieces: validation, spam scoring, lead ID, CRM sync, UTM capture, source attribution, SLA routing, duplicate detection, and internal status tracking.

### P1 - resource downloads are useful but not operationally tracked

- 24 PDFs are live and downloadable.
- Some large PDFs use GitHub raw links instead of a controlled asset bucket.
- The resource gate unlocks on browser state, but there is no owned document-access model, account-level audit, or resource-level scoring.

### P1 - product discovery is broad, but not yet an RFQ engine

- Product pages, solution pages, resources, and insights exist.
- Buyer path still ends in a generic contact form instead of an assisted RFQ builder.
- Missing pieces: saved RFQ basket, product comparison, spec completeness scoring, file upload, destination/incoterm defaults, and repeat-order baseline.

### P2 - trust proof needs evidence depth

- The site presents a restrained professional identity.
- Stronger conversion will require approved proof assets: certifications, inspection examples, case studies, team/process photos, approved client/category references, packaging/logistics proof, and claim source notes.

### P2 - content scale needs governance

- Large insight coverage is good for crawl surface.
- Risk: generated or templated insight pages can become thin if not curated into high-value hubs.
- Need editorial pruning, internal linking, article freshness rules, and expert/source-backed upgrades for high-value pages.

## Draft or not implemented

### Local static release draft

Status:

- Newer local static pages reference `2026.54`.
- Local sitemap has no duplicate URL issue.
- Local `_redirects` collapses prototype portal routes to `/portal/`.
- Local `_headers` intends `X-Robots-Tag: noindex, nofollow, noarchive` for `/portal/*`.

Action:

- Treat this as the next release candidate, not as live reality.
- Rebuild, preview, run the full audit, then deploy to production.

### Static portal prototype

Status:

- Live but should be treated as draft only.
- Useful as UX reference.
- Not a secure portal, not a source of truth, not a place to add real buyer/seller workflows.

Action:

- Keep only `/portal/` as a private boundary page on the public static site.
- Redirect old static prototype pages to `/portal/` until the real app is deployed.
- Remove prototype routes from future public artifacts once the Next.js portal is connected.

### Next.js trade portal

Status:

- Implemented locally under `trade-portal/`.
- Stack: Next.js App Router, TypeScript, Auth.js, Prisma/PostgreSQL, Redis/BullMQ, MinIO, Zod, Vitest.
- Implemented: public auth surface, protected buyer/seller/admin shells, JWT-backed credentials auth, secure session DAL, core Prisma schema, route scaffolds, document visibility filtering, email queue scaffolding, storage scaffolding, rate limiting, tests for state machines and permissions.
- Still pending per README: email verification completion, richer product create/edit, quote revision UI, PDF generation, order workflow mutations, document upload UI/server route, notification center, audit export, broader authorization tests.

Action:

- Keep portal on separate app infrastructure.
- Do not extend the static portal prototype.
- Ship internal beta only after auth, org approval, document upload, audit logs, and role-scope tests are production-grade.

### Open Wood Science

Status:

- Local noindex pages and API/function code exist.
- Production checked as `404` for `/open-wood-science/contribute/` and `/api/ows-intake`.
- This is not live.

Action:

- Keep noindex until content governance, intake moderation, storage, reviewer assignment, and security are approved.
- If released, use Turnstile, rate limiting, owned persistence, admin auth, and moderation workflow.

### Opencode workflow

Status:

- Existing commands cover `build`, `minify`, `review`, and `deploy`.
- Existing reviewer agent is useful but too general for the current website + portal + marketing ops scope.
- No project-specific skills are installed in this session.
- `TECH/WEBSITE/AGENTS.md` still describes the business as an aluminum extrusion manufacturer, while the live site is positioned around specification-led wood, surface, furniture, flooring, decorative steel, and industrial press routes.

Action:

- Add focused commands and agents after this plan is approved.
- Keep secrets out of AI context by policy and watcher ignores.
- Update project instructions so every agent receives the correct Moldart positioning before editing content or code.

## 100x website roadmap

### Phase 0 - production cleanup, same day

Goal:

- Make production match the latest approved local state.

Actions:

- Deploy the current local static release after QA.
- Confirm production asset version advances from `2026.50` to the current local version.
- Confirm live sitemap has 157 unique URLs and zero duplicates.
- Confirm static portal prototype routes redirect to `/portal/`.
- Confirm `/portal/*` carries both meta `noindex` and `X-Robots-Tag: noindex, nofollow, noarchive`.
- Confirm 24 resource downloads still return 2xx.
- Submit sitemap in Google Search Console and Bing Webmaster Tools.

Acceptance:

- `npm run build` passes.
- `npm run audit:site -- https://moldartindia.com` passes after deploy.
- Duplicate sitemap check returns 0 duplicates.
- Portal prototype paths do not serve standalone dashboard/sign-in pages.

### Phase 1 - owned lead engine, 1 week

Goal:

- Replace passive forms with controlled lead intake and routing.

Actions:

- Replace Formsubmit with Cloudflare Pages Functions or Workers.
- Add Cloudflare Turnstile to contact and resource forms.
- Capture UTM, referrer, page path, resource title, product interest, destination, incoterm, quantity context, and consent.
- Write every lead to CRM and an owned database table.
- Send transactional email through Postmark, Resend, or Microsoft Graph.
- Route WhatsApp click events and form submissions into the same lead timeline.
- Create SLA categories: hot RFQ, supplier intro, portal access, general enquiry.

Recommended stack:

- Cloudflare Turnstile for spam control.
- Cloudflare Workers/Pages Functions for intake API.
- Cloudflare D1, Supabase, Neon, or Postgres for lead storage.
- HubSpot, Attio, Odoo, Twenty CRM, or Zoho as CRM.
- Postmark for transactional notifications.
- WhatsApp Business Cloud API for templated follow-up later.

### Phase 2 - product discovery to RFQ, 2 to 3 weeks

Goal:

- Make the buyer build a useful brief before contacting Moldart.

Actions:

- Add product comparison and RFQ basket from product/resource pages.
- Add guided fields: application, dimensions, finish, grade, quantity, destination, incoterm, shipment timing, documents available.
- Add product-specific prompt blocks so each page asks the right questions.
- Allow a buyer to email/WhatsApp a structured brief summary.
- Later, push saved RFQs into the authenticated portal.

Recommended tools:

- Static-first local storage RFQ basket for public site.
- Owned API endpoint for final submission.
- R2/S3 signed upload for document attachments after spam checks.
- Pagefind or upgraded static search if the command palette becomes too limited.

### Phase 3 - trust proof and conversion depth, 2 to 4 weeks

Goal:

- Replace generic credibility with approved evidence.

Actions:

- Add approved capability proof: inspection photos, packaging, shipment milestones, certificates, tolerances, sample approval examples, document packs.
- Add application-specific case notes without exposing confidential buyer names.
- Add team/process credibility pages with real photos where approved.
- Add claim register: every public claim maps to an approved source, document, or internal approval.
- Add richer product imagery galleries from the product asset folders.

Do not add:

- Invented metrics.
- Unsupported global-office claims.
- Generic AI images where real product/process evidence is available.

### Phase 4 - SEO and content governance, ongoing

Goal:

- Keep crawl scale without thin-content risk.

Actions:

- Build topic hubs for high-value product routes.
- Reduce or merge weak generated insight variants if they do not carry distinct value.
- Add article freshness dates and review owners.
- Improve internal linking from product pages to resources, insights, process, and contact/RFQ.
- Add schema validation to release checks.
- Track ranking pages, impressions, CTR, and lead contribution.

Recommended tools:

- Google Search Console.
- Bing Webmaster Tools + IndexNow.
- Screaming Frog or Sitebulb for crawl QA.
- Pagefind report or custom search-index validator.
- Schema.org validator / Rich Results Test checks.

### Phase 5 - authenticated trade portal beta, 4 to 8 weeks

Goal:

- Move from public marketing to controlled buyer/seller execution.

Actions:

- Deploy `trade-portal/` separately at `portal.moldartindia.com` or `app.moldartindia.com`.
- Keep public `/portal/` as a request-access boundary until beta is approved.
- Complete email verification, invites, company approval, product creation/edit, document upload, quote PDF, notification center, audit export, and admin review flows.
- Add file scanning and signed document access.
- Add end-to-end tests for buyer, seller, and admin role isolation.
- Add Sentry and uptime monitoring before any external beta.

Recommended production stack:

- App: Next.js on Vercel, Fly.io, Railway, Render, or a controlled VPS.
- DB: Neon, Supabase Postgres, AWS RDS, or self-hosted Postgres.
- Storage: Cloudflare R2 or MinIO if self-hosted.
- Queue: Upstash Redis, Redis Cloud, or self-hosted Redis.
- Email: Postmark.
- Monitoring: Sentry + Better Stack.
- Analytics: PostHog for product events, Cloudflare Web Analytics for public site.
- PDF: Playwright/Puppeteer or React PDF in a queue worker.
- File safety: MIME signature validation plus ClamAV or managed malware scanning.

### Phase 6 - operating system loop, ongoing

Goal:

- Every public action becomes useful operational data.

Actions:

- Connect CRM, email, WhatsApp, portal, resource downloads, and Search Console into one weekly review.
- Score leads by product route, resource viewed, quantity, destination, timing, and repeat potential.
- Add weekly dashboards: leads by source, RFQ quality, conversion to quote, quote response time, download-to-lead, top search queries, broken links, and page speed.
- Use automation only for reminders, routing, summaries, and document collection; keep commercial approval human-controlled.

## Website integrations to add

### Must add next

- Cloudflare Turnstile for all public forms.
- Owned lead intake API using Cloudflare Pages Functions or Workers.
- CRM sync to HubSpot, Attio, Zoho, Odoo, or Twenty CRM.
- Transactional email via Postmark, Resend, or Microsoft Graph.
- Google Search Console and Bing Webmaster Tools.
- Link checker in CI/release workflow.
- Lighthouse CI or repeatable Lighthouse script.
- Sentry for portal app errors.
- Better Stack or UptimeRobot for uptime checks.

### Strongly recommended

- Cloudflare R2 for all large PDFs and gated downloads.
- Pagefind if static search needs relevance, snippets, or local indexing.
- PostHog for portal event analytics and funnel tracking.
- Microsoft Clarity only if heatmaps/session insights are useful and privacy is approved.
- WhatsApp Business Cloud API for approved message templates and lead handoff.
- n8n or Activepieces for workflow automation after source-of-truth systems are chosen.
- Airtable or Google Sheets only as temporary operations views, not source of truth.

### Later or conditional

- Stripe or Razorpay only for sample/deposit edge cases, not main programme orders.
- DocuSeal, PandaDoc, or DocuSign only if formal e-signature becomes required.
- Typesense or Meilisearch only if catalog/search scale exceeds static search.
- Langfuse if AI assistant evaluation becomes serious.
- pgvector RAG assistant after approved product documents and portal records are clean.

## Recommended MCPs

Priority MCPs for OpenCode/productivity:

- Playwright MCP: visual checks, mobile audits, screenshots, interaction testing.
- Cloudflare MCP: Pages deployments, Worker logs, R2 assets, analytics, DNS checks.
- GitHub MCP or `gh`: issues, PRs, deployment history, release notes.
- Google Search Console MCP: indexing, queries, sitemap status, page issues.
- Sentry MCP: production errors and stack traces once portal is live.
- PostHog MCP: funnel and event analysis once analytics is added.
- Postgres/Supabase/Neon MCP: read-only portal DB debugging and reporting.
- R2/S3 MCP: asset and document inventory checks.
- Microsoft 365/Outlook MCP: meeting, email, and lead follow-up automation with approval.
- CRM MCP: HubSpot/Attio/Zoho/Odoo/Twenty lead status and pipeline updates.
- Notion/Linear/Jira/GitHub Issues MCP: planning, tickets, release checklists.
- n8n/Activepieces MCP: inspect and trigger automation workflows.

Security rule for MCPs:

- Use read-only scopes by default.
- Separate production write/deploy tools from research tools.
- Never expose `.env`, private keys, customer documents, or portal records to broad AI context.

## Recommended OpenCode skills

No project-specific skills are currently installed in this session. Create these as reusable project skills or agent prompts:

- `website-release-manager`: runs build, sitemap diff, link check, download check, audit, headers check, and deployment notes.
- `seo-content-auditor`: checks titles, descriptions, canonicals, schema, internal links, thin content, duplicate pages, and sitemap quality.
- `performance-a11y-auditor`: runs Lighthouse, Playwright mobile checks, axe/pa11y, image audits, and Core Web Vitals regression review.
- `frontend-conversion-designer`: improves product discovery, RFQ flows, resource gates, and trust sections without generic redesign.
- `portal-security-reviewer`: reviews auth, middleware/proxy, DAL scoping, document visibility, audit logs, and role permission tests.
- `lead-ops-integrator`: owns forms, CRM, WhatsApp, email, source attribution, dedupe, and SLA routing.
- `product-content-modeler`: turns product folders, PDFs, specs, and images into structured page/resource/RFQ data.
- `evidence-claim-editor`: ensures every public claim is approved, source-backed, and safe to publish.

## OpenCode productivity upgrades

### Add commands

Recommended `opencode.json` commands to add later:

- `audit:live`: run production site audit, sitemap duplicate check, headers check, and download check.
- `audit:local`: build, start preview, run Playwright audit against local preview.
- `sitemap:diff`: compare live sitemap with local sitemap and report duplicates, missing URLs, and unexpected additions.
- `downloads:check`: check every resource/download link.
- `headers:check`: check production CSP, X-Robots, caching, HSTS, and portal noindex headers.
- `portal:test`: run `typecheck`, `lint`, and `test` in `trade-portal/`.
- `portal:build`: run Prisma generate and Next production build.
- `release:notes`: generate a deployment note from audit outputs and changed files.

### Add agents

Recommended agents:

- `seo-reviewer` for sitemap/content/schema checks.
- `a11y-performance-reviewer` for Playwright/Lighthouse/a11y checks.
- `portal-security-reviewer` for Next.js auth and role isolation.
- `content-editor` for B2B clarity, claim safety, and product proof.
- `release-manager` for deployment gates and rollback notes.

### Add watcher ignores

Recommended ignores:

- `trade-portal/.env`
- `trade-portal/.next/**`
- `trade-portal/node_modules/**`
- `public-site/**` if generated output causes noise during source edits.
- `screenshots/**`
- `reports/**`
- `*.har`
- `*.trace.zip`

### Add standard release gate

Every production release should produce a short release note with:

- Git/source version or timestamp.
- Asset version string.
- Sitemap URL count and duplicate count.
- Download link check result.
- Playwright audit result.
- Lighthouse result or reason not run.
- Header check result.
- Portal route behavior check.
- Rollback path.

### Fix project instructions

- Correct `TECH/WEBSITE/AGENTS.md` project identity so agents do not optimize copy around the wrong industry.
- Add a hard rule that `.env`, customer documents, private portal records, and commercial secrets must not be read unless explicitly requested for a security review.
- Add a hard rule that the public static site and authenticated portal have different release gates.

## Immediate action checklist

1. Rebuild the local static site.
2. Run local preview audit.
3. Deploy latest local static release to production.
4. Confirm live asset version updates from `2026.50`.
5. Confirm live sitemap duplicate count is 0.
6. Confirm static portal prototype routes redirect to `/portal/`.
7. Confirm `/portal/*` has header and meta noindex.
8. Replace Formsubmit with owned intake API + Turnstile.
9. Move GitHub raw downloads to Cloudflare R2 or another controlled bucket.
10. Decide CRM source of truth before adding automation.
11. Complete trade-portal Phase 1 hardening before external beta.
12. Add OpenCode commands/agents for repeatable audit and release operations.
13. Correct project instructions so future agents do not inherit the wrong industry description.

## Continuation log - 2026-05-01

- Corrected `TECH/WEBSITE/AGENTS.md` project identity from aluminum extrusion to Moldart's engineered wood, panel, trade-resource, and buyer/seller workflow site.
- Added secrets-safety rules to `TECH/WEBSITE/AGENTS.md` and `existing-new/work/AGENTS.md`; no raw secrets were read.
- Added OpenCode watcher ignores for `.env`, private-key, credential, API-key, trace, report, and portal build/dependency artifacts.
- Added OpenCode workflow commands: `audit:live`, `audit:local`, `portal:test`, `portal:build`, and `release:notes`.
- Added metadata-only API inventory template at `docs/api-key-inventory-template.md`.
- Verified `opencode.json` is valid JSON.
- Ran `npm run build`; build completed and generated 176 pages plus `public-site/` artifact. Existing warning remains: `page6_img4.webp` could not be replaced during oversized image compression.
- Ran local Playwright audit against `http://127.0.0.1:4173`; all key routes had no overflow, homepage/mobile checks passed, 127 insight pages passed phone 360 and phone 430 checks, and console error arrays were empty.
- Ran local release-gate sanity check: sitemap 157 URLs, 157 unique, 0 duplicates; asset version `2026.54`; portal redirects present; portal meta and header noindex signals present.
- Added `docs/draft-website-check-and-change-plan-2026-05-01.md` with the local draft checking workflow, manual QA checklist, current draft checkpoint, and prioritized recommended changes.
- Added `docs/tooling-skills-mcp-plugins-status-2026-05-01.md` with exact installed/configured tooling, project-local skills, commands, agents, plugin status, MCP choices, and recommended next installs.
- Installed project-local `@playwright/mcp@0.0.72`, but left MCPs disabled because `opencode mcp list` failed with a JSON parser error when a project MCP entry was present. No credentialed remote MCPs were added.
- Added project-local OpenCode skills, commands, agents, and a `secret-guard.js` plugin to reduce repeated setup and protect obvious secret paths.
