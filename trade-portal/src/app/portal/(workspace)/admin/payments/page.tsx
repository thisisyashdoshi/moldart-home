import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { reconcilePaymentAction } from '@/server/actions/trade-actions';
import { listPaymentsForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency, formatDate } from '@/lib/utils';

export default async function AdminPaymentsPage() {
  const session = await requireScope('admin');
  const payments = await listPaymentsForScope(session);

  return (
    <div className="space-y-6">
      <WorkflowPanel
        title="Payment controls"
        items={[
          { label: 'Mock gateway', detail: 'Events are simulated for review. No live payment provider, webhook secret, or settlement credential is active.', tone: 'info' },
          { label: 'Reconcile', detail: 'Ops confirms reported deposits and balances before downstream order or document release states move ahead.', tone: 'warning' },
          { label: 'Audit', detail: 'Important payment state changes should remain visible in audit history before production rollout.', tone: 'success' },
        ]}
      />
      <SectionCard title="Payments" subtitle="TT deposit and balance reconciliation timeline with mock event history">
        <RecordTable
          columns={['Order', 'Type', 'Status', 'Amount', 'Due', 'Last event', 'Reconcile']}
          rows={payments.map((payment) => [
            payment.order.publicId,
            payment.paymentType,
            <Badge key={payment.id}>{payment.status}</Badge>,
            currency(payment.amountUsd),
            formatDate(payment.dueDate),
            payment.events[0]?.eventType ?? 'No mock event',
            <form key={`${payment.id}-reconcile`} action={reconcilePaymentAction} className="flex min-w-[280px] flex-wrap items-center gap-2">
              <input type="hidden" name="paymentId" value={payment.id} />
              <select name="decision" defaultValue="RECONCILED" className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
                <option value="RECONCILED">Reconciled</option>
                <option value="FAILED">Failed</option>
              </select>
              <Button type="submit" variant="secondary" disabled={payment.status === 'RECONCILED'}>Save</Button>
            </form>,
          ])}
          emptyLabel="No platform payment milestones yet."
        />
      </SectionCard>
    </div>
  );
}
