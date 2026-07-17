'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireScope } from '@/server/auth/session';

export async function approveCompanyAction(formData: FormData) {
  const session = await requireScope('admin');
  const companyId = String(formData.get('companyId') || '');
  if (!companyId) throw new Error('companyId is required');

  await prisma.company.update({
    where: { id: companyId },
    data: { status: 'ACTIVE' },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.userId,
      companyId: session.companyId,
      entityType: 'company',
      entityId: companyId,
      action: 'company.approved',
    },
  });

  revalidatePath('/portal/admin/companies');
}

export async function approveUserAction(formData: FormData) {
  const session = await requireScope('admin');
  const userId = String(formData.get('userId') || '');
  if (!userId) throw new Error('userId is required');

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'ACTIVE' },
  });

  await prisma.companyUser.updateMany({
    where: { userId, approvedAt: null },
    data: { approvedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.userId,
      companyId: session.companyId,
      entityType: 'user',
      entityId: userId,
      action: 'user.approved',
    },
  });

  revalidatePath('/portal/admin/users');
}
