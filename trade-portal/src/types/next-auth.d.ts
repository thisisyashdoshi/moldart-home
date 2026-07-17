import { DefaultSession } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';
import type { PortalRoleKey, WorkspaceScope } from '@/lib/portal-config';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      roleKey: PortalRoleKey;
      scope: WorkspaceScope;
      companyId: string;
      companyName: string;
      companyType: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    roleKey?: PortalRoleKey;
    scope?: WorkspaceScope;
    companyId?: string;
    companyName?: string;
    companyType?: string;
  }
}
