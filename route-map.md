# Trade portal route map

## Public
- `/portal` — sign in
- `/portal/register` — buyer/seller registration
- `/portal/forgot-password` — reset request
- `/portal/reset-password` — reset completion

## Buyer
- `/portal/buyer/dashboard`
- `/portal/buyer/products`
- `/portal/buyer/products/[slug]`
- `/portal/buyer/rfqs`
- `/portal/buyer/rfqs/new`
- `/portal/buyer/rfqs/[id]`
- `/portal/buyer/quotes`
- `/portal/buyer/quotes/[id]`
- `/portal/buyer/orders`
- `/portal/buyer/orders/[id]`
- `/portal/buyer/payments`
- `/portal/buyer/logistics`
- `/portal/buyer/documents`
- `/portal/buyer/company`
- `/portal/buyer/settings`

## Seller
- `/portal/seller/dashboard`
- `/portal/seller/products`
- `/portal/seller/products/new`
- `/portal/seller/inquiries`
- `/portal/seller/inquiries/[id]`
- `/portal/seller/quotes`
- `/portal/seller/quotes/[id]`
- `/portal/seller/orders`
- `/portal/seller/orders/[id]`
- `/portal/seller/payments`
- `/portal/seller/logistics`
- `/portal/seller/documents`
- `/portal/seller/company`
- `/portal/seller/settings`

## Admin / internal ops
- `/portal/admin/dashboard`
- `/portal/admin/companies`
- `/portal/admin/users`
- `/portal/admin/catalog`
- `/portal/admin/rfqs`
- `/portal/admin/quotes`
- `/portal/admin/orders`
- `/portal/admin/payments`
- `/portal/admin/logistics`
- `/portal/admin/documents`
- `/portal/admin/audit`
- `/portal/admin/settings`

## Authorization rule
Every route above must be protected by:
- middleware session check
- role-based route allow-list
- server-side role assertion inside the page / DAL
- company scoping where applicable

## Navigation policy
### Public navigation
Only public auth routes are linked before login.

### Buyer sidebar
- Dashboard
- Products
- RFQs
- Quotes
- Orders
- Payments
- Logistics
- Documents
- Company
- Settings

### Seller sidebar
- Dashboard
- Products
- Inquiries
- Quotes
- Orders
- Payments
- Logistics
- Documents
- Company
- Settings

### Admin sidebar
- Dashboard
- Companies
- Users
- Catalog
- RFQs
- Quotes
- Orders
- Payments
- Logistics
- Documents
- Audit
- Settings
