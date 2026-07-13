export type WorkspaceScope = 'buyer' | 'seller' | 'admin';
export type PortalRoleKey =
  | 'BUYER_USER'
  | 'BUYER_ADMIN'
  | 'SELLER_USER'
  | 'SELLER_ADMIN'
  | 'INTERNAL_OPS'
  | 'INTERNAL_ADMIN';

export const PUBLIC_PORTAL_ROUTES = [
  '/portal',
  '/portal/register',
  '/portal/forgot-password',
  '/portal/reset-password',
] as const;

export const DASHBOARD_ROUTE_BY_SCOPE: Record<WorkspaceScope, string> = {
  buyer: '/portal/buyer/dashboard',
  seller: '/portal/seller/dashboard',
  admin: '/portal/admin/dashboard',
};

export const ROLE_SCOPE_MAP: Record<PortalRoleKey, WorkspaceScope> = {
  BUYER_USER: 'buyer',
  BUYER_ADMIN: 'buyer',
  SELLER_USER: 'seller',
  SELLER_ADMIN: 'seller',
  INTERNAL_OPS: 'admin',
  INTERNAL_ADMIN: 'admin',
};

export const SIDE_NAV: Record<WorkspaceScope, Array<{ href: string; label: string }>> = {
  buyer: [
    { href: '/portal/buyer/dashboard', label: 'Dashboard' },
    { href: '/portal/buyer/products', label: 'Products' },
    { href: '/portal/buyer/rfqs', label: 'RFQs' },
    { href: '/portal/buyer/quotes', label: 'Quotes' },
    { href: '/portal/buyer/orders', label: 'Orders' },
    { href: '/portal/buyer/payments', label: 'Payments' },
    { href: '/portal/buyer/logistics', label: 'Logistics' },
    { href: '/portal/buyer/documents', label: 'Documents' },
    { href: '/portal/buyer/company', label: 'Company' },
    { href: '/portal/buyer/settings', label: 'Settings' },
  ],
  seller: [
    { href: '/portal/seller/dashboard', label: 'Dashboard' },
    { href: '/portal/seller/products', label: 'Products' },
    { href: '/portal/seller/inquiries', label: 'Inquiries' },
    { href: '/portal/seller/quotes', label: 'Quotes' },
    { href: '/portal/seller/orders', label: 'Orders' },
    { href: '/portal/seller/payments', label: 'Payments' },
    { href: '/portal/seller/logistics', label: 'Logistics' },
    { href: '/portal/seller/documents', label: 'Documents' },
    { href: '/portal/seller/company', label: 'Company' },
    { href: '/portal/seller/settings', label: 'Settings' },
  ],
  admin: [
    { href: '/portal/admin/dashboard', label: 'Dashboard' },
    { href: '/portal/admin/companies', label: 'Companies' },
    { href: '/portal/admin/users', label: 'Users' },
    { href: '/portal/admin/catalog', label: 'Catalog' },
    { href: '/portal/admin/rfqs', label: 'RFQs' },
    { href: '/portal/admin/quotes', label: 'Quotes' },
    { href: '/portal/admin/orders', label: 'Orders' },
    { href: '/portal/admin/payments', label: 'Payments' },
    { href: '/portal/admin/logistics', label: 'Logistics' },
    { href: '/portal/admin/documents', label: 'Documents' },
    { href: '/portal/admin/audit', label: 'Audit' },
    { href: '/portal/admin/settings', label: 'Settings' },
  ],
};

export const DOCUMENT_VISIBILITY_BADGES = {
  BUYER_VISIBLE: 'Buyer',
  SELLER_VISIBLE: 'Seller',
  OPS_ONLY: 'Ops only',
  FINANCE_ONLY: 'Finance',
} as const;
