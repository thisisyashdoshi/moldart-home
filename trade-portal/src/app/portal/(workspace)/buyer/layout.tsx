import { WorkspaceShell } from '@/components/portal/workspace-shell';
import { requireScope } from '@/server/auth/session';

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireScope('buyer');

  return (
    <WorkspaceShell
      session={session}
      scope="buyer"
      title="Buyer workspace"
      intro="Review products, raise RFQs, compare quotes, release approved orders, follow TT payment status, and track buyer-visible logistics and document milestones."
    >
      {children}
    </WorkspaceShell>
  );
}
