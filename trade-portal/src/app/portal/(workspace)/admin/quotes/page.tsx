import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { listQuotesForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency } from '@/lib/utils';

export default async function AdminQuotesPage() {
  const session = await requireScope('admin');
  const quotes = await listQuotesForScope(session);

  return (
    <SectionCard title="Quotes" subtitle="Platform-wide quote visibility for ops review and overrides">
      <RecordTable columns={['Quote', 'RFQ', 'Status', 'Seller', 'Subtotal']} rows={quotes.map((quote) => [quote.publicId, quote.rfq.publicId, <Badge key={quote.publicId}>{quote.status}</Badge>, quote.sellerCompany.name, currency(quote.subtotalUsd)])} />
    </SectionCard>
  );
}
