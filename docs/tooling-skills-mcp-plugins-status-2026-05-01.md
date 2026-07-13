# Tooling, Skills, MCP, Plugins, and Integration Status

Date: 2026-05-01

## Executive decision

Do not install every MCP or integration. That is slower, less safe, and adds unnecessary context.

Use a small, high-leverage setup:

- Local skills for repeatable project judgment.
- Local commands for repeatable release gates.
- Read-only/specialist agents for review work.
- One safe local browser MCP first: Playwright.
- No credentialed remote MCPs until scopes, owners, and storage are approved.
- No raw secrets in prompts, docs, MCP config, plugins, or screenshots.

## What is configured now

### OpenCode

- OpenCode CLI: `1.14.30`.
- Project config: `TECH/WEBSITE/opencode.json`.
- Added/verified watcher ignores for `.env`, API-key files, credential exports, private keys, reports, traces, and portal build artifacts.
- Added skill permission for project-local skills.
- `opencode.json` validates as JSON.

### MCPs

Configured now:

- No MCP servers are currently enabled in `opencode.json`.

Prepared but not enabled:

- `@playwright/mcp@0.0.72` is installed project-locally under `.opencode/node_modules/`.

Why Playwright MCP should be the first MCP when enabled:

- It is local and already available on this machine.
- It gives browser inspection, screenshots, mobile checks, and interaction testing.
- It does not require Cloudflare, CRM, Search Console, or database credentials.
- It directly improves draft-site QA and release confidence.

Verification:

- Project-local version: `0.0.72`.
- `opencode mcp list` now returns cleanly with no MCP servers configured.

Why it is not enabled yet:

- With a Playwright MCP entry present, `opencode mcp list` created the MCP client and then failed with `JSON Parse error: Unrecognized token '\0'`.
- The same command works globally when no project MCP is configured.
- The safe choice is to keep the project config stable and enable MCP only after this OpenCode/MCP parser issue is resolved or after the user approves inspection/repair of OpenCode MCP auth state.

Important:

- Restart OpenCode after future MCP config changes.
- No credentialed remote MCPs were added.

### Skills

Added project-local skills under `.opencode/skills/`:

- `website-release-manager`
- `seo-content-auditor`
- `performance-a11y-auditor`
- `frontend-conversion-designer`
- `portal-security-reviewer`
- `lead-ops-integrator`
- `evidence-claim-editor`
- `product-content-modeler`

Why skills:

- They are lightweight, reusable project judgment.
- They do not install external services.
- They keep future agents focused on Moldart-specific rules.
- They reduce repeated explanation and prevent wrong-industry assumptions.

Important:

- This current API session may not show newly created skills until OpenCode reloads project config.
- Future OpenCode sessions from the project should discover them.

### Commands

Updated/added project commands under `.opencode/commands/`:

- `build`
- `minify`
- `review`
- `audit-live`
- `audit-local`
- `portal-test`
- `portal-build`
- `release-notes`
- `tooling-status`

Why commands:

- They make release checks repeatable.
- They separate public-site checks from portal checks.
- They prevent ad-hoc deploy decisions.
- They force audit outputs and known risks into release notes.

### Agents

Updated/added project agents under `.opencode/agents/`:

- `reviewer`
- `deployer`
- `seo-reviewer`
- `performance-a11y-reviewer`
- `portal-security-reviewer`
- `lead-ops-integrator`
- `content-editor`
- `release-manager`

Why agents:

- Review agents are mostly read-only.
- Deployment work is separated from implementation.
- Portal security review is separated from public-site marketing work.
- Lead operations work is separated from SEO/content review.

### Plugins

Added local plugin:

- `.opencode/plugins/secret-guard.js`

Purpose:

- Blocks OpenCode tool attempts to read obvious `.env`, API-key, credential, or private-key paths.
- Points agents to `docs/api-key-inventory-template.md` for metadata-only tracking.

Plugin package status:

- `.opencode/package.json` declares `@opencode-ai/plugin@1.4.3` and `@playwright/mcp@0.0.72`.
- `npm install` was run in `.opencode/`.
- `npm list --depth=0` now shows `@opencode-ai/plugin@1.4.3` and `@playwright/mcp@0.0.72` installed.
- `.opencode/.gitignore` now ignores `node_modules` and lockfiles, but no longer ignores `.opencode/package.json` or `.opencode/.gitignore` themselves.

## What exists but is not project-installed

Available outside the project:

- `playwright` package at `C:\Users\Yash\node_modules\playwright\package.json`.
- `@playwright/mcp` package at `C:\Users\Yash\node_modules\@playwright\mcp\package.json`, version `0.0.70`.
- `git` CLI.
- `gh` CLI, version `2.90.0`.
- Node.js `v24.15.0` and npm `11.12.1`.

Project static-site dependencies:

