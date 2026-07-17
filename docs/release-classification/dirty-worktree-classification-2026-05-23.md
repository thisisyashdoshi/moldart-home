# Dirty Worktree Classification — 2026-05-23

Current branch: master

Total changed paths: 378

## Buckets

| Bucket | Count | Release treatment |
|---|---:|---|
| source | 64 | Review and intentionally keep/port source changes. |
| generated | 191 | Regenerated artifact; do not hand-edit; keep only after source build. |
| docs | 9 | Keep audit/planning evidence; not production critical. |
| tooling | 1 | Review for CI/test support. |
| assets | 81 | Verify size/dimensions/references before keep. |
| node | 0 | Do not commit vendored node_modules. |
| tmp | 0 | Do not commit temp outputs unless report evidence is explicitly needed. |
| other | 32 | Manual review. |

## Examples

### source
-  M _headers
-  M _redirects
-  M build.js
-  M data/search-index.json
-  M functions/api/chat.js
-  M generate.js
-  M main.js
-  M package.json
-  M site-overrides.css
-  M site.webmanifest
-  M wrangler.toml
- ?? .github/
- ?? .htmlvalidate.json
- ?? .prettierrc.json
- ?? .stylelintrc.json
- ?? data/ai-visual-manifest.json
- ?? data/ai-visual-prompts.json
- ?? data/online-presence-standard.json
- ?? data/youtube-library.json
- ?? eslint.config.mjs
- ?? functions/_shared/
- ?? functions/api/lead-intake.js
- ?? functions/api/ows-admin.js
- ?? functions/api/ows-intake.js
- ?? insight-media-coverage.generated.json
- ?? jscpd.json
- ?? knip.json
- ?? lead-forms.js
- ?? netlify/functions/lead-intake.mjs
- ?? netlify/functions/ows-admin.mjs
- ?? netlify/functions/ows-intake.mjs
- ?? renovate.json
- ?? scripts/check-a11y.js
- ?? scripts/check-css-light.mjs
- ?? scripts/check-downloads.js
- ?? scripts/check-format-light.mjs
- ?? scripts/check-headers.js
- ?? scripts/check-html-light.mjs
- ?? scripts/check-js-syntax.mjs
- ?? scripts/check-lighthouse.js

### generated
-  M 404.html
-  M about/index.html
-  M applications/architecture/index.html
-  M applications/flooring/index.html
-  M applications/furniture/index.html
-  M applications/index.html
-  M applications/lamination/index.html
-  M applications/metal-finishing/index.html
-  M applications/pcb-ccl/index.html
-  M contact/index.html
-  M explore/index.html
-  M faq/index.html
-  M index.html
-  M industry/index.html
-  M insights/custom-furniture-applications/index.html
-  M insights/custom-furniture-brief-drawing-sample-guide/index.html
-  M insights/custom-furniture-brief-guide/index.html
-  M insights/custom-furniture-buyers-guide/index.html
-  M insights/custom-furniture-comparison/index.html
-  M insights/custom-furniture-guide/index.html
-  M insights/custom-furniture-quality/index.html
-  M insights/custom-furniture-specifications/index.html
-  M insights/decor-paper-applications/index.html
-  M insights/decor-paper-buyers-guide/index.html
-  M insights/decor-paper-comparison/index.html
-  M insights/decor-paper-guide/index.html
-  M insights/decor-paper-quality/index.html
-  M insights/decor-paper-specifications/index.html
-  M insights/decorative-panels-applications/index.html
-  M insights/decorative-panels-buyers-guide/index.html
-  M insights/decorative-panels-comparison/index.html
-  M insights/decorative-panels-guide/index.html
-  M insights/decorative-panels-quality/index.html
-  M insights/decorative-panels-specifications/index.html
-  M insights/decorative-ss-panel-approval-guide/index.html
-  M insights/decorative-stainless-steel-finish-family-guide/index.html
-  M insights/decorative-stainless-steel-sourcing-note/index.html
-  M insights/engineered-flooring-selection-guide/index.html
-  M insights/engraved-cylinders-applications/index.html
-  M insights/engraved-cylinders-buyers-guide/index.html

