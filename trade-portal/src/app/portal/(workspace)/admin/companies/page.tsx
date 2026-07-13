import { approveCompanyAction } from '@/server/actions/admin-actions';
import { SectionCard } from '@/components/portal/workspace-shell';
import { getAdminSnapshot } from '@/server/repositories/portal-repository';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function AdminCompaniesPage() {
  const snapshot = await getAdminSnapshot();

  return (
    <SectionCard title="Companies" subtitle="Pending and active companies across buyer, seller, and internal scopes">
      <div className="space-y-3">
        {snapshot.pendingCompanies.map((company) => (
          <div key={company.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold text-slate-950">{company.name}</p>
              <p className="text-sm text-slate-500">{company.companyType}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="warning">{company.status}</Badge>
              <form action={approveCompanyAction}><input type="hidden" name="companyId" value={company.id} /><Button type="submit">Approve</Button></form>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
