## Review
- Correct: **Security Headers** (`_headers`). The draft includes a comprehensive Content-Security-Policy (CSP), Strict-Transport-Security (HSTS) with `preload`, `X-Frame-Options: DENY`, and strict `Permissions-Policy`.
- Correct: **Preview Isolation** (`functions/_middleware.js`). Cloudflare Pages preview environments (`*.pages.dev`) correctly return `X-Robots-Tag: noindex, nofollow, noarchive` to prevent search engine indexing of non-production builds.
- Correct: **Lead Intake Protection** (`tests/lead-intake-core.test.mjs`, `lead-forms.js`). Client-side turnstile initialization is present. Server-side logic (covered in tests) correctly normalizes inputs (e.g., lowercase email, sanitized phone), requires mandatory fields (Name, Company, Email), and treats honeypot fields (`website`) as spam rejections.
- Correct: **Vulnerability Reporting** (`security.txt`). A valid security contact and expiration date (2027) are provided.
- Note: **API Route Check**. `lead-forms.js` submits via POST to `/api/lead-intake`. The backend Cloudflare function (`functions/api/lead-intake.js`) must be deployed properly to handle this. Tests confirm the shared core logic (`functions/_shared/lead-intake-core.mjs`) is in place.
- Note: **Caching Strategy** (`_headers`). Static assets (CSS, JS, images, fonts) are heavily cached (`max-age=31536000, immutable`), while HTML and API routes are explicitly excluded from caching (`max-age=0, must-revalidate` or `no-store`).

This draft appears branch-only candidate ready and enforces strong privacy and security baselines.
