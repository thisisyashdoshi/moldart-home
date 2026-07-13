# Trade portal architecture

## 1. Current repo assessment
The repository is currently a static-site codebase. The existing portal prototype is client-rendered and lives mainly in:
- `generate.js`
- `portal-app.js`
- generated `portal/index.html`
- generated `portal/sign-in/index.html`
- generated `portal/sign-up/index.html`
- generated `portal/dashboard/index.html`
- generated `portal/catalog/index.html`
- generated `portal/rfq/index.html`
- generated `portal/approvals/index.html`
- generated `portal/orders/index.html`

That prototype is useful for UX reference only. It is **not** the security or data foundation for the real portal.

## 2. New implementation boundary
A real authenticated trade portal is introduced in `trade-portal/` as a separate Next.js App Router application.

Reason for separation:
- the current root app is a static marketing site generator
- the portal needs server rendering, auth, DB access, background jobs, uploads, and role-based authorization
- path-based deployment can later proxy `/portal/*` to the Next.js service without rewriting the entire public site now

## 3. Deployment shape
### Public marketing site
- continues to serve the marketing pages from the current static stack

### Trade portal app
- served by Next.js
- intended path space: `/portal/*`
- local runtime via Docker Compose and `trade-portal/`
- future production deployment should reverse proxy `/portal/*` traffic to the Next.js service

## 4. Core stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Auth.js for authentication
- PostgreSQL + Prisma
- MinIO (S3-compatible) for document storage
- Redis + BullMQ for async jobs
- Zod for validation
- Docker Compose for local orchestration
- Mailpit for local email testing

## 5. Security and trust boundaries
### Public routes
Only these routes are unauthenticated:
- `/portal`
- `/portal/register`
- `/portal/forgot-password`
- `/portal/reset-password`

### Authenticated routes
Everything else under `/portal/buyer/*`, `/portal/seller/*`, `/portal/admin/*` requires:
1. valid session
2. active user status
3. active company membership where applicable
4. role authorization
5. company scoping in DAL queries

### Confidentiality model
Three visibility layers are enforced:
- buyer-safe
- seller-safe
- internal ops/admin full-chain visibility

Data classes requiring visibility control:
- documents
- contacts
- comments
- quotes and commercial fields
- internal margin / reconciliation notes
- supplier-only operational data

## 6. Domain model overview
### Identity
- `User`
- `Company`
- `CompanyUser`
- `Role`
- `Permission`
- optional invites, sessions, password reset tokens, email verification tokens

### Trade catalog
- `Product`
- `ProductVariant`
- `ProductAttribute`
- `ProductDocument`

### Commercial flow
- `Rfq`
- `RfqItem`
- `Quote`
- `QuoteItem`
- `Order`
- `OrderItem`

### Execution flow
- `Payment`
- `PaymentEvent`
- `Shipment`
- `ShipmentMilestone`
- `Document`
- `DocumentAccessRule`

### Platform operations
- `Notification`
- `AuditLog`

## 7. Business defaults in v1
- source country/origin: China
- invoice currency: USD only
- default trade term: FOB
- FCA also supported
- if shipment type is containerized and incoterm is FOB, show a business warning recommending FCA review
- no card checkout in v1
- payment tracking is bank transfer / TT status, not gateway capture
- approved quote / PI / confirmed order is the commercial source of truth

## 8. Authorization model
### Buyer
Can access only buyer workspace data scoped to its company and allowed counterparties.

### Seller
Can access only seller workspace data scoped to its company and buyer-facing safe fields.

### Internal ops/admin
Can access the full operational chain, approval queues, and audit records.

## 9. Data access layer pattern
All sensitive reads and writes should go through repository / DAL helpers that:
- resolve session and company context
- verify role permission
- apply company filters
- convert records into client-safe DTOs
- log mutations into audit logs

## 10. Async jobs
BullMQ queues are used for:
- verification emails
- password reset emails
- quote PDF generation
- document post-processing
- notifications
- audit export tasks

## 11. File handling
Uploads are not stored on local disk in application code.
They go through:
1. server validation
2. MIME allow-list + file signature validation
3. size checks
4. safe server-side rename
5. MinIO bucket upload
6. metadata persistence in PostgreSQL
7. gated or signed retrieval

## 12. State machines
Explicit server-side transition guards are defined for:
- RFQ lifecycle
- Quote lifecycle
- Order lifecycle
- Payment lifecycle
- Shipment lifecycle

Invalid transitions are rejected at the service layer before DB mutation.

## 13. Phase strategy
### Phase 1
- app shell
- auth pages
- registration
- company creation
- protected route guard
- workspace shell

### Phase 2
- catalog
- product detail
- product documents
- search/filter

### Phase 3+
- RFQ, quotes, orders, payments, logistics, documents, admin, tests, infra hardening

## 14. Assumptions used now
- the existing static portal prototype is retained only as a reference and should later be retired once the Next.js app is wired into deployment
- new self-registered buyer/seller companies default to pending approval, but seed data includes approved demo accounts for development
- admin approval remains the final authority for production onboarding
- same-domain `/portal/*` production routing is expected to be handled by reverse proxy or platform routing, not by mixing Next runtime into the static generator
