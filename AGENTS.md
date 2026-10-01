# Codex operating instructions

## Repository purpose
This repository is the deploy-ready public Moldart website. Treat committed files as the source of truth for cloud tasks.

## Working rules
- Inspect README.md and package.json before editing.
- Preserve the public-only boundary: do not add portal/private routes, source PDFs, credentials, customer/supplier data, internal pricing, or private operational files.
- Make the smallest reversible change needed for the requested task.
- Do not deploy, publish, merge, change DNS/Cloudflare/Vercel settings, or alter external services unless the user explicitly authorizes that exact action.
- If a task depends on files/services that exist only on an on-prem machine or private network, report that dependency instead of inventing or simulating it.

## Validation
- Run `npm run build` after relevant changes.
- Check that only intended files changed.
- For website changes, verify key public routes/assets affected by the change and report any untested browser-only behavior.

## Output
Report: changed files, validation run/results, remaining blocker if any, and whether the result is ready for review or still requires a deployment/merge approval.
