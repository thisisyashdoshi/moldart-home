# Moldart Website — Deep Audit & Improvement Plan
**Date:** 2026-05-21  
**Audited by:** Pi (Coding Agent)  
**Site:** moldartindia.com  
**Stack:** Vanilla HTML/CSS/JS · Cloudflare Pages (wrangler.toml) · GitHub (thisisyashdoshi/moldart-home)  
**Scope:** Full codebase audit — HTML, CSS, JS, SEO, performance, security, accessibility, UX, content strategy, conversion, infrastructure

---

## EXECUTIVE SUMMARY

The site is genuinely impressive for its stack. Zero frameworks, no React, no build-time JS overhead — just clean hand-written HTML, a CSS utility system, and a lean vanilla JS orchestration layer. The security headers, sitemap depth (83 URLs), 51 insight articles, product directory, command palette search, resource gating, and structured data are well above average for a B2B niche player. You are closer to 10/10 than most.

**But the honest rating is: 7.1 / 10**

The remaining 2.9 is real, well-defined, and fully fixable. This audit documents exactly what drops the score and how to close it.

---

## OVERALL SCORE BREAKDOWN

| Dimension | Score | Notes |
|---|---|---|
| Visual Design & Brand | 8.0/10 | Clean, confident zinc palette. Consistent radius system. Minor inconsistencies below. |
| SEO & Structured Data | 7.5/10 | Strong foundation. Critical gaps in social images and schema breadth. |
| Performance (Core Web Vitals) | 7.0/10 | Fonts + critical CSS inline is good. CSS bloat, render-blocking risk, duplicate `<style>` blocks are the drag. |
| Security | 8.5/10 | Excellent headers. One CSP `unsafe-inline` issue stands out. |
| Accessibility (a11y) | 6.5/10 | Skip link present. Missing nav landmark, ARIA labels on interactive elements, and mobile menu accessibility gaps. |
| Content Strategy | 7.5/10 | 51 insight articles is a moat. Hero copy is strong. About/team section has almost no depth. |
| Conversion / Lead Flow | 6.0/10 | The contact form, WhatsApp FAB, and resource gate are present but underoptimised. CTA placement and urgency signals are weak. |
| UX & Navigation | 7.0/10 | Command palette is a differentiator. But there is no visible main navigation menu on desktop. This is a real problem. |
| Mobile Experience | 7.5/10 | Responsive breakpoints exist. Tested images show correct layout. Some touch targets remain below 44px. |
| Technical Code Quality | 6.5/10 | Massive CSS duplication across every page `<head>`. No CSS bundling or deduplication. JS is lean. Service worker actively unregisters itself. |
| Infrastructure & Deployment | 8.0/10 | Cloudflare Pages config is sound. `_headers` is well-structured. `wrangler.toml` is minimal but correct. |

**OVERALL: 7.1 / 10**

---

## SECTION 1 — CRITICAL ISSUES (Fix Before Next Deploy)

### 1.1 CSS Is Duplicated On Every Page — A Major Performance Drag

**Problem:** Every HTML file (`index.html`, `about/index.html`, `contact/index.html`, etc.) embeds two large `<style>` blocks directly in the `<head>` — one is ~8KB of base styles, the second is ~5KB of page-specific layout. These are *in addition* to three external CSS files (`styles.css`, `pages.css`, `site-overrides.css`) that are also loaded on every page.

This means a user visiting the home page downloads:
- Inline CSS: ~13KB (duplicated on every route)
- `styles.css`: ~47KB
- `pages.css`: ~62KB
- `site-overrides.css`: ~12KB

**That is ~134KB of CSS before a single pixel renders.** On a 4G Indian mobile connection (avg ~10Mbps), that adds ~110ms of parse time alone. On slower connections it is significantly worse.

The inline `<style>` blocks should be stripped from every per-page `<head>` after the shared CSS files already contain those rules.

**Fix:**  
Audit what the inline `<style>` blocks add that is not already in `styles.css` / `pages.css`. Anything duplicated should be removed from the `<head>` blocks. Page-specific overrides should live in a single shared file that is already cached. After this, run `cleancss` to minify.

---

### 1.2 No Visible Desktop Navigation

**Problem:** The desktop header contains only the Moldart wordmark and a search pill. There are no navigation links visible on desktop without scrolling into the page or opening the command palette. Users unfamiliar with `Ctrl+K` keyboard shortcuts — which describes most B2B buyers in India — will have no obvious way to navigate to Products, Solutions, Resources, or Contact.

