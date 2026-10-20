# Codex operating instructions

## Repository purpose
This repository is the deploy-ready public Moldart website. Treat committed files as the source of truth for cloud tasks.

## Working rules
- Inspect README.md and package.json before editing.
- Preserve the public-only boundary: do not add portal/private routes, source PDFs, credentials, customer/supplier data, internal pricing, or private operational files.
- Make the smallest reversible change needed for the requested task.
- Do not deploy, publish, merge, change DNS/Cloudflare/Vercel settings, or alter external services unless the user explicitly authorizes that exact action.
- If a task depends on files/services that exist only on an on-prem machine or private network, report that dependency instead of inventing or simulating it.

## Code review: consequential invariants
- Do not publish unapproved technical, regulatory, conformity, quality or performance claims. Confirm exact material grade, application, test method, destination and supporting evidence; avoid blanket numeric tolerances or certifications.
- Use only approved, correctly identified visuals and assets with appropriate rights. Never publish supplier/customer identities, confidential documents, internal costs or private operational content.
- Keep edited public pages, internal navigation, metadata and referenced assets consistent. A green command that prints success without validating output is not proof of site correctness.

## Validation
- The current `npm run build` only prints a message because this repository contains a prebuilt static export. Do not describe that no-op script as a compilation, content, link, asset or browser test.
- Check that only intended files changed. For content changes, validate the affected static HTML/SVG/JS/assets and local links using available deterministic checks; state exactly which checks ran and what remains unverified.
- For website changes, verify key public routes/assets affected by the change and report any untested browser-only behavior.

## Output
Report: changed files, validation run/results, remaining blocker if any, and whether the result is ready for review or still requires a deployment/merge approval.
