import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { getQuoteForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency } from '@/lib/utils';

export default async function SellerQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireScope('seller');
  const { id } = await params;
  const quote = await getQuoteForScope(session, id);
  if (!quote) notFound();

  return (
    <div className="space-y-6">
      <SectionCard title={quote.publicId} subtitle={`${quote.rfq.publicId} · ${quote.incoterm} / ${quote.currency}`}>
        <div className="flex gap-2"><Badge>{quote.status}</Badge><Badge tone="success">Revision {quote.revisionNo}</Badge></div>
      </SectionCard>
      <SectionCard title="Offer lines">
        <RecordTable columns={['Line', 'Qty', 'Unit', 'Total']} rows={quote.items.map((item) => [item.lineLabel, item.quantity, currency(item.unitPriceUsd), currency(item.totalPriceUsd)])} />
      </SectionCard>
    </div>
  );
}
