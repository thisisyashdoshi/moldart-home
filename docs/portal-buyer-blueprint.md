# Moldart buyer portal blueprint

Internal only. Not for live release.

## 1) Core decision
Build the portal **buyer-first**, not seller-first.

Reason:
- the buyer record is the primary commercial object
- RFQ, quantity, quality, target timing, destination, and approval history start from the buyer side
- seller actions should attach to that controlled record, not create parallel uncontrolled threads

For Moldart's model, this should behave like a **disciplined B2B buying desk**, not a retail checkout and not a public marketplace.

## 2) Business assumptions this portal should optimize for
- international B2B import/export
- repeated procurement programmes, not one-off retail carts
- FOB China port as the main commercial basis in many cases
- USD invoicing / comparison as the default commercial language
- document-heavy approvals before order release
- technical sheets, design references, and shipment documents are part of the product, not just attachments
- repeat orders should start from approved history, not from email memory

## 3) What V1 should do
### Buyer portal V1
1. Product, design, and technical-sheet discovery
2. RFQ basket creation
3. Quantity / destination / delivery-window capture
4. Quote comparison in USD
5. FOB basis comparison
6. MOQ / lead time comparison
7. Sample / drawing / technical approval timeline
8. Proforma / payment-term visibility
9. Shipment milestone tracking
10. Document pack access
11. Repeat-order creation from approved baseline
12. Audit history of who approved what and when

### Seller layer V1.5 or V2
1. Structured quote response
2. Document upload against buyer RFQ
3. Production status updates
4. Shipment-document upload
5. Delta requests against approved baseline

## 4) What V1 should NOT try to do
- public open signup
- retail-style checkout
- instant uncontrolled seller marketplace onboarding
- automatic commercial release without approval
- fully autonomous payment release
- fully autonomous quality-deviation approval
- chat-first workflows replacing the structured record

## 5) Required data objects
### Commercial objects
- Buyer organisation
- Buyer user
- Seller organisation
- Seller user
- RFQ
- RFQ line item
- Quote
- Quote line item
- Price revision
- Incoterm / FOB basis
- Currency record
- Proforma invoice
- Commercial approval
- Purchase order
- Repeat order

### Technical / approval objects
- Product record
- Design / finish record
- Technical sheet
- Sample request
- Sample approval
- Drawing / artwork file
- Approval comment
- Deviation request
- Approved baseline snapshot

### Execution / logistics objects
- Production milestone
- Inspection record
- Packing list
- BL / AWB
- COO / compliance document
- Shipment milestone
- ETA / ETD record
- Delivery confirmation

## 6) Recommended architecture
## Separate the portal from the marketing site
Do **not** build the real portal inside the current static marketing generator.

Recommended split:
- `moldartindia.com` = public marketing site
- `portal.moldartindia.com` or `app.moldartindia.com` = authenticated transactional portal

Why:
- auth
- permissions
- audit logs
- large documents
- role-based workflows
- background jobs
- database-backed state

These do not belong in the static-site layer.

## 7) Recommended stack
### App shell
- **Next.js**
- reason: mature app-routing, auth integration, dashboard workflows, API routes, strong ecosystem

### Auth / orgs / roles
- **Clerk**
- use for:
  - buyer organisations
  - invited users
  - seller accounts
  - role-based access
  - MFA
  - session management
- reason: B2B org model is stronger than rolling this manually on day one

### Database
- **Postgres**
- use via:
  - Supabase Postgres, or
  - Neon + Prisma / Drizzle
- reason: RFQs, quotes, approvals, files, payments, milestones, and repeat history are relational

### File storage
- **Cloudflare R2**
- use for:
  - technical sheets
  - drawings
  - sample photos
  - inspection files
  - BL / packing list / invoice docs
- reason: large-file handling and signed access are better than static-site storage

### Transactional email
- **Postmark**
- use for:
  - RFQ received
  - quote submitted
  - approval requested
  - approval completed
  - PI released
  - shipment docs uploaded
- reason: reliable operational email matters more than marketing email features

### Background jobs
- **Trigger.dev**
- use for:
  - reminders
  - milestone transitions
  - delayed follow-ups
  - document-expiry alerts
  - status digest jobs

### External connector automation
- **n8n** later, not first
- use only when needed for:
  - ERP handoff
  - CRM sync
  - freight-forwarder connectors
  - inbox/document parsing
- reason: useful, but should not become the first source of truth

### Search
- Start with **Postgres full-text + structured filters**
- move to **Typesense** only if catalog scale or typo-tolerance demands it

### Chatbot / assistant
- Do **not** add a generic public chatbot first
- Build a **logged-in RAG assistant** later that can answer from:
  - approved technical sheets
  - quote data
  - approval history
  - shipment status
- use pgvector or equivalent retrieval
- hard-limit it so it cannot invent prices, promises, or approvals

### Monitoring
- **Sentry** for application/runtime issues
- **Better Stack** or equivalent for uptime and logs

### Analytics
- **PostHog** or Cloudflare Web Analytics
- keep it lightweight and operational, not cluttered

## 8) Payment recommendation
Pushback: do **not** design this as a standard ecommerce payment flow.

For this business, V1 should center on:
- proforma invoice
- payment-term visibility
- TT / bank-transfer tracking
- milestone status
- manual confirmation
- audit log

Only consider Stripe or similar later for:
- sample charges
- small deposits
- exceptional lightweight cases

Main programme orders should remain invoice-led and approval-led.

## 9) Automation boundaries
The portal can automate:
- reminders
- routing
- quote-compare formatting
- document collection
- milestone progression
- digest emails
- repeat-order drafting

The portal should NOT fully automate:
- seller onboarding
- bank/compliance validation
- first commercial release
- deviation approval
- shipment-document final validation
- payment release

## 10) Suggested build order
### Phase 0 — internal concept
- workflow map
- role map
- data model
- screen blueprint
- integration choices

### Phase 1 — buyer MVP
- login
- org / user roles
- product/design library
- RFQ basket
- quote compare
- approval room
- order timeline
- shipment document room
- repeat-order baseline

### Phase 2 — seller lane
- seller invitation
- quote submission
- document upload
- milestone updates
- delta requests

### Phase 3 — automation and assistant
- email triggers
- job orchestration
- document reminder logic
- buyer-side retrieval assistant

## 11) Immediate next step
Before any live work:
1. lock the data model
2. lock the auth model
3. lock the buyer workflow
4. prototype buyer dashboard locally
5. review internally
6. only then decide what becomes public preview vs authenticated portal
