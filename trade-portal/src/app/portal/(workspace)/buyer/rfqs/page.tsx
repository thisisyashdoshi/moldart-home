import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { listBuyerRfqs } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function BuyerRfqsPage() {
  const session = await requireScope('buyer');
  const rfqs = await listBuyerRfqs(session);

  return (
    <SectionCard title="RFQs" subtitle="Drafts, submitted sourcing requests, and quote-linked inquiry packs" actions={<Link href="/portal/buyer/rfqs/new" className="text-sm font-semibold text-slate-950">New RFQ</Link>}>
      <RecordTable
        columns={['RFQ', 'Seller', 'Items', 'Status']}
        rows={rfqs.map((rfq) => [
          <Link key={`${rfq.publicId}-link`} href={`/portal/buyer/rfqs/${rfq.publicId}`} className="font-semibold text-slate-950">{rfq.publicId}</Link>,
          rfq.assignedSellerCompany?.name ?? 'Unassigned',
          `${rfq.items.length} line(s)`,
          <Badge key={`${rfq.publicId}-status`}>{rfq.status}</Badge>,
        ])}
      />
    </SectionCard>
  );
}
