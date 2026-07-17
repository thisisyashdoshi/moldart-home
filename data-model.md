# Data model

## Core identity
### companies
- id
- slug
- name
- company_type (`BUYER`, `SELLER`, `INTERNAL`)
- status (`PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED`)
- country_code
- primary_currency (`USD` in v1)
- created_at
- updated_at

### users
- id
- email
- password_hash
- first_name
- last_name
- status (`PENDING`, `ACTIVE`, `LOCKED`, `DISABLED`)
- email_verified_at
- last_login_at
- created_at
- updated_at

### company_users
- id
- company_id
- user_id
- role_id
- title
- is_primary_contact
- invited_by_user_id
- approved_at
- created_at
- updated_at

### roles
- id
- key
- label

### permissions
- id
- key
- label

### role_permissions
- role_id
- permission_id

## Catalog
### products
- id
- slug
- seller_company_id
- title
- category
- description
- origin_country (`CN` in v1)
- currency (`USD` in v1)
- indicative_incoterm (`FOB`, `FCA`)
- indicative_price_usd
- moq
- lead_time_days
- sample_available
- is_quote_only
- status (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- created_at
- updated_at

### product_variants
- id
- product_id
- sku
- finish
- size
- grade
- specification_json
- created_at
- updated_at

### product_documents
- id
- product_id
- document_id

## RFQ
### rfqs
- id
- public_id
- buyer_company_id
- assigned_seller_company_id nullable
- created_by_user_id
- destination_country
- destination_port
- target_shipment_month
- incoterm (`FOB`, `FCA`)
- currency (`USD`)
- shipment_type (`LCL`, `FCL`, `AIR`, `OTHER`)
- source_country (`CN`)
- notes
- status (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `QUOTED`, `REVISED`, `APPROVED`, `CLOSED`, `CANCELLED`)
- created_at
- updated_at

### rfq_items
- id
- rfq_id
- product_id nullable
- variant_id nullable
- item_name_snapshot
- specification_snapshot_json
- quantity
- uom
- note

### rfq_attachments
- id
- rfq_id
- document_id

## Quotes
### quotes
- id
- public_id
- rfq_id
- seller_company_id
- created_by_user_id
- revision_no
- currency (`USD`)
- incoterm (`FOB`, `FCA`)
- fob_port
- validity_date
- lead_time_days
- moq_note
- subtotal_usd
- status (`DRAFT`, `ISSUED`, `REVISED`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `SUPERSEDED`, `CANCELLED`)
- pdf_document_id nullable
- created_at
- updated_at

### quote_items
- id
- quote_id
- rfq_item_id nullable
- product_id nullable
- line_label
- quantity
- unit_price_usd
- total_price_usd
- lead_time_days nullable
- moq nullable
- note nullable

## Orders
### orders
- id
- public_id
- quote_id
- buyer_company_id
- seller_company_id
- created_by_user_id
- currency (`USD`)
- incoterm (`FOB`, `FCA`)
- shipment_type
- source_country (`CN`)
- order_total_usd
- status (`DRAFT`, `AWAITING_PI`, `PI_ISSUED`, `DEPOSIT_PENDING`, `DEPOSIT_RECEIVED`, `PRODUCTION`, `QC_READY`, `BALANCE_PENDING`, `BALANCE_RECEIVED`, `BOOKED`, `ON_BOARD`, `IN_TRANSIT`, `DOCS_SENT`, `DELIVERED`, `CLOSED`, `CANCELLED`)
- commercial_snapshot_json
- created_at
- updated_at

### order_items
- id
- order_id
- product_id nullable
- line_label
- quantity
- uom
- unit_price_usd
- total_price_usd
- specification_snapshot_json

### order_status_history
- id
- order_id
- from_status
- to_status
- changed_by_user_id
- changed_at
- note

## Payments
### payments
- id
- order_id
- payment_type (`DEPOSIT`, `BALANCE`, `OTHER`)
- due_date
- percentage
- amount_usd
- status (`PENDING`, `DUE`, `REPORTED`, `UNDER_REVIEW`, `RECONCILED`, `FAILED`, `WAIVED`)
- created_at
- updated_at

### payment_events
- id
- payment_id
- event_type (`STATUS_CHANGE`, `REMITTANCE_REPORTED`, `RECEIPT_UPLOADED`, `RECONCILED`, `COMMENTED`)
- actor_user_id
- note
- remittance_reference nullable
- document_id nullable
- created_at

## Logistics
### shipments
- id
- order_id
- incoterm (`FOB`, `FCA`)
- origin_country (`CN`)
- fob_port nullable
- etd nullable
- eta nullable
- vessel nullable
- voyage nullable
- container_no nullable
- bl_no nullable
- freight_forwarder nullable
- status (`PLANNING`, `BOOKED`, `ON_BOARD`, `IN_TRANSIT`, `ARRIVED`, `CUSTOMS`, `DELIVERED`, `CLOSED`, `CANCELLED`)
- created_at
- updated_at

### shipment_milestones
- id
- shipment_id
- code
- label
- occurred_at nullable
- status (`PENDING`, `DONE`, `EXCEPTION`)
- buyer_visible boolean
- seller_visible boolean
- ops_only boolean
- note nullable
- created_by_user_id
- created_at

## Documents
### documents
- id
- public_id
- owner_company_id nullable
- storage_bucket
- storage_key
- original_filename
- stored_filename
- mime_type
- size_bytes
- checksum_sha256
- document_type (`TECH_SHEET`, `RFQ_ATTACHMENT`, `QUOTE_PDF`, `PI`, `COMMERCIAL_INVOICE`, `PACKING_LIST`, `QC_REPORT`, `COO`, `BL_AWB`, `PAYMENT_RECEIPT`, `OTHER`)
- status (`PENDING_SCAN`, `READY`, `REJECTED`, `ARCHIVED`)
- uploaded_by_user_id
- created_at
- updated_at

### document_access_rules
- id
- document_id
- visibility (`BUYER_VISIBLE`, `SELLER_VISIBLE`, `OPS_ONLY`, `FINANCE_ONLY`)
- buyer_company_id nullable
- seller_company_id nullable

## Platform operations
### audit_logs
- id
- actor_user_id nullable
- company_id nullable
- entity_type
- entity_id
- action
- before_json nullable
- after_json nullable
- ip_address nullable
- user_agent nullable
- created_at

### notifications
- id
- user_id
- company_id
- type
- title
- body
- link nullable
- read_at nullable
- created_at

## Supporting auth tables
- sessions
- verification_tokens
- password_reset_tokens
- company_invites
