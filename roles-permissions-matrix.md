# Roles and permissions matrix

## Roles
- Buyer User
- Buyer Admin
- Seller User
- Seller Admin
- Internal Ops
- Internal Admin

## Permission groups
| Permission | Buyer User | Buyer Admin | Seller User | Seller Admin | Internal Ops | Internal Admin |
|---|---|---:|---|---:|---:|---:|
| auth.login | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| company.view_own | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| company.manage_own_users |  | ✓ |  | ✓ | ✓ | ✓ |
| company.approve |  |  |  |  | ✓ | ✓ |
| product.view_published | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| product.create_own |  |  |  | ✓ | ✓ | ✓ |
| product.update_own |  |  |  | ✓ | ✓ | ✓ |
| product.publish |  |  |  |  | ✓ | ✓ |
| catalog.manage_master |  |  |  |  | ✓ | ✓ |
| rfq.create | ✓ | ✓ |  |  | ✓ | ✓ |
| rfq.view_own_company | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| rfq.respond |  |  | ✓ | ✓ | ✓ | ✓ |
| rfq.override_status |  |  |  |  | ✓ | ✓ |
| quote.create |  |  | ✓ | ✓ | ✓ | ✓ |
| quote.revise |  |  | ✓ | ✓ | ✓ | ✓ |
| quote.accept_reject | ✓ | ✓ |  |  | ✓ | ✓ |
| quote.override |  |  |  |  | ✓ | ✓ |
| order.view_own_company | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| order.create_from_quote |  |  |  |  | ✓ | ✓ |
| order.status_update |  |  | ✓ | ✓ | ✓ | ✓ |
| order.correct |  |  |  |  | ✓ | ✓ |
| payment.view_own_company | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| payment.update_status |  |  |  | ✓ | ✓ | ✓ |
| payment.reconcile |  |  |  |  | ✓ | ✓ |
| shipment.view_own_company | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| shipment.update |  |  | ✓ | ✓ | ✓ | ✓ |
| shipment.correct |  |  |  |  | ✓ | ✓ |
| document.view_scoped | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| document.upload | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| document.review |  |  |  |  | ✓ | ✓ |
| audit.view |  |  |  |  | ✓ | ✓ |
| settings.manage_global |  |  |  |  |  | ✓ |

## Visibility rules
### Buyers can see
- published products
- their own RFQs
- quotes issued to their company
- approved orders tied to their company
- buyer-visible payments
- buyer-visible logistics milestones
- buyer-visible documents

### Buyers cannot see by default
- seller-private operational notes
- internal margin notes
- internal reconciliation notes
- hidden supplier contacts
- ops-only documents

### Sellers can see
- their own products and product drafts
- incoming RFQs assigned to them or visible to their company
- quotes they create
- confirmed orders they fulfill
- seller-visible logistics milestones
- seller-visible documents

### Sellers cannot see by default
- buyer-internal review notes
- internal counterparty strategy notes
- ops-only commercial fields
- hidden buyer contacts
- internal override logs unless explicitly exposed

### Internal ops/admin can see
- full chain records
- all statuses and overrides
- all document visibility classes subject to permission
- audit logs
- reconciliation records
