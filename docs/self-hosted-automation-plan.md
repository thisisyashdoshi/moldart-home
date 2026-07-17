# Moldart Self-Hosted Automation Plan

This plan keeps the website improvement loop efficient without giving any automation uncontrolled write, deploy, DNS, Cloudflare, or credential authority.

## Objective Pushback

- Do not run a 24x7 self-mutating agent. It can silently publish bad content, leak credentials, or break the public site faster than a human can review.
- Do not install broad filesystem, Docker, Cloudflare, GitHub, or email-sending integrations for this website loop. The current need is monitoring, evidence, and gated recommendations.
- Do not auto-deploy from a monitor. Deployment remains a separate human-approved release gate.
- Do not duplicate browser automation services globally. Existing local browser tooling is enough for interactive QA; the monitor should stay lightweight and deterministic.

## FOSS / Self-Hosted Stack

- `n8n`: schedule the goal loop and collect reports. Authority: run one command and store/report output only.
- `Uptime Kuma`: monitor live or preview routes, keywords, and public availability. Authority: read-only HTTP checks only.
- `ntfy` or `Gotify`: send alerts from n8n or the monitor result. Authority: notification only.
- `Prometheus` and `Grafana`: optional if long-term trend charts are needed. Authority: metrics ingestion only.

## Custom Script

Use `scripts/moldart-quality-monitor.mjs` as the single local quality gate.

Commands:

```powershell
npm run monitor:site
npm run monitor:site:build
npm run goal
node scripts/moldart-quality-monitor.mjs --base=http://127.0.0.1:4173
```

Report outputs:

- `.tmp/moldart-quality-monitor-report.json`
- `.tmp/moldart-quality-monitor-report.md`

The script checks:

- `generate.js` syntax.
- Public YouTube inventory count: 40 total, 18 long-form, 22 Shorts.
- Existing-insight-only video mappings.
- 51 published insights.
- One selected video per published insight.
- One image per published insight.
- Rendered artifact pages include exactly one YouTube card and one cover image per insight.
- Public artifact sitemap routes exist.
- Optional HTTP checks when a base URL is supplied.

## n8n Workflow Shape

1. Schedule trigger every 1 to 6 hours.
2. Execute command: `npm run monitor:site` for read-only status or `npm run monitor:site:build` in a controlled local workspace.
3. Read `.tmp/moldart-quality-monitor-report.json`.
4. If `failures.length > 0`, notify via `ntfy` or `Gotify` with the Markdown report.
5. If clean, store the report and do nothing.

## Uptime Kuma Checks

- `https://moldartindia.com/` should contain `Moldart`.
- `https://moldartindia.com/insights/` should contain `Technical Library`.
- `https://moldartindia.com/llms.txt` should return `200` and contain Markdown links.
- After deployment approval only, add checks for representative insight pages containing `Related Moldart videos`.

## Approval Gates

- Monitor scripts may report and fail fast.
- Build scripts may regenerate local artifacts.
- No automation may deploy, push, alter DNS, alter Cloudflare, change credentials, send campaigns, or modify production services without exact approval.