The `.site-nav-links` class is defined in CSS and applied in some page `<head>` blocks but the nav links are **not rendered in the actual `<nav>` element** in `index.html` or the other pages reviewed.

**This is a conversion-critical bug.** A buyer landing on the homepage needs to see where to go. If they cannot find navigation, they leave.

**Fix:**  
Add a visible navigation row to the `<nav>` element. Minimum links: Solutions · Products · Resources · Insights · Contact. On mobile this becomes the hamburger menu (already wired up). On desktop it renders inline after the logo.

```html
<nav>
  <div class="max-w mx-auto px h-16 flex items-center gap-4">
    <!-- Logo -->
    <a href="/" class="site-brand ...">MOLDART</a>
    <!-- ADD THIS: Desktop nav links -->
    <div class="site-nav-links md-hidden">
      <a href="/solutions/" class="site-nav-link nav-link">Solutions</a>
      <a href="/explore/" class="site-nav-link nav-link">Products</a>
      <a href="/resources/" class="site-nav-link nav-link">Resources</a>
      <a href="/insights/" class="site-nav-link nav-link">Insights</a>
      <a href="/contact/" class="site-nav-link nav-link">Contact</a>
    </div>
    <!-- Search (push right) -->
    <div class="flex-1"></div>
    <button ... data-open-command-palette>Search</button>
  </div>
</nav>
```

---

### 1.3 Social OG Images Do Not Exist in the Repository

**Problem:** Every page references OG/Twitter card images at paths like:
```
https://moldartindia.com/images/social/moldart-home.png
https://moldartindia.com/images/social/moldart-about.png
https://moldartindia.com/images/social/moldart-contact.png
```

There is **no `/images/social/` directory** in the repository. When a buyer or partner shares a link on WhatsApp, LinkedIn, or Twitter, the unfurl preview will show a broken image or generic placeholder. For a B2B brand, this is a silent trust killer.

**Fix:**  
Create `/images/social/` directory. Generate OG images for at minimum: home, about, contact, products, solutions, insights, resources. Recommended size: 1200×630px. Use a consistent template: dark background, Moldart wordmark, page title, "Since 1989 · Mumbai" footer. Export as `.png`. No lazy shortcuts — if the file does not exist, the meta tag does harm.

---

### 1.4 `robots.txt` Blocks GPTBot/CCBot But Allows OAI-SearchBot/Claude-SearchBot

**Problem:** The current `robots.txt` has a contradictory AI crawler policy:
- `GPTBot: Disallow /` — blocks OpenAI's web crawler
- `OAI-SearchBot: Allow /` — allows OpenAI's search bot
- `ClaudeBot: Disallow /` — blocks Anthropic's crawler
- `Claude-SearchBot: Allow /` — allows Anthropic's search bot
- `CCBot: Disallow /` — blocks Common Crawl

This is internally inconsistent. `GPTBot` is OpenAI's main crawl bot. `OAI-SearchBot` is their retrieval/citation bot. Blocking one and allowing the other is meaningless in practice — they draw from the same index. More importantly, **blocking AI crawlers reduces your chances of appearing in AI-generated search results**, which is where B2B sourcing increasingly starts.

**Fix (choose one direction):**
- **If you want AI visibility:** Remove the `Disallow` rules for GPTBot, ClaudeBot, CCBot entirely. Let all crawlers in.
- **If you want to restrict training data but allow citations:** Keep OAI-SearchBot/Claude-SearchBot as `Allow /`, and keep training crawlers as `Disallow /`. But be aware this is a grey line and may not hold.

For a B2B site with no user-generated content and a clear interest in being found by buyers researching via AI tools, full openness is the stronger commercial choice.

---

### 1.5 Service Worker Actively Unregisters Itself — No Offline Capability

**Problem:** `sw.js` is a deliberate self-destruct service worker. It:
1. Immediately skips waiting
2. Deletes all caches
3. Unregisters itself
4. Has an empty fetch handler

This means the PWA manifest (`site.webmanifest`) promises an installable app with offline capability — but the service worker actively prevents it. Any user who installs the site as a PWA gets no offline benefit and the browser will eventually report the manifest/SW mismatch.

**Fix options:**
- **Option A (recommended):** Implement a real cache-first service worker for critical assets (HTML shells, fonts, CSS, critical JS). This adds offline resilience and dramatically improves repeat-visit performance on mobile.
- **Option B (honest minimum):** Remove `<link rel="manifest">` from every page and remove `site.webmanifest` entirely, rather than advertising PWA capability you do not deliver.

