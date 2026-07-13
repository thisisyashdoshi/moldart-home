# Repository agent rules

## Scope
- This repository currently contains:
  - the public static marketing site at the repo root
  - a new Next.js trade portal app under `trade-portal/`
- The legacy portal prototype lives in static-site files such as `generate.js`, `portal-app.js`, `portal/index.html`, and the generated `portal/*` HTML output.
- The real authenticated trade portal work must happen in `trade-portal/`, not by extending the static prototype.

## Next.js rule
- Before changing framework code inside `trade-portal/`, read the installed version-matched Next.js docs from:
  - `trade-portal/node_modules/next/dist/docs`
- Prefer App Router patterns that match the installed version.
- Do not rely on stale framework memory when working on routing, layouts, metadata, middleware, or server actions.

## Security rule
- Protected portal routes must enforce server-side authorization.
- Never rely on hidden UI alone for role or company isolation.
- Prefer repository / DAL access helpers for authorization-sensitive reads and writes.

## Portal routing rule
- Public portal entry must only expose:
  - `/portal`
  - `/portal/register`
  - `/portal/forgot-password`
  - `/portal/reset-password`
- Authenticated workspace routes belong in the Next.js app and must stay protected by middleware plus server checks.

## Internal review rule
- Do not enable an offline service-worker shell for the internal review build. It can mask broken local services or stale previews behind cached content.

## Working style
- Preserve the existing marketing site unless the task explicitly asks to rewire deployment.
- Prefer the smallest safe diff.
- Document assumptions in the architecture docs when making portal decisions.

## Public website source of truth
- Treat this folder as the current public static draft source for Moldart website improvements.
- Do not patch older deployed/export folders as the long-term source unless the user explicitly asks for a one-off emergency fix.
- `public-site/` is a generated artifact. Regenerate it from this workspace rather than hand-editing it for durable changes.
- Do not modify `TECH/WEBSITE/existing/` or other reference/frozen copies unless explicitly approved.

## Public website release gates
- Before sharing a local draft link, run `npm run preview:ensure`.
- Before a Cloudflare preview or production release, run:
  - `npm run goal`
  - `npm run release:check`
  - `node scripts/moldart-quality-monitor.mjs --base=http://127.0.0.1:4173`
  - `npm run audit:site -- http://127.0.0.1:4173`
  - `npm run compare:live-draft -- --draft=http://127.0.0.1:4173 --live=https://moldartindia.com`
- Production deployment needs explicit approval after a Cloudflare Pages preview passes the same gates against the preview URL.
- Do not deploy, push, change DNS, or change Cloudflare production settings from routine monitoring runs.
