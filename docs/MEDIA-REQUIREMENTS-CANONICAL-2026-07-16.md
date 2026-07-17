# Moldart Website — Canonical Media Requirements

Date: 16 July 2026

Scope: media inputs still required after the non-media website, route, copy, RFQ, privacy, schema, search and release controls are complete.

Status: controlling media brief for the next noindex candidate; not a rights or technical approval record.

## Decision

Do not create 82 unrelated images or 20 synthetic videos. The minimum credible production set is:

- **17 product hero photographs** — one truthful primary image per active product route.
- **8 solution/process diagrams** — deterministic diagrams assembled from verified product relationships.
- **3 homepage system images** — selected from the approved product heroes; no extra shoot required.
- **6 evidence/process photographs** — real sample, inspection, packing and traceability activity.
- **8 short technical videos** — real source footage; optional until authentic footage exists.
- **51 Insight covers** — keep current labelled editorial covers for the noindex draft; replace progressively, not as a launch blocker.

Minimum new capture requirement: **23 photographs (17 product + 6 evidence/process)**. Homepage, Products, Solutions and Explore reuse derivatives of those approved masters.

## Universal production rules

1. Real Moldart-controlled or rights-cleared supplier media is preferred. AI may clean exposure/background only; it must not alter product geometry, construction, finish, layers, labels, measurements or factory context.
2. Preserve an untouched source master, source owner, capture date, location, product identity, rights reference and SHA-256.
3. Remove confidential labels, buyer/supplier names, serials, prices, drawings and documents before model upload or publication.
4. Photograph a neutral scale/reference only when technically appropriate; never generate a measurement reading.
5. Deliver one master plus AVIF/WebP/JPEG derivatives. Product hero target: landscape 4:3 or 3:2, at least 2400 px wide. Social crop: 1200×630. Card crop: 4:3. Mobile-safe focal area: central 70%.
6. Product pages require accurate captions. Images must not imply current quantity, guaranteed grade, certification, factory ownership, project completion or approved sample status.
7. No autoplay. Video requires captions/transcript, poster, duration, source/rights record and click-to-load treatment.

## Product image requirements

| Priority | Route | Required primary image | Required supporting detail | Placement |
|---|---|---|---|---|
| P0 | `/products/press-plates/` | One real plate showing the working surface and full plate boundary | Finish/texture macro with directional light | Home wood-system tile; Products card; product hero; lamination solution |
| P0 | `/products/press-pads/` | One real pad laid flat with edges and construction visible | Weave/surface macro without invented cross-section | Products card; product hero; lamination solution |
| P0 | `/products/printed-decor-paper/` | Real roll or sheets with a controlled colour/design reference | Print/repeat detail; no supplier code if confidential | Products card; product hero; decorative-surfaces/furniture/flooring solutions |
| P0 | `/products/melamine-impregnated-technical-papers/` | Real identified décor/overlay/underlay/backing sample set | Edge/handling detail showing format, not invented resin layers | Products card; product hero; lamination/flooring solutions |
| P0 | `/products/decorative-films-foils/` | Real labelled PP/PVC/PET/PETG sample family, only variants actually available | Surface/finish and roll-format detail | Products card; product hero; decorative-surfaces/furniture solutions |
| P1 | `/products/genuine-vegetable-parchment/` | Real technical parchment roll/sheet used for the stated industrial route | Flexibility/format detail; no food-use visual | Products card; product hero; lamination solution |
| P0 | `/products/fiberboard/` | Real MDF/HDF board stack with face and edge visible | Machined edge/surface-readiness detail | Products card; product hero; furniture/flooring/architecture solutions |
| P0 | `/products/particleboard/` | Real particleboard stack with face and core edge visible | Machining/laminated-face detail if actually offered | Products card; product hero; furniture solution |
| P1 | `/products/osb/` | Real OSB/F-OSB panel showing strand orientation and edge | Surface/edge detail | Products card; product hero; furniture/architecture/formwork solutions |
| P0 | `/products/plywood/` | Real plywood stack showing face and ply edge | Formwork/interior variant detail, clearly distinguished | Products card; product hero; furniture/architecture/formwork solutions |
| P0 | `/products/hpl-compact-laminated-boards/` | Real HPL sheet, compact laminate and faced board shown as distinct constructions | Edge/construction detail for each actual route | Products card; product hero; furniture/decorative-surfaces/architecture solutions |
| P0 | `/products/wood-flooring/` | Real laminate planks/carton showing surface and locking edge | Joint profile and coordinated accessory detail | Products card; product hero; flooring solution |
| P0 | `/products/decorative-ss-panels/` | Real decorative stainless sheet with full finish direction visible | Finish macro under controlled reflections | Home steel tile; Products card; product hero; architecture/metal solutions |
| P0 | `/products/ss-profiles/` | Real T/U/L/profile assortment with section geometry visible | Finish-match/junction detail | Products card; product hero; architecture/metal solutions |
| P0 | `/products/industrial-press-plates/` | Real precision plate/tooling on a clean inspection surface | Edge, hole/burr or metrology setup—no generated readings | Home electronics tile; Products card; product hero; electronics solution |
| P0 | `/products/electronics-press-pads/` | Real electronics cushion material with full sheet boundary | Surface/edge construction macro | Products card; product hero; electronics solution |
| P0 | `/products/electronics-lamination-films/` | Real release/conformal/carrier films separated and identified by function | Roll/sheet handling detail; do not visually conflate functions | Products card; product hero; electronics solution |

## Homepage and discovery reuse

No additional hero shoot is necessary. Select these approved masters:

1. **Wood-panel system:** press plate with press-pad or décor-paper supporting crop.
2. **Decorative stainless system:** decorative sheet with profile supporting crop.
3. **Electronics system:** precision press plate/tooling with film or pad supporting crop.

