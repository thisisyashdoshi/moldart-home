import Link from 'next/link';
import { MetricsGrid } from '@/components/portal/metrics-grid';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { getDashboardData } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { formatDate } from '@/lib/utils';

export default async function SellerDashboardPage() {
  const session = await requireScope('seller');
  const data = await getDashboardData(session);

  return (
    <div className="space-y-6">
      <MetricsGrid items={data.cards} />
      <WorkflowPanel
        title="Seller execution path"
        items={[
          { label: 'Review inquiry', detail: 'Open assigned buyer RFQs with destination, shipment type, product lines, and notes.', tone: 'info' },
          { label: 'Issue offer', detail: 'Keep quote revisions, validity, lead time, MOQ, and FOB details ready for buyer approval.', tone: 'warning' },
          { label: 'Update execution', detail: 'Maintain permitted order, shipment, document, and payment status visibility for ops and buyer teams.', tone: 'success' },
        ]}
      />
      <SectionCard title="Next actions" subtitle="Seller routes for assigned China sourcing work">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Assigned inquiries', '/portal/seller/inquiries', 'Review RFQs routed by internal operations.'],
            ['Quote pipeline', '/portal/seller/quotes', 'Check offer status, revisions, and accepted quote links.'],
            ['Shipment updates', '/portal/seller/logistics', 'Update permitted port, container, BL/AWB, and milestone details.'],
          ].map(([label, href, detail]) => (
            <Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
              <p className="font-semibold text-slate-950">{label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Recent seller alerts" subtitle="Buyer RFQ, order execution, and internal prompts">
        <RecordTable columns={['Title', 'Detail', 'Created']} rows={data.notifications.map((item) => [item.title, item.body, formatDate(item.createdAt)])} emptyLabel="No seller alerts yet." />
      </SectionCard>
    </div>
  );
}
