# Online Presence Standard - 2026-05-06

## Purpose

Keep Moldart, Deco Metal, Yash Doshi, Lalit Doshi, and Sonal Doshi consistent across owned websites, public profiles, search snippets, and third-party directories. This file is public-safe: it records only public facts, correction priorities, and monitoring rules. It must not contain raw API keys, vault values, passwords, tokens, or private customer/supplier data.

## Canonical Public Identity

- Brand: Moldart
- Legal company name: Mold Art (India) Private Limited
- Related business name: Deco Metal
- Website: https://moldartindia.com/
- Public positioning: Specification-led wood and steel supply programmes from Mumbai.
- Public geography: Mumbai-led coordination with India and China as sourcing anchors.
- Email: info@moldartindia.com
- WhatsApp: +91 7208088788 / +91 7208188788
- Address: #7, Building No. 1, New Sonal Link Industrial Estate, Link Road, Malad (West), Mumbai 400064, Maharashtra, India
- Company LinkedIn: https://www.linkedin.com/company/moldartindia
- Yash Doshi LinkedIn: https://www.linkedin.com/in/thisisyashdoshi

## Name Standard

- Use `Moldart` for the public brand.
- Use `Mold Art (India) Private Limited` where a legal company name is needed.
- Use `Deco Metal` for the related GST/business profile.
- Use `Yash Doshi` in public brand/profile copy; use `Yash Lalit Doshi` only in statutory context.
- Use `Lalit Doshi` in public brand/profile copy; use `Lalit Nagindas Doshi` only in statutory context.
- Use `Sonal Doshi` in public brand/profile copy; use `Sonal Lalitkumar Doshi` only in statutory context.

## Public Sources Checked

- Moldart website: https://moldartindia.com/
- Moldart FAQ/contact snippets: https://moldartindia.com/faq/
- Moldart LinkedIn company page: https://www.linkedin.com/company/moldartindia
- Yash Doshi LinkedIn profile: https://www.linkedin.com/in/thisisyashdoshi
- Mold Art company profile: https://www.thecompanycheck.com/company/mold-art-india-private-limited/U74994MH2005PTC153242
- Mold Art Zauba profile: https://www.zaubacorp.com/MOLD-ART-INDIA-PRIVATE-LIMITED-U74994MH2005PTC153242
- Mold Art QuickCompany profile: https://www.quickcompany.in/company/mold-art-india-private-limited
- Deco Metal GST profile: https://piceapp.com/gst-number-search/deco-metal-27aahfd0708k1zi/
- Deco Metal business profile: https://www.thecompanycheck.com/org/deco-metal/61d73c9787
- Deco Metal local directory profile: https://www.bharatibiz.com/deco-metal_15-098705-88788
- Deco Metal job posting: https://www.behance.net/joblist/195785/Design-and-Digital-Executive
- Cloudflare Error 1033 reference for the link-domain gate: https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1033/

## Findings

- Owned Moldart pages are broadly consistent on brand, Mumbai base, public website, email, WhatsApp numbers, and LinkedIn links.
- The site generator was rewriting explicit insight article dates and could make indexed article snippets look unrealistically old. This is now fixed in `generate.js`; explicit dates are preserved.
- `llms.txt` and `llms-full.txt` now include a Canonical Identity section so AI/search tools receive the same base facts.
- Third-party sources use multiple forms: `Moldart`, `Mold Art`, `MOLD ART (INDIA) PRIVATE LIMITED`, `Deco Metal`, and `DECO METAL`. This is normal but should be controlled in owned copy.
- Third-party company pages list Lalit Nagindas Doshi and Sonal Lalitkumar Doshi in statutory/director context. Do not convert that into casual marketing copy unless approved.
- Deco Metal GST sources surface `27AAHFD0708K1ZI` and address variants around New Sonal Link Heavy Industrial Estate, Malad West.
- Directory/job sources contain extra phone/email variants such as `+91 9821788788`, `yash@moldartindia.com`, and `factoryvasai72@gmail.com`. Treat those as profile-specific or legacy until manually confirmed.
- `https://links.moldartindia.com/` remains a hard send-readiness gate. If it returns Cloudflare Error 1033, no live email send should proceed because unsubscribe/archive/view-in-browser routes may be broken.

## Correction Priority

1. Keep owned website and generated machine-readable files canonical first: homepage, about, contact, FAQ, footer, JSON-LD, sitemap, robots, `llms.txt`, and `llms-full.txt`.
2. Keep LinkedIn company/profile copy aligned to the same public positioning, contact email, WhatsApp numbers, and website URL.
3. For third-party business directories, correct only facts that are wrong or harmful. Do not chase every minor casing difference.
4. Before any live outbound campaign, verify `links.moldartindia.com` health and Listmonk link behavior directly.
5. For recruitment listings, use one current contact route. Close or update old listings if they publish stale phone/email details.

## Monitoring Rule

Run:

```powershell
npm run presence:check
```

The check reads `data/online-presence-standard.json`, verifies watched owned/public URLs, flags Cloudflare Error 1033, and prints a concise JSON summary. Use `PRESENCE_STRICT=1` only when a release gate should fail on critical owned-site problems.

## Credential Rule

Use Microsoft vault, browser sessions, and authenticated connectors only as access layers. Never print, copy, summarize, or store raw API keys, tokens, passwords, private auth exports, or customer/supplier data in repo files, prompts, logs, screenshots, or reports.
