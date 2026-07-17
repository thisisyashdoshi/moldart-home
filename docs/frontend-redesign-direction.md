# Frontend Redesign Direction

Reference considered: `https://skills.sh/anthropics/skills/frontend-design`.

## Chosen Direction

Moldart should not look like generic SaaS, AI-generated brochureware, or a busy catalogue portal. The correct direction is restrained industrial-editorial: sharp typography, black/white/warm-neutral palette, precise grid, strong whitespace, fewer components, and one clear commercial path.

## Design Position

| Dimension      | Decision                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Purpose        | Convert qualified B2B buyers and suppliers into RFQs, resource requests, and approved portal access. |
| Tone           | Minimal, industrial, editorial, quietly premium.                                                     |
| Differentiator | The site should feel like a disciplined sourcing desk, not a catalogue dump or generic marketplace.  |
| Motion         | Minimal page-load and hover motion only; no decorative animation clutter.                            |
| Visual system  | Few components, fewer chips, fewer dashboards, more whitespace, stronger text hierarchy.             |

## Pushback

Less is more does not mean merging every page into one. It means every page should have one job.

Keep:

- Home as the decisive entry point.
- Solutions as the route finder.
- Process as the trust explanation.
- Portal as a noindex access boundary.
- Insights as curated buyer decision support.
- Open Wood Science as a quiet science initiative, not a commercial route page.

Merge or remove duplicated messaging:

- Home should tease solutions, not repeat the full Solutions page.
- Process should own public-to-private workflow, not Portal.
- Portal should stop explaining the whole workflow and simply answer who can access it.
- Insights should link to public-safe OWS outputs only when those outputs exist.

## Page Simplification Targets

| Page              | New job                                     | What to remove/reduce                                                 |
| ----------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| Home              | One sentence promise, one visual, two CTAs. | Dense map/dashboard feel, repeated chips, too many cards above fold.  |
| Solutions         | Fast buyer route picker.                    | Heavy card metadata, repeated proof language, excessive imagery.      |
| Process           | Reassure buyers how RFQs are handled.       | 11-step operational diagram as the hero.                              |
| Portal            | Approved-company access boundary.           | Buyer/seller workflow board as primary content.                       |
| Insights          | Curated practical guides.                   | Big count cards, templated-volume signals, too many filters.          |
| Open Wood Science | Public-safe research note initiative.       | Admin/reviewer workflow emphasis in public copy.                      |
| Resources         | Find and unlock files quickly.              | Repeated metrics and download-proof cards.                            |
| Contact           | Fastest qualified RFQ path.                 | Duplicate contact methods, proof cards, long visible optional fields. |

## Execution Rules

1. One hero idea per page.
2. One primary CTA per page, with one secondary CTA only when needed.
3. No generic gradient/SaaS component style.
4. No fake proof imagery.
5. No public operational internals.
6. Every card must earn its place; delete cards that only restate page copy.
7. Use visual diagrams only when they reduce reading.
8. Keep accessibility and Lighthouse budgets active while redesigning.
