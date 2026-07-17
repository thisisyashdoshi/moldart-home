import type { PortalRoleKey } from '@/lib/portal-config';

export const permissionMap: Record<PortalRoleKey, string[]> = {
  BUYER_USER: [
    'rfq.create',
    'rfq.view_own_company',
    'quote.accept_reject',
    'order.view_own_company',
    'payment.view_own_company',
    'shipment.view_own_company',
    'document.view_scoped',
  ],
  BUYER_ADMIN: [
    'company.manage_own_users',
    'rfq.create',
    'rfq.view_own_company',
    'quote.accept_reject',
    'order.view_own_company',
    'payment.view_own_company',
    'shipment.view_own_company',
    'document.view_scoped',
  ],
  SELLER_USER: [
    'rfq.view_own_company',
    'rfq.respond',
    'quote.create',
    'quote.revise',
    'order.view_own_company',
    'shipment.update',
    'document.view_scoped',
  ],
  SELLER_ADMIN: [
    'product.create_own',
    'product.update_own',
    'rfq.view_own_company',
    'rfq.respond',
    'quote.create',
    'quote.revise',
    'order.view_own_company',
    'order.status_update',
    'payment.update_status',
    'shipment.update',
    'document.view_scoped',
  ],
  INTERNAL_OPS: [
    'company.approve',
    'catalog.manage_master',
    'rfq.override_status',
    'quote.override',
    'order.correct',
    'payment.reconcile',
    'shipment.correct',
    'document.review',
    'audit.view',
  ],
  INTERNAL_ADMIN: ['*'],
};

export function hasPermission(roleKey: PortalRoleKey, permission: string) {
  const permissions = permissionMap[roleKey] ?? [];
  return permissions.includes('*') || permissions.includes(permission);
}
