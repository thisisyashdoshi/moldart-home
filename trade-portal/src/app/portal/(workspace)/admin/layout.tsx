import { WorkspaceShell } from '@/components/portal/workspace-shell';
import { requireScope } from '@/server/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireScope('admin');

  return (
    <WorkspaceShell
      session={session}
      scope="admin"
      title="Internal ops workspace"
      intro="Approve companies and users, supervise catalog visibility, override commercial flow when required, reconcile payments, correct logistics milestones, review documents, and inspect audit history."
    >
      {children}
    </WorkspaceShell>
  );
}
