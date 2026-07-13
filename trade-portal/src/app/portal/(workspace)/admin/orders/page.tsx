import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { listOrdersForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency } from '@/lib/utils';

export default async function AdminOrdersPage() {
  const session = await requireScope('admin');
  const orders = await listOrdersForScope(session);

  return (
    <SectionCard title="Orders" subtitle="Immutable commercial snapshots and execution status across the platform">
      <RecordTable columns={['Order', 'Status', 'Buyer', 'Seller', 'Value']} rows={orders.map((order) => [order.publicId, <Badge key={order.publicId}>{order.status}</Badge>, order.buyerCompany.name, order.sellerCompany.name, currency(order.orderTotalUsd)])} />
    </SectionCard>
  );
}
