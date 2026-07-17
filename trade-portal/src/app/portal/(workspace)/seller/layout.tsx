import { WorkspaceShell } from '@/components/portal/workspace-shell';
import { requireScope } from '@/server/auth/session';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireScope('seller');

  return (
    <WorkspaceShell
      session={session}
      scope="seller"
      title="Seller workspace"
      intro="Manage your catalog, respond to buyer RFQs, issue offers, keep order execution current, update permitted logistics milestones, and maintain seller-visible documents."
    >
      {children}
    </WorkspaceShell>
  );
}