---

### 1.6 CSP Contains `unsafe-inline` for Scripts

**Problem:** The Content-Security-Policy in `_headers` includes:
```
script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com
```

`'unsafe-inline'` for scripts defeats a major benefit of CSP — it allows any inline script to run, including injected XSS payloads. The site uses inline scripts (e.g., `document.documentElement.classList.add('js')`) but these can be handled with a nonce or hash instead.

**Fix:**  
Replace `'unsafe-inline'` with a nonce-based or hash-based approach. For the single inline script in `<head>`, compute its SHA-256 hash and add `'sha256-<hash>'` to the CSP. This eliminates the inline bypass.

```
# Computed hash for: document.documentElement.classList.add('js');
script-src 'self' 'sha256-YOUR_HASH_HERE' https://static.cloudflareinsights.com;
```

---

## SECTION 2 — HIGH PRIORITY IMPROVEMENTS

### 2.1 The "About" Page Has No Human Story

The About page title says "About Moldart | Since 1989" but based on the HTML reviewed, the page gives no meaningful personal narrative. The company was founded in 1989 by (presumably) Lalit Doshi — there are photos in `/images/lalit_doshi.*` and `/images/yash_doshi.*` — but no profile copy, no founder story, no "why we built this" section visible.

**B2B buyers in India who are considering a long-term sourcing relationship want to know who they are dealing with.** A photo without a story is weaker than no photo. A company that has been operating since 1989 across four product categories has earned the right to tell that story.

**Fix:**  
Add a dedicated founder/team section to `about/index.html`. Include:
- Lalit Doshi: Role, years in industry, area of expertise (lamination tooling, press surfaces)
- Yash Doshi: Role, what he manages (marketing, tech, product curation)
- 2–3 sentences per person. Direct, honest, non-promotional.
- LinkedIn links where available (already in structured data)

---

### 2.2 The Homepage Hero CTA Does Not Match Buyer Intent

Current CTAs:
- **"Share Requirement"** → `/contact/?intent=buyer-rfq`
- **"View Routes"** → `/solutions/`

The primary CTA "Share Requirement" is operationally accurate but does not map to how a buyer thinks. A buyer landing on a B2B site for the first time is not yet at "I want to share a requirement." They are at "Show me what you do and whether it fits my need."

"View Routes" is vague — routes to where? For what purpose?

**Fix:**  
Test these alternatives:
- Primary: **"Explore Products"** or **"Start a Brief"** (more natural entry point)
- Secondary: **"How It Works"** (links to `/process/`)

Additionally, the hero section is missing a trust signal above the fold. Add a single compact line: `"35+ years · Mumbai-based · India & China sourcing"` as a micro-credential row before the headline.

---

### 2.3 No `<nav>` Landmark With Correct ARIA Labels

**Problem:** The `<nav>` element uses `aria-label="Site header"` which is technically wrong — the aria-label should describe the navigation's *purpose*, not its position. Screen readers announce "Site header navigation" which is redundant with the element itself.

The mobile menu button does not have a visible text label that announces its state clearly. The hamburger icon is unlabelled for screen readers in the reviewed code.

**Fix:**
```html
<!-- Change this: -->
<nav aria-label="Site header" ...>

<!-- To this: -->
<nav aria-label="Main site navigation" ...>

<!-- And for the mobile menu button, add: -->
<button aria-label="Open navigation menu" aria-expanded="false" aria-controls="mob-menu" ...>
```

---

### 2.4 No `<footer>` Element / Site Footer Has No Landmark

The page footer — which appears to contain address, links, and copyright — is not wrapped in a `<footer>` semantic element in the reviewed HTML. This means screen reader users navigating by landmarks skip directly from the main content to the end of the document with no way to jump to footer links.

**Fix:**  
Wrap the footer section in `<footer aria-label="Site footer">...</footer>`.

---

### 2.5 Form Action Uses External Third-Party (formsubmit.co) — No Fallback

The contact and resource gate forms use `formsubmit.co` as the backend. This is functional but:
1. It is a single point of failure
2. There is no visible confirmation to the user that their data went anywhere if formsubmit is down
3. The `/contact/?submitted=true` redirect pattern only works if formsubmit correctly redirects back — if it does not, the user sees a blank formsubmit page
4. GDPR/data-residency implications of routing Indian B2B inquiries through a third-party US server

The `lead-forms.js` has a proper `submitLead()` function that POSTs to `/api/lead-intake` — but this endpoint does not appear to exist in the static site.

