import Link from 'next/link';
import { MetricsGrid } from '@/components/portal/metrics-grid';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { getAdminSnapshot, getDashboardData } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function AdminDashboardPage() {
  const session = await requireScope('admin');
  const dashboard = await getDashboardData(session);
  const snapshot = await getAdminSnapshot();

  return (
    <div className="space-y-6">
      <MetricsGrid items={dashboard.cards} />
      <WorkflowPanel
        title="Internal control path"
        items={[
          { label: 'Approve access', detail: 'Keep companies and users gated before they can see buyer, seller, or ops workspaces.', tone: 'info' },
          { label: 'Control trade flow', detail: 'Review RFQs, seller assignment, quotes, order release, payment state, and logistics exceptions.', tone: 'warning' },
          { label: 'Audit changes', detail: 'Use audit history to inspect critical role, commercial, payment, document, and milestone updates.', tone: 'success' },
        ]}
      />
      <SectionCard title="Ops command center" subtitle="Priority routes before any external review">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Pending access', '/portal/admin/companies', 'Approve or hold company onboarding before workspace use.'],
            ['RFQ control', '/portal/admin/rfqs', 'Review India inquiries, seller assignment, and quote readiness.'],
            ['Audit trail', '/portal/admin/audit', 'Inspect important operational changes before approval.'],
          ].map(([label, href, detail]) => (
            <Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
              <p className="font-semibold text-slate-950">{label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Pending onboarding" subtitle="Companies and users waiting for ops approval">
        <RecordTable columns={['Companies pending', 'Users pending']} rows={[[snapshot.pendingCompanies.length, snapshot.pendingUsers.length]]} />
      </SectionCard>
    </div>
  );
}
