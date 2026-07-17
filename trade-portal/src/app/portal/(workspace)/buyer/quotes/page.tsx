import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { listQuotesForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency, formatDate } from '@/lib/utils';

export default async function BuyerQuotesPage() {
  const session = await requireScope('buyer');
  const quotes = await listQuotesForScope(session);

  return (
    <SectionCard title="Quotes" subtitle="Seller-issued commercial offers with revisions and validity windows">
      <RecordTable
        columns={['Quote', 'RFQ', 'Status', 'Validity', 'Subtotal']}
        rows={quotes.map((quote) => [
          <Link key={quote.publicId} href={`/portal/buyer/quotes/${quote.publicId}`} className="font-semibold text-slate-950">{quote.publicId}</Link>,
          quote.rfq.publicId,
          <Badge key={`${quote.publicId}-status`}>{quote.status}</Badge>,
          formatDate(quote.validityDate),
          currency(quote.subtotalUsd),
        ])}
      />
    </SectionCard>
  );
}
