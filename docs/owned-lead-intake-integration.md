# Owned Lead Intake Integration

This replaces third-party static form posts with an owned `/api/lead-intake` boundary for public contact and resource download leads.

## Current Scope

| Area                | Status                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Public endpoint     | `functions/api/lead-intake.js` for Cloudflare Pages                                                             |
| Netlify fallback    | `netlify/functions/lead-intake.mjs` plus `_redirects` rewrite                                                   |
| Validation          | Required name, company, email, phone, route/message or download context                                         |
| Spam control        | Honeypot now, Turnstile validation when `TURNSTILE_SECRET_KEY` and `LEAD_REQUIRE_TURNSTILE=true` are configured |
| Storage             | Cloudflare D1 binding `LEADS_DB` when configured                                                                |
| CRM/automation sync | Generic `LEAD_WEBHOOK_URL` with optional bearer token                                                           |
| IP storage          | Disabled by default; only stored when `LEAD_STORE_IP=true`                                                      |

## Required Environment

Use provider dashboards or a password manager. Do not paste raw values into repo docs.

| Variable                 | Purpose                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `ALLOWED_ORIGINS`        | Comma-separated public origins allowed to call the endpoint                                                       |
| `LEAD_REQUIRE_TURNSTILE` | Set `true` in production after adding the Turnstile widget/token                                                  |
| `TURNSTILE_SITE_KEY`     | Public site key used by the browser widget; not secret, but still manage through deployment config where possible |
| `TURNSTILE_SECRET_KEY`   | Cloudflare Turnstile server-side secret                                                                           |
| `LEADS_DB`               | Cloudflare D1 binding name for owned lead storage                                                                 |
| `LEAD_WEBHOOK_URL`       | Optional automation or CRM webhook endpoint                                                                       |
| `LEAD_WEBHOOK_TOKEN`     | Optional webhook bearer token                                                                                     |
| `LEAD_STORE_IP`          | Keep `false` unless there is a clear compliance reason                                                            |

## D1 Table

Create this table before enabling production form traffic if D1 is the primary store.

```sql
CREATE TABLE IF NOT EXISTS lead_intake (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  lead_type TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  inquiry_route TEXT,
  interest TEXT,
  application TEXT,
  quantity_context TEXT,
  target_timing TEXT,
  destination TEXT,
  incoterm TEXT,
  hs_code TEXT,
  files_available TEXT,
  message TEXT,
  download_title TEXT,
  download_url TEXT,
  source_page TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  consent_context TEXT,
  user_agent TEXT,
  cf_country TEXT,
  ip TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  payload_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_intake_created_at ON lead_intake(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_intake_email ON lead_intake(email);
CREATE INDEX IF NOT EXISTS idx_lead_intake_lead_type ON lead_intake(lead_type);
```

## Safe Activation Order

1. Configure D1 `LEADS_DB` or a webhook destination.
2. Add the public Turnstile site key to the client config, verify the widget fills `cf-turnstile-response`, then set `LEAD_REQUIRE_TURNSTILE=true` and `TURNSTILE_SECRET_KEY`.
3. Submit a test contact inquiry and resource download lead.
4. Verify lead record, source page, referrer, UTM fields, and warnings.
5. Keep `LEAD_INTAKE_DRY_RUN=false` in production.

## Deployment Note

`public-site/` is the static artifact and intentionally excludes `functions/` and `netlify/functions/`. For owned lead intake to work, deploy through a Cloudflare Pages project that sees the project-root `functions/` directory, or configure the equivalent functions directory when using direct uploads or Netlify fallback. A static-only upload of `public-site/` will serve the pages but not `/api/lead-intake`.

## Local Checks

Run `npm run test:lead-intake` for validation and dry-run behavior.

Run `npm run headers:check` after build to confirm third-party form hosts are gone and CSP is restricted to `form-action 'self'`.
