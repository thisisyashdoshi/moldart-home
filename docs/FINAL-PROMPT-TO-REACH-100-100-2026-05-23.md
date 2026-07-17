# Final Prompt — Finish Moldart Website to Defensible 100/100

Use this as the next implementation prompt if continuing with another agent/session.

---

You are working in:

`C:/Users/recoveryadmin/OneDrive - Deco Metal/WORK/OTHERS/MASTER - YASH/MARKETING/TECH/WEBSITE/existing-new/work`

Do not deploy production without explicit approval. Use Cloudflare Pages branch `draft-audit-fixes` only for review drafts.

Current review draft:

`https://draft-audit-fixes.moldart-home.pages.dev`

Goal: make every measurable website parameter defensibly 99–100/100 with evidence, not opinion.

Required evidence gates:

1. Clean release branch, no unclassified dirty worktree.
2. `npm run build` pass.
3. `npm run format:check` pass.
4. `npm run lint:js` pass.
5. `npm run test:unit` pass.
6. `npm run secretlint:check` pass.
7. `npm run license:check` pass.
8. `npm run security:deps` pass.
9. `npm run lint:css` pass.
10. `npm run lint:html` pass.
11. `npm run unused:check` pass.
12. `npm run release:check` pass.
13. `npm run goal` pass.
14. `node scripts/moldart-quality-monitor.mjs --base=https://draft-audit-fixes.moldart-home.pages.dev` pass.
15. `npm run audit:site -- https://draft-audit-fixes.moldart-home.pages.dev` pass.
16. `npm run compare:live-draft -- --draft=https://draft-audit-fixes.moldart-home.pages.dev --live=https://moldartindia.com` pass.
17. Lighthouse mobile and desktop on preview: Performance ≥95 minimum, target ≥99; Accessibility 100; Best Practices 100; SEO 100; LCP ≤2.5s; CLS ≤0.05; TBT ≤100ms.
18. Preview `/api/lead-intake` POST returns 201.
19. Main production CSP has no unsafe-inline; legacy `/open-wood-science/*` exception must be removed for true 100/100 security.
20. Production Cloudflare D1/webhook/Turnstile/WAF/rate-limit/observability must be configured and tested before claiming forms/API and observability 100/100.

Known current blockers:

- Lighthouse Performance still fails. Latest preview run: Performance 0.61, LCP ~4.9s, TBT ~899ms. LCP element is the homepage H1 text block.
- CSS is still too heavy: `site-overrides.css`, `pages.css`, and `styles.css` create large unused-CSS savings in Lighthouse.
- Worktree is dirty and must be cleaned/classified before production.
- Legacy `/open-wood-science/*` has scoped unsafe-inline CSP due inline legacy page CSS/scripts.
- Production observability is not yet provisioned.

Implement in this order:

1. Create a clean release branch and classify changes.
2. Split critical homepage CSS correctly without delaying hero H1 rendering. Do not ship a visual regression. Test with `audit:site` after every CSS change.
3. Reduce `site-overrides.css` and `pages.css` safely; do not break any 193 generated HTML pages.
4. Externalize `/open-wood-science/` inline CSS/scripts and remove its unsafe-inline CSP override.
5. Add/verify Cloudflare observability and API protection.
6. Add final E-E-A-T modules only where true and supportable: proof blocks, author/reviewer/last-reviewed, process checkpoints.
7. Deploy only to `draft-audit-fixes`.
8. Run the full evidence gate list.
9. Report current vs future ratings and include exact JSON/report paths.
10. Ask for explicit approval before production deploy.
