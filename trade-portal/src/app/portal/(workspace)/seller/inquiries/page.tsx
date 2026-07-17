import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { listSellerInquiries } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function SellerInquiriesPage() {
  const session = await requireScope('seller');
  const inquiries = await listSellerInquiries(session);

  return (
    <SectionCard title="Incoming buyer inquiries" subtitle="Assigned buyer RFQs visible to this seller company">
      <RecordTable columns={['RFQ', 'Buyer', 'Items', 'Status']} rows={inquiries.map((rfq) => [<Link key={rfq.publicId} href={`/portal/seller/inquiries/${rfq.publicId}`} className="font-semibold text-slate-950">{rfq.publicId}</Link>, rfq.buyerCompany.name, `${rfq.items.length} line(s)`, <Badge key={rfq.id}>{rfq.status}</Badge>])} />
    </SectionCard>
  );
}
