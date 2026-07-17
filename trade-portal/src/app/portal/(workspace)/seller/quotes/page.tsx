import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { listQuotesForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency } from '@/lib/utils';

export default async function SellerQuotesPage() {
  const session = await requireScope('seller');
  const quotes = await listQuotesForScope(session);

  return (
    <SectionCard title="Offer management" subtitle="Commercial offers issued against buyer RFQs">
      <RecordTable columns={['Quote', 'RFQ', 'Status', 'Port', 'Subtotal']} rows={quotes.map((quote) => [<Link key={quote.publicId} href={`/portal/seller/quotes/${quote.publicId}`} className="font-semibold text-slate-950">{quote.publicId}</Link>, quote.rfq.publicId, <Badge key={quote.publicId}>{quote.status}</Badge>, quote.fobPort ?? 'Port on quote', currency(quote.subtotalUsd)])} />
    </SectionCard>
  );
}
