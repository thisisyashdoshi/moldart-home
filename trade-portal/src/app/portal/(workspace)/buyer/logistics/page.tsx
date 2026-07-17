import { Badge } from '@/components/ui/badge';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { listLogisticsForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { formatDate } from '@/lib/utils';

export default async function BuyerLogisticsPage() {
  const session = await requireScope('buyer');
  const shipments = await listLogisticsForScope(session);

  return (
    <div className="space-y-6">
      <WorkflowPanel
        title="Buyer logistics view"
        items={[
          { label: 'FOB ready', detail: 'Buyer-visible shipment planning starts once ops confirms port, forwarder, and booking details.', tone: 'warning' },
          { label: 'ETD / ETA', detail: 'Dates are manually maintained in this review build and can later connect to carrier APIs.', tone: 'info' },
          { label: 'Delivered', detail: 'Milestones continue through on-board, transit, arrival, customs, and delivery confirmation.', tone: 'success' },
        ]}
      />
      {shipments.length ? shipments.map((shipment) => (
        <SectionCard key={shipment.id} title={shipment.order.publicId} subtitle={`${shipment.fobPort ?? 'Port pending'} · ETD ${formatDate(shipment.etd)} · ETA ${formatDate(shipment.eta)}`}>
          <div className="flex flex-wrap gap-2 pb-4">
            <Badge>{shipment.status}</Badge>
            <Badge tone="neutral">{shipment.vessel ?? 'Vessel pending'}</Badge>
            <Badge tone="neutral">{shipment.voyage ?? 'Voyage pending'}</Badge>
            <Badge tone="neutral">{shipment.freightForwarder ?? 'Forwarder pending'}</Badge>
          </div>
          <div className="space-y-3">
            {shipment.milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-slate-950">{milestone.label}</p><Badge>{milestone.status}</Badge></div>
                <p className="mt-2">{formatDate(milestone.occurredAt)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )) : (
        <SectionCard title="No buyer-visible shipments" subtitle="Accepted orders will appear here once logistics planning starts.">
          <p className="text-sm leading-6 text-slate-600">The internal review build keeps carrier updates manual until a forwarder or carrier API is approved.</p>
        </SectionCard>
      )}
    </div>
  );
}
