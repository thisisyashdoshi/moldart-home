import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { DASHBOARD_ROUTE_BY_SCOPE, ROLE_SCOPE_MAP, type PortalRoleKey, type WorkspaceScope } from '@/lib/portal-config';
import { authOptions } from './options';
import { hasPermission } from './permissions';

export type SecureSession = {
  userId: string;
  email: string;
  name: string;
  companyId: string;
  companyName: string;
  companyType: string;
  roleKey: PortalRoleKey;
  scope: WorkspaceScope;
};

export const getSecureSession = cache(async (): Promise<SecureSession | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.roleKey || !session.user.companyId) {
    return null;
  }

  const membership = await prisma.companyUser.findFirst({
    where: {
      userId: session.user.id,
      companyId: session.user.companyId,
      approvedAt: { not: null },
      user: { status: 'ACTIVE' },
      company: { status: 'ACTIVE' },
    },
    include: {
      user: true,
      company: true,
      role: true,
    },
  });

  if (!membership) return null;

  const roleKey = membership.role.key as PortalRoleKey;

  return {
    userId: membership.user.id,
    email: membership.user.email,
    name: `${membership.user.firstName} ${membership.user.lastName}`.trim(),
    companyId: membership.company.id,
    companyName: membership.company.name,
    companyType: membership.company.companyType,
    roleKey,
    scope: ROLE_SCOPE_MAP[roleKey],
  };
});

export async function requireSession() {
  const session = await getSecureSession();
  if (!session) redirect('/portal');
  return session;
}

export async function requireScope(scope: WorkspaceScope) {
  const session = await requireSession();
  if (session.scope !== scope) {
    redirect(DASHBOARD_ROUTE_BY_SCOPE[session.scope]);
  }
  return session;
}

export async function requirePermission(permission: string, fallbackScope: WorkspaceScope = 'admin') {
  const session = await requireSession();
  if (!hasPermission(session.roleKey, permission)) {
    redirect(DASHBOARD_ROUTE_BY_SCOPE[fallbackScope]);
  }
  return session;
}