**Fix (short-term):**  
At minimum, add a visible error state and confirmation that shows even if the redirect fails. Add `?submitted=true` handling already exists — ensure the form action redirects reliably.

**Fix (medium-term):**  
Implement a Cloudflare Worker or Cloudflare Pages Function as `/api/lead-intake` that forwards to email + stores in a simple KV or D1 table. This removes the formsubmit.co dependency entirely and gives you control over the data flow.

---

### 2.6 No `<main>` `id="main-content"` On Inner Pages

The homepage has `<main id="main-content">` and a skip link. However, based on the HTML reviewed, the per-page files (`about/index.html`, `contact/index.html`) include the skip link but the `<main>` element's `id` attribute depends on the template being consistently set.

**Fix:**  
Audit every page HTML file and confirm `<main id="main-content">` is present. The skip link `<a href="#main-content">Skip to content</a>` is useless without the matching ID.

---

### 2.7 Image Alt Text Quality

The hero images use alt text like:
- `"Decor paper surface reference"` — acceptable but generic
- `"Furniture design reference"` — too vague
- `"Decorative steel profile reference"` — too vague

For a products-led B2B site, alt text should help buyers understand what they are looking at:
- Better: `"Printed decor paper with wood grain pattern for LPL lamination"`
- Better: `"Custom furniture component with SS profile trim detail"`

This also matters for image SEO — Google Images is a real sourcing discovery channel for industrial buyers.

---

### 2.8 `data/search-index.json` Is Not in the Repository

The command palette dynamically fetches `/data/search-index.json`. This file is in the `data/` folder (confirmed by `robots.txt` disallowing `/data/`). However, it is referenced in the `main.js` runtime and the `package.json` scripts suggest it is generated by `generate.js`. The JSON must be regenerated on every content change and committed — if it gets stale, the search palette returns zero results silently.

**Fix:**  
Add `generate.js` to the pre-build pipeline so `search-index.json` is always fresh. Add a CI check that validates the file exists and has >0 entries before deploy.

---

## SECTION 3 — MEDIUM PRIORITY IMPROVEMENTS

### 3.1 No `<meta name="author">` Tag

Missing across all pages. For a B2B brand with named leadership (Yash Doshi), this is a simple trust signal and helps Google's E-E-A-T signals.

```html
<meta name="author" content="Yash Doshi, Moldart">
```

---

### 3.2 Missing `LocalBusiness` Schema

The structured data includes `Organization`, `WebSite`, and `WebPage` schemas — but no `LocalBusiness` schema. For a Mumbai-based physical company, `LocalBusiness` with proper opening hours, geo-coordinates, and service area dramatically improves local pack / Maps visibility.

```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Organization"],
  "name": "Moldart",
  "address": { ... },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "19.1872",
    "longitude": "72.8491"
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "09:30", "closes": "18:30" }
  ],
  "priceRange": "$$",
  "areaServed": "IN"
}
```

---

### 3.3 Product Pages Missing `Product` Schema

The 16 product pages have no `Product` structured data. Google's product rich results require this schema to show price, availability, and product images in search. For a B2B site without public pricing, use `Product` with `offers.priceSpecification` set to `"Request for Quote"`.

---

### 3.4 `insight-enhancements.js` and `chatbot.js` and `technical-library.js` Are Loaded But Not Referenced in Main Nav

Three JS files exist (`insight-enhancements.js`, `chatbot.js`, `technical-library.js`) that appear to be feature modules. Without seeing all page HTML files it cannot be confirmed whether they are properly loaded or orphaned. Orphaned JS files increase attack surface and confuse future maintenance.

**Fix:**  
Audit which pages load which scripts. Remove any that are unreferenced. Consolidate into `main.js` if they are small.

---

### 3.5 `portal-app.js` Is in the Public Repo

The file `portal-app.js` is committed to the public GitHub repository. If it contains any auth logic, API keys, or endpoint configuration for the trade portal, this is a security exposure.

**Fix:**  
Review `portal-app.js` immediately. Remove any secrets. Ensure it is in `.gitignore` if it contains environment-specific config.

---

### 3.6 The `login/index.html` Page Exists But Is Not Gated Correctly

There is a `login/` directory in the public site. The `_headers` file gates `/portal/*` with `no-store` and `X-Robots-Tag: noindex` — but `/login/` is not in that exclusion list. If `login/index.html` is a public-facing entry point to the trade portal, it should be:
1. Explicitly tagged `noindex` in its own headers rule
2. Confirmed that no session data or auth tokens are stored in a way accessible from the public site

