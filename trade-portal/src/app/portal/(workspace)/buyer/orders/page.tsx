import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { listOrdersForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency } from '@/lib/utils';

export default async function BuyerOrdersPage() {
  const session = await requireScope('buyer');
  const orders = await listOrdersForScope(session);

  return (
    <SectionCard title="Orders" subtitle="Approved quote snapshots under execution">
      <RecordTable
        columns={['Order', 'Status', 'Value', 'Shipment', 'Payments']}
        rows={orders.map((order) => [
          <Link key={order.publicId} href={`/portal/buyer/orders/${order.publicId}`} className="font-semibold text-slate-950">{order.publicId}</Link>,
          <Badge key={`${order.publicId}-status`}>{order.status}</Badge>,
          currency(order.orderTotalUsd),
          order.shipment?.status ?? 'Planning',
          `${order.payments.length} milestone(s)`,
        ])}
      />
    </SectionCard>
  );
}
