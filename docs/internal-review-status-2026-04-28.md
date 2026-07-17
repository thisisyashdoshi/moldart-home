# Internal Review Status - 2026-04-28

## Current status

- Production deploy is not approved.
- Public static site review output is under `public-site/`.
- Public portal output is only the private boundary page at `public-site/portal/index.html`.
- Real authenticated portal work is under `trade-portal/`.
- Offline service-worker caching has been disabled because it masked broken local services behind stale content.

## Website changes completed

- Homepage copy tightened around specification-led B2B sourcing from Mumbai.
- Contact page reframed as the RFQ/intake page for India inquiries and China sourcing needs.
- Process page reduced to the operational path: inquiry, sourcing, approval, payment, logistics, documents.
- Portal public page changed to a private-access boundary, not a public login pitch.
- Static legacy portal subpages are no longer part of the public review output.
- Build artifact copy now skips unavailable OneDrive/cloud placeholder files and oversized Cloudflare Pages assets.

## Portal changes completed

- Polished auth and workspace shells.
- Buyer, seller, and admin dashboards now focus on next actions.
- RFQ assignment from admin to seller.
- Seller quote submission and revision.
- Buyer quote acceptance into order flow.
- Mock/manual payment reporting and admin reconciliation actions.
- Manual logistics milestone completion.
- Document center visibility improvements.
- Server-side role and company checks added around the new actions.
- Audit/notification hooks added for important workflow changes.

## Checks completed

- Static build passed earlier in this review cycle before the local Windows runtime broke.
- Portal checks passed earlier in a fast local copy: typecheck, lint, tests, Prisma generation, production build, database push, and seed.
- Current checked review files no longer contain stale offline page text, visible demo credential strings, or old service-worker registration.

## Current blocker

Local preview cannot be trusted right now because this Windows runtime fails before starting Node:

```text
Assertion failed: ncrypto::CSPRNG(nullptr, 0)
```

No listener is currently active on ports `4173`, `3000`, or `3100`, so `http://127.0.0.1:4173/` is not a valid current preview.

## Required before final internal QA

- Repair the local Windows socket/crypto runtime, or run the review stack on a stable review machine.
- Rebuild the static site.
- Start static preview and portal stack.
- Browser-test homepage, contact, process, resources, solutions, and portal boundary.
- Browser-test buyer, seller, and admin portal workflows end to end.
- Capture screenshots for the internal review package.

## Inputs needed

- Approved public claims: certifications, markets, client types, volumes, or capabilities that are allowed on the website.
- Approved brand/product reference images, if any.
- Sanitized service list from the API file: service names only, not keys or secrets.
- Internal reviewer names/roles.
- Whether buyer/seller beta screenshots can show realistic sample data or must be masked.
- Final payment and logistics provider direction for later real integrations.