Use the same masters for `/products/`, `/explore/`, search results and solution cards. Derivatives must preserve consistent crop, caption and source ID.

## Evidence and process photographs

| ID | Required real photograph | Placement | What it must prove | Must not imply |
|---|---|---|---|---|
| E01 | RFQ/specification review desk with confidential fields removed | Home process band; `/process/` | Requirements are recorded before comparison | Named buyer/supplier relationship |
| E02 | Physical sample/master comparison under controlled light | `/evidence-qc/`; relevant solutions | Sample-based visual approval | Universal colour tolerance or certification |
| E03 | Dimension/flatness/finish inspection setup | `/evidence-qc/`; tooling products | Inspection method exists | Passing result unless the displayed record is approved |
| E04 | Label/lot/document reconciliation with redacted identifiers | `/evidence-qc/`; `/process/` | Traceability workflow | Public supplier identity or confidential lot data |
| E05 | Protected packing/crating appropriate to a real product | `/process/`; product packing sections | Packing method and receiving attention | Guaranteed damage-free delivery |
| E06 | Receiving inspection/hold-tag workflow with redacted data | `/evidence-qc/`; `/process/` | Nonconforming material can be held | A specific shipment passed or failed |

## Deterministic solution diagrams

Create diagrams from verified route data—no photoreal generation needed.

| Route | Diagram |
|---|---|
| `/solutions/lamination/` | Plate → pad → paper/film → substrate → press/trial → approved surface |
| `/solutions/furniture/` | Drawing/BOM → board/core → surface/edge → sample → packing/reorder |
| `/solutions/flooring/` | Construction → core/joint → site readiness → accessories → installation/receiving |
| `/solutions/decorative-surfaces/` | Choose HPL/LPL/paper/film → match substrate/process → approve colour/texture/edge |
| `/solutions/formwork-shuttering/` | Duty → panel construction → trial cast → clean/repair/hold → accepted-use log |
| `/solutions/architecture/` | Environment/grade → finish master → drawings/joints → fabrication → protected receiving |
| `/solutions/metal-finishing/` | Base grade → finish family → physical master → fabrication/cleaning control |
| `/solutions/pcb-ccl/` | Product stack → exact plate/pad/film function → process/metrology → trial → incoming inspection |

## Video requirements

Videos are useful but not required for the next noindex visual candidate. Capture only real, controlled footage. A phone on a tripod with good light is preferable to synthetic motion.

| Priority | Video | Length | Placement | Required shots |
|---|---|---:|---|---|
| V1 P0 | Press plate finish and inspection | 20–40 s | Press-plate product; lamination solution | Full plate, raking-light finish, edge, genuine inspection setup |
| V2 P0 | Press pad construction and handling | 20–40 s | Press-pad product; lamination solution | Full pad, surface macro, edge, controlled flex/handling |
| V3 P1 | Décor/impregnated paper approval | 30–60 s | Paper products; decorative-surfaces solution | Roll/sheet, master comparison, batch/colour review |
| V4 P1 | Boards and laminate construction comparison | 30–60 s | MDF/PB/plywood/HPL routes; furniture solution | Clearly labelled real edges/faces; no invented performance comparison |
| V5 P1 | Laminate-flooring joint and site-readiness check | 30–60 s | Flooring product and solution | Joint engagement, substrate/site checklist, accessory junction |
| V6 P0 | Decorative stainless finish approval | 30–60 s | Stainless sheet/profile products; architecture/metal solutions | Finish under controlled light, direction, profile match, protective film |
| V7 P0 | Precision tooling inspection | 30–60 s | Industrial press plates; electronics solution | Plate handling, actual metrology setup, edge/hole cleanliness; redact readings if unapproved |
| V8 P1 | RFQ-to-receiving controlled workflow | 45–75 s | Home; Process; Evidence & QC | Brief, sample, inspection, packing and receiving as separate truthful steps |

Video rules:

- 16:9 master, 1080p minimum, 24/25/30 fps, stable exposure and white balance.
- No synthetic factory, worker, machine, certificate, reading, product movement or material behaviour.
- No background music required. Capture clean ambient sound or publish muted with captions.
- Use one strong poster image from real footage. Do not load a YouTube/Vimeo iframe before user action.
- Existing 40 YouTube records may remain where directly mapped, but they do not replace owned product evidence.

## Insight-cover policy

- The noindex candidate now uses 51 first-party deterministic SVG diagrams generated from the locked article titles and categories.
- Previous editorial/render covers are excluded from the public artifact while their rights and provenance remain unresolved.
- Replace deterministic diagrams progressively, in publication/revenue priority order, only with rights-cleared media.
- Preferred replacements: real product detail, real inspection setup, deterministic comparison diagram or document/checklist crop with confidential data removed.

## Approval packet required per asset

- Asset ID and route(s)
- Untouched source path and SHA-256
- Product identity and capture description
- Source owner and rights/permission reference
- Confidentiality/redaction result
- Technical reviewer and decision
- Allowed implication and prohibited implication
- Caption and alt text
- Derivative filenames and hashes
- Decision: `APPROVED_REAL`, `APPROVED_EDITED_REAL`, `APPROVED_DIAGRAM`, `REVISE`, `REJECT`, or `SOURCE_REQUIRED`

## Completion gate

The noindex media-rich draft may ship when every active product has a truthful approved/review-labelled image or deterministic diagram and all rendered assets have source IDs, captions, dimensions, responsive derivatives and no broken links.

Production remains blocked until the 17 product heroes, six evidence/process photographs, reused homepage crops and any published video have explicit rights, confidentiality and technical decisions. Synthetic media cannot substitute for those approvals.
