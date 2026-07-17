import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { getOrderForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency, formatDate } from '@/lib/utils';

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireScope('seller');
  const { id } = await params;
  const order = await getOrderForScope(session, id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <SectionCard title={order.publicId} subtitle={`${order.currency} · ${order.incoterm} · ${order.sourceCountry}`}>
        <div className="flex flex-wrap gap-2"><Badge>{order.status}</Badge><Badge tone="success">{currency(order.orderTotalUsd)}</Badge></div>
      </SectionCard>
      <SectionCard title="Payment visibility">
        <RecordTable columns={['Type', 'Status', 'Amount', 'Due']} rows={order.payments.map((payment) => [payment.paymentType, <Badge key={payment.id}>{payment.status}</Badge>, currency(payment.amountUsd), formatDate(payment.dueDate)])} emptyLabel="No seller-visible payment milestones yet." />
      </SectionCard>
      <SectionCard title="Seller logistics timeline">
        <RecordTable columns={['Milestone', 'Status', 'Occurred']} rows={order.shipment?.milestones.map((item) => [item.label, <Badge key={item.id}>{item.status}</Badge>, formatDate(item.occurredAt)]) ?? []} emptyLabel="No logistics milestones yet." />
      </SectionCard>
    </div>
  );
}
