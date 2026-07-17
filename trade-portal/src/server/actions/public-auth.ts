'use server';

import crypto from 'node:crypto';
import { headers } from 'next/headers';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { enqueueEmail } from '@/server/queues/email-queue';
import { getClientIp, rateLimit } from '@/server/security/rate-limit';
import { env } from '@/lib/env';

const registerSchema = z.object({
  companyName: z.string().min(2),
  companyType: z.enum(['BUYER', 'SELLER']),
  firstName: z.string().min(2),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(10),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(10),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function registerCompanyAction(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    companyName: formData.get('companyName'),
    companyType: formData.get('companyType'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const limit = await rateLimit({ key: `register:${ip}`, limit: 5, windowSeconds: 60 * 30 });
  if (!limit.success) {
    return { success: false, message: 'Too many registration attempts. Please try again later.' };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const company = await prisma.company.create({
    data: {
      slug: `${slugify(data.companyName)}-${crypto.randomUUID().slice(0, 6)}`,
      name: data.companyName,
      companyType: data.companyType,
      status: 'PENDING',
      primaryCurrency: 'USD',
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hash(data.password, 12),
      firstName: data.firstName,
      lastName: data.lastName,
      status: 'PENDING',
    },
  });

  const role = await prisma.role.findUniqueOrThrow({
    where: { key: data.companyType === 'BUYER' ? 'BUYER_ADMIN' : 'SELLER_ADMIN' },
  });

  await prisma.companyUser.create({
    data: {
      companyId: company.id,
      userId: user.id,
      roleId: role.id,
      isPrimaryContact: true,
      title: data.companyType === 'BUYER' ? 'Buyer Admin' : 'Seller Admin',
    },
  });

  const verificationToken = await prisma.authToken.create({
    data: {
      email,
      token: crypto.randomUUID(),
      tokenType: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      userId: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      companyId: company.id,
      entityType: 'company_registration',
      entityId: company.id,
      action: 'registration.submitted',
      afterJson: { companyType: data.companyType, email },
      ipAddress: ip,
      userAgent: headerList.get('user-agent') ?? undefined,
    },
  });

  await enqueueEmail({
    to: email,
    subject: 'Trade portal registration received',
    html: `<p>Your registration for ${company.name} has been received.</p><p>Please verify your email using this token link:</p><p><a href="${env.APP_URL}/portal?verify=${verificationToken.token}">${env.APP_URL}/portal?verify=${verificationToken.token}</a></p><p>Internal ops approval is required before first login.</p>`,
  });

  return {
    success: true,
    message: 'Registration submitted. Verify the email link and wait for internal approval before first login.',
  };
}

export async function requestPasswordResetAction(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const limit = await rateLimit({ key: `forgot:${ip}`, limit: 8, windowSeconds: 60 * 30 });
  if (!limit.success) {
    return { success: false, message: 'Too many reset attempts. Please try again later.' };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomUUID();
    await prisma.authToken.create({
      data: {
        email,
        token,
        tokenType: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        userId: user.id,
      },
    });

    await enqueueEmail({
      to: email,
      subject: 'Trade portal password reset',
      html: `<p>Reset your password using the link below:</p><p><a href="${env.APP_URL}/portal/reset-password?token=${token}">${env.APP_URL}/portal/reset-password?token=${token}</a></p>`,
    });
  }

  return {
    success: true,
    message: 'If an account exists for that email, a reset link has been queued.',
  };
}

export async function resetPasswordAction(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const limit = await rateLimit({ key: `reset:${ip}`, limit: 8, windowSeconds: 60 * 30 });
  if (!limit.success) {
    return { success: false, message: 'Too many reset attempts. Please try again later.' };
  }

  const token = await prisma.authToken.findFirst({
    where: {
      token: parsed.data.token,
      tokenType: 'PASSWORD_RESET',
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!token?.userId) {
    return { success: false, message: 'Reset token is invalid or expired.' };
  }

  await prisma.user.update({
    where: { id: token.userId },
    data: { passwordHash: await hash(parsed.data.password, 12) },
  });

  await prisma.authToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  });

  return { success: true, message: 'Password updated. Sign in with the new password.' };
}
