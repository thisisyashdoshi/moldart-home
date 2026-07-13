import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { getOrderForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency, formatDate } from '@/lib/utils';

export default async function BuyerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireScope('buyer');
  const { id } = await params;
  const order = await getOrderForScope(session, id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <SectionCard title={order.publicId} subtitle={`${order.currency} · ${order.incoterm} · Source ${order.sourceCountry}`}>
        <div className="flex flex-wrap gap-2">
          <Badge>{order.status}</Badge>
          <Badge tone="success">{currency(order.orderTotalUsd)}</Badge>
        </div>
      </SectionCard>
      <SectionCard title="Commercial snapshot">
        <RecordTable columns={['Line', 'Qty', 'UOM', 'Total']} rows={order.items.map((item) => [item.lineLabel, item.quantity, item.uom, currency(item.totalPriceUsd)])} emptyLabel="No commercial lines on this order." />
      </SectionCard>
      <SectionCard title="Payment milestones">
        <RecordTable columns={['Type', 'Status', 'Amount', 'Due']} rows={order.payments.map((payment) => [payment.paymentType, <Badge key={payment.id}>{payment.status}</Badge>, currency(payment.amountUsd), formatDate(payment.dueDate)])} emptyLabel="No payment milestones yet." />
      </SectionCard>
      <SectionCard title="Logistics timeline">
        <RecordTable columns={['Milestone', 'Status', 'Occurred']} rows={order.shipment?.milestones.map((item) => [item.label, <Badge key={item.id}>{item.status}</Badge>, formatDate(item.occurredAt)]) ?? []} emptyLabel="No logistics milestones yet." />
      </SectionCard>
    </div>
  );
}
