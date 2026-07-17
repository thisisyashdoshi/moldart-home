# Local Open-Source Toolchain

This site should first rely on local, free, open-source, unlimited-use checks. Paid SaaS, free-tier SaaS, and external API checks are deferred unless explicitly approved and configured through provider environment variables.

## Installed Tools

| Tool          | Use                                         | License family |
| ------------- | ------------------------------------------- | -------------- |
| ESLint        | JavaScript/function linting                 | MIT            |
| Prettier      | Formatting checks                           | MIT            |
| Stylelint     | CSS quality checks                          | MIT            |
| html-validate | Generated HTML validation                   | MIT            |
| Vitest        | Unit tests for shared logic                 | MIT            |
| Secretlint    | Additional secret-pattern scanning          | MIT            |
| Linkinator    | Local broken-link crawling                  | MIT            |
| Lighthouse    | Local performance/accessibility/SEO budgets | Apache-2.0     |
| Knip          | Unused-file/dependency analysis             | ISC            |
| jscpd         | Duplicate-code/content detection            | MIT            |
| SVGO          | SVG optimization                            | MIT            |

Native tools such as Gitleaks and Lychee were not installed because this Windows environment currently has no Go or Cargo toolchain. Secretlint and Linkinator cover the same local check categories until native tooling is approved/available.

## Recommended Local Commands

| Command                    | Purpose                                                           |
| -------------------------- | ----------------------------------------------------------------- |
| `npm run oss:versions`     | Verify installed OSS tool versions.                               |
| `npm run lint:js`          | Check JavaScript and function files.                              |
| `npm run lint:css`         | Check the main CSS files.                                         |
| `npm run lint:html`        | Check key generated HTML pages.                                   |
| `npm run secretlint:check` | Run Secretlint against source/config/docs.                        |
| `npm run license:check`    | Report dependency license families and block proprietary markers. |
| `npm run test:unit`        | Run Vitest unit tests.                                            |
| `npm run links:check`      | Crawl local preview links, skipping external URLs and PDFs.       |
| `npm run lighthouse:check` | Run local Lighthouse budgets against the preview.                 |
| `npm run check:quick`      | Fast local quality gate.                                          |
| `npm run check:full`       | Broader local gate before release work.                           |

## Why This Order

1. Keep everything local and reproducible before adding external services.
2. Catch source mistakes before generated-page or deployment checks.
3. Keep heavy browser and crawl checks separate so this OneDrive Windows workspace stays usable during edits.
4. Use production integrations only after the website structure and lead path are clean.