---

### 3.7 No `preload` for Critical Images Above the Fold

The hero section loads three images with `loading="eager" fetchpriority="high"` — this is correct. But there is no corresponding `<link rel="preload">` for these images in the `<head>`. For the browser's preload scanner to benefit from this, the images should be preloaded:

```html
<link rel="preload" as="image" href="/images/page5_img2.webp" fetchpriority="high">
```

---

### 3.8 Missing `dns-prefetch` for Cloudflare Analytics

The CSP allows `https://static.cloudflareinsights.com` but there is no `<link rel="dns-prefetch">` for it. Add:
```html
<link rel="dns-prefetch" href="https://static.cloudflareinsights.com">
```

---

### 3.9 WhatsApp FAB Overlaps with Scroll-to-Top Button and Mobile CTAs

The WhatsApp FAB is at `bottom: 1.5rem; right: 1.5rem`. The scroll-to-top button is at `bottom: 5rem; right: 1.5rem`. On mobile: `bottom: 1rem; right: 1rem`. The `sticky-cta` is `bottom: 1rem`.

When all three are visible simultaneously, they overlap. The FAB's pulsing animation combined with the scroll-to-top button creates visual noise at the bottom-right corner.

**Fix:**  
Establish a fixed zone hierarchy. Only show scroll-to-top when the user has scrolled significantly (already implemented at `window.scrollY > 500`). Shift the FAB up by 4rem when the sticky CTA is visible. Or remove the sticky CTA — it is the weakest of the three.

---

## SECTION 4 — CONTENT & CONVERSION IMPROVEMENTS

### 4.1 No Testimonials, Case Studies, or Named References

The site's value proposition is built on 35+ years of experience. But there is zero social proof: no testimonials, no customer logos, no case studies, no named references. For a B2B sourcing company asking buyers to share specifications and initiate RFQs, this is a trust gap.

**Pushback:** "We do not want to name clients."  
**Response:** That is fine — but anonymised case studies work equally well. *"A mid-size laminate manufacturer in Gujarat reduced press plate replacement frequency by 30% after switching to our Chrome A-grade specification."* No names needed.

**Fix:**  
Add 2–3 anonymised outcome statements to the homepage and About page. Even: *"Repeat buyers across lamination, flooring, furniture, and steel programmes since 1989."* Something that signals actual transactions, not just intentions.

---

### 4.2 The Process Page (`/process/`) Is Not Cross-Linked From the Hero

The three-step process (Inquiry → China Sourcing → Execution) is summarised on the homepage but the "How It Works" detail lives at `/process/`. The homepage operating model section has no link to this page.

**Fix:**  
Add a `<a href="/process/">See how it works →</a>` link at the end of the operating model section.

---

### 4.3 FAQ Page (`/faq/`) Is Not Prominently Linked

The FAQ page exists and is in the sitemap but it is not visible in any navigation or prominent cross-link from other pages. For a B2B buyer with pre-purchase questions (MOQ, lead time, payment terms, sample policy), the FAQ is a conversion tool — it answers the objection before the buyer has to email.

**Fix:**  
Add FAQ to the main navigation or at minimum cross-link it from the Contact page and the Process page.

---

### 4.4 No Pricing Signals Anywhere on the Site

B2B buyers understand that pricing is RFQ-driven. But having *no* pricing context creates anxiety. Industry-standard practice is to provide anchoring language like: *"Minimum order quantities and FOB pricing depend on product, quantity, and shipping route. Most initial quotes are returned within 2 business days."*

This reduces friction at the RFQ stage — buyers know what to expect before they submit.

---

### 4.5 The Insight Articles Lack an Author Byline

51 published insight guides have no visible author attribution. Google's E-E-A-T guidelines (Experience, Expertise, Authoritativeness, Trustworthiness) specifically reward content with clear authorship. Adding "Written by Yash Doshi, Moldart" + a 1-line bio to each insight boosts both SEO ranking and reader trust.

---

### 4.6 No Email Capture / Newsletter Opt-in

The site has excellent long-form content (51 guides) but no mechanism to build an email list. Every buyer who reads a guide and leaves is lost forever. A simple inline opt-in — *"Get new sourcing guides in your inbox"* — would compound the content investment over time.

This does not need a full CRM. A Cloudflare Worker writing to a Google Sheet or Airtable is sufficient for the current scale.

---

## SECTION 5 — INFRASTRUCTURE & DEPLOYMENT

