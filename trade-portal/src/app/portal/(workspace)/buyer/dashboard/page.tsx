import Link from 'next/link';
import { MetricsGrid } from '@/components/portal/metrics-grid';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { getDashboardData } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { formatDate } from '@/lib/utils';

export default async function BuyerDashboardPage() {
  const session = await requireScope('buyer');
  const data = await getDashboardData(session);

  return (
    <div className="space-y-6">
      <MetricsGrid items={data.cards} />
      <WorkflowPanel
        title="Buyer execution path"
        items={[
          { label: 'Start RFQ', detail: 'Capture destination, incoterm, shipment type, notes, and selected products before ops review.', tone: 'info' },
          { label: 'Approve quote', detail: 'Compare revised seller offers, validity, FOB port, lead time, and quote PDF before acceptance.', tone: 'warning' },
          { label: 'Track execution', detail: 'Follow deposit, balance, shipment, and buyer-visible document milestones from one workspace.', tone: 'success' },
        ]}
      />
      <SectionCard title="Next actions" subtitle="Fast routes for the buyer review flow">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Create RFQ', '/portal/buyer/rfqs/new', 'Share a new India inquiry or China sourcing requirement.'],
            ['Review quotes', '/portal/buyer/quotes', 'Check issued offers, revisions, validity, and linked order status.'],
            ['Track documents', '/portal/buyer/documents', 'Open buyer-visible quote, PI, invoice, QC, payment, and BL/AWB files.'],
          ].map(([label, href, detail]) => (
            <Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
              <p className="font-semibold text-slate-950">{label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
      <SectionCard
        title="Recent alerts"
        subtitle="Buyer-visible notifications and workflow prompts"
        actions={<Link href="/portal/buyer/rfqs/new" className="text-sm font-semibold text-slate-950">Create RFQ</Link>}
      >
        <RecordTable
          columns={['Title', 'Detail', 'Created']}
          rows={data.notifications.map((item) => [item.title, item.body, formatDate(item.createdAt)])}
          emptyLabel="No buyer alerts yet."
        />
      </SectionCard>
    </div>
  );
}
