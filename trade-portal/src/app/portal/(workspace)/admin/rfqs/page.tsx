import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { assignRfqToSellerAction } from '@/server/actions/trade-actions';
import { listActiveSellerCompanies, listAdminRfqs } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function AdminRfqsPage() {
  await requireScope('admin');
  const [rfqs, sellers] = await Promise.all([listAdminRfqs(), listActiveSellerCompanies()]);

  return (
    <SectionCard title="RFQs" subtitle="Ops view of buyer-originated RFQ traffic, seller assignment, and quote readiness">
      <RecordTable
        columns={['RFQ', 'Buyer', 'Seller', 'Items', 'Status', 'Assign']}
        rows={rfqs.map((rfq) => [
          rfq.publicId,
          rfq.buyerCompany.name,
          rfq.assignedSellerCompany?.name ?? 'Unassigned',
          `${rfq.items.length} line(s)`,
          <Badge key={rfq.id}>{rfq.status}</Badge>,
          <form key={`${rfq.id}-assign`} action={assignRfqToSellerAction} className="flex min-w-[280px] flex-wrap items-center gap-2">
            <input type="hidden" name="rfqPublicId" value={rfq.publicId} />
            <select
              name="sellerCompanyId"
              defaultValue={rfq.assignedSellerCompany?.id ?? ''}
              className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
              aria-label={`Assign seller for ${rfq.publicId}`}
              required
            >
              <option value="" disabled>Seller</option>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>{seller.name}</option>
              ))}
            </select>
            <Button type="submit" variant="secondary" disabled={!sellers.length}>Assign</Button>
          </form>,
        ])}
        emptyLabel="No RFQs awaiting ops review."
      />
    </SectionCard>
  );
}
