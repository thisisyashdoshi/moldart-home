# Moldart portal: free-first stack recommendation

Internal only. Not for live release.

## 1) Hard pushback first
"Completely free and unlimited" is only realistic in **software licensing** terms.

It is **not** realistic in all of these at once:
- zero licence cost
- zero infrastructure cost
- zero deliverability problems
- zero maintenance work
- zero scaling limits

So the correct target is:
- **free / open / self-hosted software first**
- **paid SaaS only when the self-hosted path creates more operational risk than value**

## 2) What should stay free-first
### App
- Next.js or another self-hosted app shell
- status: free / open ecosystem

### Database
- PostgreSQL
- status: free / open source
- role: RFQs, quotes, approvals, orders, repeat history, audit trail

### Auth
Primary recommendation:
- **authentik**
- reason: self-hosted, modern, simpler than heavier enterprise IAM for many cases

Secondary option:
- **Keycloak**
- use only if federation / enterprise IAM needs become heavier

## 3) File storage
Primary recommendation:
- **MinIO**
- status: free self-hosted software
- role: technical sheets, drawings, inspection files, invoices, shipment docs

## 4) Search
Start with:
- **Postgres structured filters + full-text search**

Only add later if genuinely needed:
- **Meilisearch**
- reason: simpler than overbuilding search on day one

## 5) Workflow automation
If the preference is truly free/open-first:
- **Activepieces Community Edition** first

If connector breadth matters more than licensing purity:
- **n8n self-hosted** second

Pushback:
- n8n is strong, but it is not the cleanest choice if the requirement is strictly open-source-first
- Activepieces CE is cleaner on that front, but feature fit should still be tested against real workflows

## 6) Email
### For development / testing
- **Mailpit**
- use for local capture of approval emails, RFQ notifications, etc.

### For production sending
Possible self-hosted options:
- **Postal**
- **Maddy**

Hard pushback:
- production email is where “free and unlimited” becomes misleading
- self-hosting mail is possible, but deliverability, DNS reputation, spam handling, and maintenance become your responsibility
- if deliverability becomes business-critical, this is the first category where a paid provider may become the rational exception

## 7) Notifications
For internal operational alerts:
- **ntfy**
- **Gotify**

Use cases:
- approval blockers
- delay alerts
- missing document alerts
- follow-up reminders

## 8) AI / chatbot / assistant
Primary recommendation:
- **Ollama** for local model serving
- **pgvector** for retrieval over approved files and order data

Pushback:
- the portal should not depend on an LLM for correctness
- deterministic workflow automation should come first
- the assistant should only explain, retrieve, summarize, and point to approved records
- it should not invent pricing, approvals, or shipment promises

Optional internal-only UI:
- **Open WebUI** for internal model testing, not as the buyer-facing portal UI

## 9) Knowledge base / SOP layer
Optional but useful:
- **Outline**
- role: internal SOPs, approval rules, operating playbooks, seller onboarding docs

## 10) Recommended free-first stack for the first serious prototype
### Best practical version
- App: Next.js
- Auth: authentik
- Database: PostgreSQL
- Storage: MinIO
- Workflow automation: Activepieces CE
- Search: Postgres filters first
- Email dev: Mailpit
- Email prod: Postal or Maddy only if team accepts deliverability ownership
- Notifications: ntfy
- AI assistant: Ollama + pgvector

## 11) What not to build first
- public signup
- retail checkout
- public chat-first portal
- multi-seller open marketplace
- automatic financial release
- uncontrolled email-driven approvals

## 12) Immediate next step
1. lock the buyer data model
2. lock the auth / role model
3. convert the local static portal prototype into a local app skeleton
4. wire fake data first
5. only then test authentik, MinIO, Postgres, and Activepieces locally