- `clean-css-cli@5.6.3`
- `sharp@0.34.5`
- `terser@5.46.1`

Portal dependencies already include useful foundations:

- Next.js, React, Prisma/PostgreSQL client, Auth.js/NextAuth, BullMQ, Redis client, S3 client, Nodemailer, Zod, Vitest, ESLint, TypeScript, file-type.

## What is not installed yet

Checked and not available on PATH:

- `lighthouse`
- `pa11y`
- `pagefind`
- `gitleaks`
- `semgrep`
- `trivy`
- `osv-scanner`
- `wrangler`

These were not installed automatically because each adds maintenance surface. Install them deliberately when the next sprint needs them.

## Recommended next installs

### P0 - safe local QA tools

Install first:

- `lighthouse` or Lighthouse CI: performance and Core Web Vitals regression checks.
- `@axe-core/playwright` or `pa11y`: accessibility regression checks.
- `pagefind`: better static search if current search is not enough.
- `gitleaks`: secret scanning before releases.
- `osv-scanner`: dependency vulnerability checks.

Why:

- These do not require production credentials.
- They catch real release risk.
- They fit the current static-first architecture.

### P1 - deployment and Cloudflare tools

Install later:

- `wrangler` CLI.
- Cloudflare MCP.

Why:

- Useful for Pages, Workers, logs, R2, DNS, and Turnstile work.
- Should be added only after Cloudflare auth/scopes are clear.
- Prefer least privilege and read-only scopes except during explicit deploy work.

### P1 - analytics and search operations

Add after public-site release alignment:

- Google Search Console access or MCP: sitemap/index/query checks.
- Bing Webmaster Tools/IndexNow workflow.
- Umami or Matomo for public analytics.
- PostHog self-host only if portal/product funnel analytics become necessary.

Why:

- These make SEO and lead contribution measurable.
- They should not be added before privacy and ownership decisions.

### P1 - CRM and lead operations

Choose one CRM source of truth before automation:

- Twenty CRM for modern open-source CRM.
- Odoo Community Edition if broader ERP workflows matter.
- EspoCRM or SuiteCRM if a classic CRM model is preferred.

Then integrate:

- Owned intake API.
- Turnstile.
- Lead DB table.
- CRM sync.
- Transactional email.
- WhatsApp event capture.

Why:

- Forms without routing, attribution, and ownership are a conversion leak.
- Automation should follow source-of-truth choice, not precede it.

### P2 - portal production operations

Add before external portal beta:

- GlitchTip or Sentry for errors.
- Uptime Kuma or Better Stack for uptime.
- MinIO or Cloudflare R2 for document storage.
- ClamAV or managed malware scanning for uploads.
- Postgres read-only MCP only for debugging/reporting after access rules are stable.

Why:

- Portal contains sensitive buyer/seller workflows.
- Monitoring, file safety, and role isolation are required before beta.

## MCP recommendations

Use MCPs sparingly because each server adds tools and context.

### Keep enabled now

- None, until MCP listing works with a project MCP entry.

### Enable first after repair

- Playwright MCP: local browser QA and visual/mobile checks.

### Add next only if needed

- Context7 MCP: framework/API docs lookup, no project secrets. Useful for Cloudflare, Next.js, Auth.js, Prisma, and Playwright docs.
- Cloudflare MCP: Pages, Workers, R2, DNS, logs. Add only with scoped auth.
- Search Console MCP: indexing and query analysis. Read-only first.

### Prefer CLI before MCP for now

- GitHub: use `gh` first because GitHub MCP can add many tools/tokens.
- Git operations: use local git commands; no Git MCP needed.

### Add later, read-only by default

- CRM MCP after CRM is selected.
- Postgres/Supabase/Neon MCP after portal DB access rules are ready.
- R2/S3 MCP for asset/document inventory, not broad write access.
- Sentry/GlitchTip MCP after error monitoring exists.
- n8n/Activepieces MCP after workflows are approved.

## Plugin recommendations

Keep now:

- `secret-guard.js`.

Do not add now:

- Plugins that inject environment variables or secrets.
- Plugins that auto-deploy or auto-push.
- Plugins that send code, private records, or screenshots to third-party tools without approval.

Possible later plugins:

- Release note context injector.
- Local notification on long audit completion.
- Guardrail plugin that asks before destructive git/deploy commands.

## No-mistake rules

- Separate actual state from proposals.
- Keep MCPs disabled until the OpenCode/MCP parser issue is resolved.
- Keep credentialed MCPs out until scopes and owners are clear.
- Use commands/scripts before adding broad automation.
- Keep plugins local and defensive.
- Use skills and agents to encode Moldart-specific judgment.
- Do not expose `.env`, `API-KEYS.txt`, raw tokens, private keys, customer documents, or private portal records.
- Restart OpenCode after config changes before expecting new skills/MCPs/plugins to appear.
