import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { listPaymentsForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency, formatDate } from '@/lib/utils';

export default async function SellerPaymentsPage() {
  const session = await requireScope('seller');
  const payments = await listPaymentsForScope(session);

  return (
    <div className="space-y-6">
      <WorkflowPanel
        title="Seller payment visibility"
        items={[
          { label: 'Deposit', detail: 'Seller can see deposit status needed before production moves ahead.', tone: 'warning' },
          { label: 'Ops review', detail: 'Gateway and bank references stay under internal reconciliation before seller-facing status changes.', tone: 'info' },
          { label: 'Balance', detail: 'Balance visibility supports shipment release and document handover without exposing buyer-only finance records.', tone: 'success' },
        ]}
      />
      <SectionCard title="Payment status visibility" subtitle="Seller-side TT milestone visibility and remittance tracking">
        <RecordTable
          columns={['Order', 'Type', 'Status', 'Amount', 'Due', 'Last event']}
          rows={payments.map((payment) => [
            payment.order.publicId,
            payment.paymentType,
            <Badge key={payment.id}>{payment.status}</Badge>,
            currency(payment.amountUsd),
            formatDate(payment.dueDate),
            payment.events[0]?.eventType ?? 'No visible event',
          ])}
          emptyLabel="No seller-visible payment milestones yet."
        />
      </SectionCard>
    </div>
  );
}