### docs
- ?? AGENTS.md
- ?? architecture.md
- ?? data-model.md
- ?? docs/
- ?? insight-media-coverage.generated.md
- ?? roles-permissions-matrix.md
- ?? route-map.md
- ?? workflow-state-machines.md
- ?? youtube-insight-integration-report.generated.md

### tooling
- ?? tests/

### assets
-  M images/insights/custom-furniture-brief-drawing-sample-guide.svg
-  M images/insights/custom-furniture-brief-guide.svg
-  M images/insights/decorative-ss-panel-approval-guide.svg
-  M images/insights/decorative-stainless-steel-finish-family-guide.svg
-  M images/insights/decorative-stainless-steel-sourcing-note.svg
-  M images/insights/engineered-flooring-selection-guide.svg
-  M images/insights/engraved-cylinders-repeat-accuracy-guide.svg
-  M images/insights/hpl-vs-lpl-material-selection-guide.svg
-  M images/insights/industrial-press-plates-quality-priorities.svg
-  M images/insights/industrial-press-plates-receiving-flatness-checklist.svg
-  M images/insights/mdf-vs-hdf-surface-readiness-guide.svg
-  M images/insights/osb-application-fit-guide.svg
-  M images/insights/particleboard-buyers-guide.png
-  M images/insights/particleboard-buyers-guide.svg
-  M images/insights/press-pads-quality-replacement-checks.svg
-  M images/insights/press-plate-chrome-condition-guide.svg
-  M images/insights/press-plates-pads-smart-tooling-perfect-panels.svg
-  M images/insights/printed-decor-paper-batch-repeat-approval-guide.svg
-  M images/insights/printed-decor-paper-selection-guide.svg
-  M images/insights/ready-made-furniture-procurement-guide.svg
-  M images/insights/shuttering-plywood-surface-finish-note.svg
-  M images/insights/ss-201-vs-304-panels.svg
-  M images/insights/ss-profiles-application-guide.svg
-  M images/insights/super-mirror-shuttering-plywood-guide.svg
-  M images/insights/upgraded-shuttering-plywood-vs-aluminium-plastic-formwork.svg
-  M images/insights/wood-flooring-core-moisture-wear-class-guide.svg
-  M images/social/moldart-about.png
-  M images/social/moldart-contact.png
-  M images/social/moldart-default.png
-  M images/social/moldart-explore.png
-  M images/social/moldart-home.png
-  M images/social/moldart-insights.png
-  M images/social/moldart-portal.png
-  M images/social/moldart-portal.svg
-  M images/social/moldart-resources.png
-  M images/social/moldart-solutions.png
- ?? downloads/checklists/
- ?? images/ai-generated/
- ?? images/insights/anti-fingerprint-stainless-steel-use-case-limits-cleaning.png
- ?? images/insights/anti-fingerprint-stainless-steel-use-case-limits-cleaning.svg

### node

### tmp

### other
- M  gitignore
-  M llms-full.txt
-  M llms.txt
-  M netlify.toml
-  M netlify/functions/chat.js
-  D offline.html
-  M portal/approvals/index.html
-  M portal/catalog/index.html
-  M portal/dashboard/index.html
-  M portal/index.html
-  M portal/orders/index.html
-  M portal/rfq/index.html
-  M portal/sign-in/index.html
-  M portal/sign-up/index.html
-  M preview-server.js
-  M sw.js
- ?? .env.example
- ?? .pi-lens/
- ?? .prettierignore
- ?? .stylelintignore
- ?? .well-known/
- ?? astro-public/
- ?? docker-compose.yml
- ?? lefthook.yml
- ?? lychee.toml
- ?? mise.toml
- ?? opencode.jsonc
- ?? portal-app.js
- ?? reels/
- ?? security.txt
- ?? technical-library.js
- ?? trade-portal/

## Release branch decision

A clean release branch cannot honestly be claimed inside this dirty worktree without either stashing/committing hundreds of existing changes or creating an isolated worktree. For safety, this audit classifies the current state and uses a dedicated branch marker for ongoing UI/UX draft work while avoiding production deployment. Before production, create an isolated clean worktree and port only intentional source/docs/assets changes.
