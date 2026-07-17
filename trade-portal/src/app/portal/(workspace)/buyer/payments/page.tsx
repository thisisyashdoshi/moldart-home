import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { reportPaymentAction } from '@/server/actions/trade-actions';
import { listPaymentsForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency, formatDate } from '@/lib/utils';

export default async function BuyerPaymentsPage() {
  const session = await requireScope('buyer');
  const payments = await listPaymentsForScope(session);

  return (
    <div className="space-y-6">
      <WorkflowPanel
        title="Mock payment flow"
        items={[
          { label: 'Deposit', detail: 'Buyer can review deposit due status and uploaded payment proof before ops reconciliation.', tone: 'warning' },
          { label: 'Gateway event', detail: 'This internal build records simulated gateway events only; no live capture or settlement is enabled.', tone: 'info' },
          { label: 'Balance', detail: 'Balance status remains visible through production, QC, shipment booking, and document release.', tone: 'success' },
        ]}
      />
      <SectionCard title="Payment tracking" subtitle="TT deposit and balance milestones with mock gateway event visibility">
        <RecordTable
          columns={['Order', 'Type', 'Status', 'Amount', 'Due', 'Last event', 'Report']}
          rows={payments.map((payment) => [
            payment.order.publicId,
            payment.paymentType,
            <Badge key={payment.id}>{payment.status}</Badge>,
            currency(payment.amountUsd),
            formatDate(payment.dueDate),
            payment.events[0]?.eventType ?? 'No mock event',
            <form key={`${payment.id}-report`} action={reportPaymentAction} className="flex min-w-[260px] flex-wrap items-center gap-2">
              <input type="hidden" name="paymentId" value={payment.id} />
              <input name="remittanceReference" placeholder="UTR / mock ref" className="min-h-10 w-36 rounded-xl border border-slate-200 px-3 text-sm" />
              <Button type="submit" variant="secondary" disabled={payment.status === 'RECONCILED'}>Report</Button>
            </form>,
          ])}
          emptyLabel="No buyer payment milestones yet."
        />
      </SectionCard>
    </div>
  );
}
