import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { getCompanyProfile } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function BuyerCompanyPage() {
  const session = await requireScope('buyer');
  const company = await getCompanyProfile(session);

  return (
    <div className="space-y-6">
      <SectionCard title={company?.name ?? 'Company'} subtitle={`Type ${company?.companyType ?? '—'} · Status ${company?.status ?? '—'}`}>
        <p className="text-sm text-slate-600">Primary currency stays USD in v1. Buyer company users are scoped to their own commercial chain.</p>
      </SectionCard>
      <SectionCard title="Company users">
        <RecordTable columns={['Name', 'Email', 'Role', 'Status']} rows={(company?.companyUsers ?? []).map((membership) => [`${membership.user.firstName} ${membership.user.lastName}`, membership.user.email, membership.role.label, <Badge key={membership.id}>{membership.user.status}</Badge>])} />
      </SectionCard>
    </div>
  );
}
