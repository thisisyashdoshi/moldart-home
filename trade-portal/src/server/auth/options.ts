import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { ROLE_SCOPE_MAP, type PortalRoleKey } from '@/lib/portal-config';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  portalType: z.enum(['buyer', 'seller']).optional(),
});

function resolveMembership(
  memberships: Array<{
    company: { id: string; name: string; companyType: string; status: string };
    role: { key: string };
    approvedAt: Date | null;
  }>,
  portalType?: 'buyer' | 'seller',
) {
  const activeMemberships = memberships.filter((item) => item.approvedAt && item.company.status === 'ACTIVE');

  const internalMembership = activeMemberships.find((item) => item.role.key.startsWith('INTERNAL_'));
  if (internalMembership) {
    return internalMembership;
  }

  if (portalType === 'buyer') {
    return activeMemberships.find((item) => item.role.key.startsWith('BUYER_'));
  }

  if (portalType === 'seller') {
    return activeMemberships.find((item) => item.role.key.startsWith('SELLER_'));
  }

  return (
    activeMemberships.find((item) => item.role.key.startsWith('BUYER_')) ||
    activeMemberships.find((item) => item.role.key.startsWith('SELLER_'))
  );
}

export const authOptions: NextAuthOptions = {
  secret: env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 30,
  },
  pages: {
    signIn: '/portal',
  },
  providers: [
    CredentialsProvider({
      name: 'Trade portal credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        portalType: { label: 'Portal Type', type: 'text' },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const credentials = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            companyUsers: {
              include: {
                company: true,
                role: true,
              },
            },
          },
        });

        if (!user || user.status !== 'ACTIVE') return null;

        const validPassword = await compare(credentials.password, user.passwordHash);
        if (!validPassword) return null;

        const membership = resolveMembership(
          user.companyUsers.map((item) => ({
            company: {
              id: item.company.id,
              name: item.company.name,
              companyType: item.company.companyType,
              status: item.company.status,
            },
            role: { key: item.role.key },
            approvedAt: item.approvedAt,
          })),
          credentials.portalType,
        );

        if (!membership) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          roleKey: membership.role.key as PortalRoleKey,
          scope: ROLE_SCOPE_MAP[membership.role.key as PortalRoleKey],
          companyId: membership.company.id,
          companyName: membership.company.name,
          companyType: membership.company.companyType,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as unknown as {
          id: string;
          email: string;
          name: string;
          roleKey: PortalRoleKey;
          scope: 'buyer' | 'seller' | 'admin';
          companyId: string;
          companyName: string;
          companyType: string;
        };
        token.sub = authUser.id;
        token.email = authUser.email;
        token.name = authUser.name;
        token.roleKey = authUser.roleKey;
        token.scope = authUser.scope;
        token.companyId = authUser.companyId;
        token.companyName = authUser.companyName;
        token.companyType = authUser.companyType;
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub && token.roleKey && token.scope && token.companyId && token.companyName && token.companyType) {
        session.user.id = token.sub;
        session.user.roleKey = token.roleKey;
        session.user.scope = token.scope;
        session.user.companyId = token.companyId;
        session.user.companyName = token.companyName;
        session.user.companyType = token.companyType;
      }
      return session;
    },
  },
};