### 5.1 `public-site/` vs Root-Level HTML — Two Parallel Deployments

The `wrangler.toml` sets `pages_build_output_dir = "public-site"`. However, the working `index.html` and all page files exist at the root level AND in `public-site/` as a mirror. This is confusing.

The `public-site/` directory is the actual Cloudflare Pages artifact. The root-level HTML files are the source. This is acceptable architecture — but the `_redirects` and `_headers` files must be in `public-site/` (or copied there by `build.js`) to be effective on the deployed site.

**Verify:** That `npm run build` copies `_headers`, `_redirects`, and all static assets into `public-site/` correctly.

---

### 5.2 `renovate.json` Exists But Dependencies Are Only Dev Tools

`package.json` has only three dev dependencies: `clean-css-cli`, `sharp`, `terser`. Renovate is overkill for this but harmless. Make sure Renovate auto-merge is not enabled — a botched `sharp` update that breaks the build pipeline would prevent image generation.

---

### 5.3 No Automated CI/CD Pipeline Evidence

There is no `.github/workflows/` directory visible in the repository. All quality checks (`npm run goal`, `npm run audit:site`, `npm run release:check`) are manual CLI commands. This means a deploy can happen without any of these checks passing.

**Fix:**  
Add a GitHub Actions workflow that:
1. Runs `npm run build`
2. Runs `npm run release:check`
3. On success, deploys to Cloudflare Pages via `wrangler pages deploy`

Minimum viable YAML:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - run: npm run release:check
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy public-site --project-name=moldart-home
```

---

### 5.4 The `50f4c85034239bdd8260ab2268f9cff4.txt` File

This file exists in both the root and `public-site/`. It appears to be a domain verification token (format matches Bing Webmaster Tools or similar). It is publicly accessible and committed to Git. This is fine — verification tokens are meant to be public. But document *what it is* in an `AGENTS.md` note so future maintainers do not delete it.

---

## SECTION 6 — FINAL IMPROVEMENT PRIORITISATION

### Tier 1 — Do This Week (Before Next Deploy)
1. Add visible desktop navigation links to `<nav>` across all pages
2. Create `/images/social/` OG images for all pages (home, about, contact, products, solutions, insights)
3. Remove CSS duplication from per-page `<head>` inline `<style>` blocks
4. Fix `aria-label` on `<nav>` and mobile menu button
5. Add `<footer>` landmark to all pages
6. Confirm OG images upload path and rename references correctly

### Tier 2 — Do This Sprint (Before Next Month)
7. Implement a real (or honest null) service worker — no self-destructing SW while manifest claims PWA
8. Fix CSP `unsafe-inline` with hash-based inline script
9. Align `robots.txt` AI crawler policy (pick a direction)
10. Add LocalBusiness JSON-LD to homepage
11. Add author bylines to all 51 insight articles
12. Add founder/team section to About page with actual copy
13. Add `Product` schema to all 16 product pages
14. Add `<meta name="author">` to every page

### Tier 3 — Do This Quarter
15. Move form backend from formsubmit.co to a Cloudflare Worker `/api/lead-intake`
16. Add GitHub Actions CI/CD pipeline
17. Add 2–3 anonymised case studies / outcome statements
18. Add email capture to insights section
19. Add FAQ link to Contact and Process pages
20. Add pricing/SLA anchoring language to Contact page
21. Implement cache-first service worker for offline capability
22. Preload above-fold hero images with `<link rel="preload">`

---

## FINAL SCORE: 7.1 / 10

**What earns the 7.1:**
- Zero-dependency static HTML stack with 134KB CSS is still lean for this content depth
- Excellent Cloudflare `_headers` setup (one of the best seen in an SME site)
- 51 insight articles is a genuine moat — most competitors have 0
- Command palette search is a differentiator that larger sites do not bother with
- Structured data coverage is above average
- Good image format hygiene (webp + avif served)
- Self-hosted fonts with preload — correct approach

**What holds it back from 9+:**
- No visible desktop navigation is a conversion killer. Full stop.
- Missing OG images across all pages is a silent trust/share issue
- CSS bloat from per-page inline duplication
- No social proof (testimonials, cases, references)
- About page has no human depth
- Service worker claims PWA capability it does not deliver
- CSP `unsafe-inline` undercuts an otherwise strong security posture

**A 9/10 is achievable in 6–8 weeks of focused work.** The code is solid. The content is there. The infrastructure is good. The gaps are all known and well-defined.

---

*Audit completed by Pi coding agent. Last reviewed: 2026-05-21.*
