import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { completeShipmentMilestoneAction } from '@/server/actions/trade-actions';
import { listLogisticsForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { formatDate } from '@/lib/utils';

export default async function AdminLogisticsPage() {
  const session = await requireScope('admin');
  const shipments = await listLogisticsForScope(session);

  return (
    <div className="space-y-6">
      <WorkflowPanel
        title="Logistics controls"
        items={[
          { label: 'Manual source', detail: 'Ops controls every milestone in this internal build; no carrier writeback is enabled.', tone: 'info' },
          { label: 'Provider-ready', detail: 'Records preserve port, ETD, ETA, vessel, voyage, container, BL/AWB, and forwarder fields for future APIs.', tone: 'warning' },
          { label: 'Visibility', detail: 'Buyer and seller milestone visibility must stay scoped before any external screenshot or beta access.', tone: 'success' },
        ]}
      />
      {shipments.length ? shipments.map((shipment) => (
        <SectionCard key={shipment.id} title={shipment.order.publicId} subtitle={`${shipment.fobPort ?? 'Port pending'} · ${shipment.vessel ?? 'Vessel pending'} · ${shipment.voyage ?? 'Voyage pending'}`}>
          <div className="flex flex-wrap gap-2 pb-4">
            <Badge>{shipment.status}</Badge>
            <Badge tone="neutral">ETD {formatDate(shipment.etd)}</Badge>
            <Badge tone="neutral">ETA {formatDate(shipment.eta)}</Badge>
            <Badge tone="neutral">{shipment.containerNo ?? 'Container pending'}</Badge>
            <Badge tone="neutral">{shipment.blNo ?? 'BL/AWB pending'}</Badge>
          </div>
          <div className="space-y-3">
            {shipment.milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-slate-950">{milestone.label}</p><Badge>{milestone.status}</Badge></div>
                <p className="mt-2">{formatDate(milestone.occurredAt)}</p>
                <form action={completeShipmentMilestoneAction} className="mt-3 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="milestoneId" value={milestone.id} />
                  <input name="note" placeholder="Manual ops note" className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm" />
                  <Button type="submit" variant="secondary" disabled={milestone.status === 'DONE'}>Mark done</Button>
                </form>
              </div>
            ))}
          </div>
        </SectionCard>
      )) : (
        <SectionCard title="No platform shipments" subtitle="Accepted orders will appear here once logistics planning starts.">
          <p className="text-sm leading-6 text-slate-600">The internal review build keeps carrier updates manual until a forwarder or carrier API is approved.</p>
        </SectionCard>
      )}
    </div>
  );
}
