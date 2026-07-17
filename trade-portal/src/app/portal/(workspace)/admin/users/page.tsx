import { approveUserAction } from '@/server/actions/admin-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/portal/workspace-shell';
import { getAdminSnapshot } from '@/server/repositories/portal-repository';

export default async function AdminUsersPage() {
  const snapshot = await getAdminSnapshot();

  return (
    <SectionCard title="Users" subtitle="User approval queue and account health">
      <div className="space-y-3">
        {snapshot.pendingUsers.map((user) => (
          <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold text-slate-950">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="warning">{user.status}</Badge>
              <form action={approveUserAction}><input type="hidden" name="userId" value={user.id} /><Button type="submit">Approve</Button></form>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
