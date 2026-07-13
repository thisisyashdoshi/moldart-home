import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { completeShipmentMilestoneAction } from '@/server/actions/trade-actions';
import { listLogisticsForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { formatDate } from '@/lib/utils';

export default async function SellerLogisticsPage() {
  const session = await requireScope('seller');
  const shipments = await listLogisticsForScope(session);

  return (
    <div className="space-y-6">
      <WorkflowPanel
        title="Seller logistics view"
        items={[
          { label: 'Port handoff', detail: 'Keep FOB port, container, BL/AWB, and forwarder details ready for ops verification.', tone: 'warning' },
          { label: 'Manual milestones', detail: 'Seller-visible updates are maintained manually during internal review; API integration comes later.', tone: 'info' },
          { label: 'Documents', detail: 'Shipment records should match packing list, invoice, QC, COO, and BL/AWB visibility rules.', tone: 'success' },
        ]}
      />
      {shipments.length ? shipments.map((shipment) => (
        <SectionCard key={shipment.id} title={shipment.order.publicId} subtitle={`${shipment.fobPort ?? 'Port pending'} · Container ${shipment.containerNo ?? 'TBD'} · BL ${shipment.blNo ?? 'TBD'}`}>
          <div className="flex flex-wrap gap-2 pb-4">
            <Badge>{shipment.status}</Badge>
            <Badge tone="neutral">ETD {formatDate(shipment.etd)}</Badge>
            <Badge tone="neutral">ETA {formatDate(shipment.eta)}</Badge>
            <Badge tone="neutral">{shipment.freightForwarder ?? 'Forwarder pending'}</Badge>
          </div>
          <div className="space-y-3">
            {shipment.milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-slate-950">{milestone.label}</p><Badge>{milestone.status}</Badge></div>
                <p className="mt-2">{formatDate(milestone.occurredAt)}</p>
                <form action={completeShipmentMilestoneAction} className="mt-3 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="milestoneId" value={milestone.id} />
                  <input name="note" placeholder="Manual update note" className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm" />
                  <Button type="submit" variant="secondary" disabled={milestone.status === 'DONE'}>Mark done</Button>
                </form>
              </div>
            ))}
          </div>
        </SectionCard>
      )) : (
        <SectionCard title="No seller-visible shipments" subtitle="Confirmed orders will appear here once logistics planning starts.">
          <p className="text-sm leading-6 text-slate-600">The internal review build keeps carrier updates manual until a forwarder or carrier API is approved.</p>
        </SectionCard>
      )}
    </div>
  );
}
