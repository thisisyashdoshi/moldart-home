import { describe, expect, it } from 'vitest';
import { hasPermission } from '@/server/auth/permissions';

describe('permissions', () => {
  it('allows buyer admins to manage company users', () => {
    expect(hasPermission('BUYER_ADMIN', 'company.manage_own_users')).toBe(true);
  });

  it('prevents buyer users from payment reconciliation', () => {
    expect(hasPermission('BUYER_USER', 'payment.reconcile')).toBe(false);
  });

  it('allows internal admin wildcard access', () => {
    expect(hasPermission('INTERNAL_ADMIN', 'settings.manage_global')).toBe(true);
    expect(hasPermission('INTERNAL_ADMIN', 'some.future.permission')).toBe(true);
  });
});
