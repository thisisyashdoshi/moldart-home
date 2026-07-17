# Visual Inventory — Repetition, Overlong Sections, Weak Visual Hierarchy

Generated from `public-site/` and route screenshots captured in `docs/review-screenshots/uiux-2026-05-23/`.

## Route density

| Route | Words | Real images | SVGs | Sections | Links | Card-like refs | Words per visual | UX complexity score |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| / | 816 | 12 | 45 | 5 | 42 | 162 | 14 | 92 |
| /explore/ | 3997 | 73 | 121 | 6 | 122 | 1128 | 21 | 0 |
| /insights/ | 3325 | 51 | 90 | 4 | 88 | 315 | 24 | 0 |
| /contact/ | 521 | 0 | 32 | 3 | 33 | 19 | 16 | 100 |
| /process/ | 333 | 0 | 18 | 4 | 26 | 13 | 19 | 100 |
| /products/ | 531 | 16 | 23 | 3 | 42 | 77 | 14 | 100 |
| /solutions/ | 729 | 6 | 25 | 3 | 53 | 54 | 24 | 100 |
| /resources/ | 744 | 0 | 50 | 4 | 49 | 161 | 15 | 82 |
| /about/ | 675 | 2 | 25 | 6 | 29 | 36 | 25 | 100 |
| /faq/ | 1165 | 0 | 50 | 5 | 34 | 20 | 23 | 83 |
| /open-wood-science/ | 461 | 0 | 15 | 5 | 28 | 9 | 29 | 100 |

## Overlong or visually weak sections

| Route | Section | Words | Images | SVGs | Card refs | Heading |
|---|---:|---:|---:|---:|---:|---|
| /insights/ | 2 | 2741 | 51 | 56 | 270 |  |
| /explore/ | 5 | 2452 | 51 | 51 | 575 | Guides |
| /faq/ | 4 | 771 | 0 | 25 | 5 |  |
| /explore/ | 4 | 622 | 0 | 24 | 271 | Documents |
| /resources/ | 3 | 434 | 0 | 30 | 150 |  |
| /solutions/ | 2 | 432 | 6 | 6 | 40 |  |
| /explore/ | 3 | 363 | 16 | 16 | 186 | Product sheets |
| /products/ | 2 | 252 | 16 | 1 | 63 | SPECIFY THE PRODUCT BEFORE ASKING FOR PRICE. |
| /explore/ | 2 | 240 | 6 | 7 | 81 | Solutions |
| / | 4 | 217 | 6 | 7 | 88 | START WITH THE APPLICATION. THEN OPEN THE ROUTE. |

## Most repeated classes / component signals

| Class | Count | Meaning |
|---|---:|---|
| icon | 450 | Utility / layout / icon |
| icon-sm | 409 | Utility / layout / icon |
| ui-meta-pill | 225 | Repeated component pattern |
| ui-footer-link | 165 | Utility / layout / icon |
| mb-3 | 160 | Utility / layout / icon |
| text-zinc-500 | 143 | Utility / layout / icon |
| leading-relaxed | 129 | Utility / layout / icon |
| ui-kicker | 126 | Repeated component pattern |
| font-display | 115 | Utility / layout / icon |
| text-sm | 106 | Utility / layout / icon |
| explore-result-row | 97 | Repeated component pattern |
| explore-result-row-media | 97 | Repeated component pattern |
| explore-card-media | 97 | Repeated component pattern |
| explore-result-row-copy | 97 | Repeated component pattern |
| explore-result-row-top | 97 | Repeated component pattern |
| explore-result-row-title | 97 | Repeated component pattern |
| explore-result-row-desc | 97 | Repeated component pattern |
| explore-result-row-meta | 97 | Repeated component pattern |
| explore-result-row-action | 97 | Repeated component pattern |
| font-bold | 75 | Utility / layout / icon |
| max-w | 67 | Utility / layout / icon |
| mx-auto | 67 | Utility / layout / icon |
| px | 67 | Utility / layout / icon |
| mb-4 | 65 | Utility / layout / icon |
| mt-5 | 63 | Utility / layout / icon |
| text-xs | 62 | Utility / layout / icon |
| text-xl | 62 | Utility / layout / icon |
| form-group | 59 | Utility / layout / icon |
| form-label | 59 | Utility / layout / icon |
| form-input | 56 | Utility / layout / icon |
| flex | 53 | Utility / layout / icon |
| resource-thumb | 51 | Utility / layout / icon |
| resource-thumb-type | 51 | Utility / layout / icon |
| resource-thumb-code | 51 | Utility / layout / icon |
| explore-card-media-guide | 51 | Repeated component pattern |
| insight-card | 51 | Repeated component pattern |
| ui-insight-card-media | 51 | Repeated component pattern |
| ui-insight-card-badge | 51 | Repeated component pattern |
| ui-insight-card-body | 51 | Repeated component pattern |
| ui-meta-inline | 51 | Repeated component pattern |
| site-nav-link | 50 | Utility / layout / icon |
| ui-insight-card | 50 | Repeated component pattern |
| insight-card-title | 50 | Repeated component pattern |
| section-label | 44 | Utility / layout / icon |
| font-black | 40 | Utility / layout / icon |
| fade-up | 35 | Utility / layout / icon |
| ui-footer-card | 33 | Repeated component pattern |
| mb-5 | 33 | Utility / layout / icon |
| border-zinc-100 | 32 | Utility / layout / icon |
| overflow-hidden | 32 | Utility / layout / icon |

## Objective UX conclusions

1. Explore is the densest and most repetitive hub; it needs progressive disclosure before visual polish.
2. Insights has strong content but too many visible article cards; it should be curated by collections.
3. Resources relies on icons and repeated cards, not document previews or task grouping.
4. Contact should become role-progressive; the current field load is too high for first contact.
5. Process is too light and should become a visual workflow page.
6. Repetition is mostly a component-system issue: `ui-meta-pill`, result rows, resource thumbs, insight cards, and footer/nav utility classes appear heavily across top pages.
