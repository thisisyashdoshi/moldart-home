# Internal Dell Debian App Baseline

No remote install was attempted from this workspace because the LAN host, SSH user, and approval boundary are not available here. Use this as the first-pass baseline for the internal Dell Debian server: check whether each category already exists, install the selected top option only if missing, then replace later only if it shows real compromises.

## Recommended Top Picks

| Category              | Pick                              | Why                                                                                              |
| --------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| Reverse proxy and TLS | Caddy                             | Small config, automatic TLS, simpler than Nginx for app routing                                  |
| App runtime           | Docker Engine plus Compose plugin | Best common denominator for Twenty, Umami, Uptime Kuma, MinIO, Activepieces, and portal services |
| Database              | PostgreSQL                        | Portal-ready, CRM-ready, analytics-ready, durable and familiar                                   |
| Cache and queues      | Redis                             | Matches current trade-portal queue/cache assumptions                                             |
| Object storage        | MinIO                             | S3-compatible local storage; maps cleanly to R2/S3 later                                         |
| CRM                   | Twenty CRM                        | Modern open-source CRM, better first fit than heavier legacy CRMs                                |
| Automation            | Activepieces CE                   | Practical open-source Zapier-style workflows for lead routing and CRM/email sync                 |
| Analytics             | Umami                             | Lightweight, privacy-friendly, faster to operate than Matomo for this use case                   |
| Uptime monitoring     | Uptime Kuma                       | Simple, reliable internal and external monitor with alerts                                       |
| Error tracking        | GlitchTip                         | Open-source Sentry-compatible option for portal/app errors                                       |
| Secrets vault         | Vaultwarden                       | Good LAN/VPN-first password/API-key vault; do not expose publicly without hardening              |
| Security scanning     | Gitleaks                          | Best first secret-leak scanner for repo and deployment checks                                    |
| Dependency scanning   | OSV-Scanner                       | Good open-source dependency vulnerability scanner                                                |
| Container scanning    | Trivy                             | Best first scanner for images, filesystems, and IaC                                              |
| Static site search    | Pagefind                          | No server needed; keep it in the build pipeline, not as a daemon                                 |

## Check Commands

Run these on the Debian server after SSH login.

```bash
hostnamectl
systemctl is-active caddy postgresql redis-server docker || true
command -v docker || true
docker compose version || true
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

## Install Direction

Install in this order if missing: Docker, Caddy, PostgreSQL, Redis, MinIO, Uptime Kuma, Umami, Twenty CRM, Activepieces, GlitchTip, Vaultwarden, scanners.

Keep every app behind Caddy. Expose admin apps only on LAN/VPN until authentication, backups, updates, and firewall rules are verified.

## Minimum Operating Rules

| Rule        | Requirement                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Secrets     | Move keys out of text files into Vaultwarden or provider dashboards                                                                              |
| Backups     | Back up PostgreSQL, MinIO volumes, and Docker compose files before production use                                                                |
| Updates     | Use pinned container versions; avoid `latest` for production apps                                                                                |
| Network     | Do not expose CRM, Vaultwarden, MinIO console, or internal dashboards directly to the public internet                                            |
| Logs        | Do not log raw form secrets, API tokens, private customer documents, or full payment details                                                     |
| Replacement | Replace an app only after a concrete compromise appears: missing feature, poor security, high maintenance, bad performance, or workflow mismatch |
