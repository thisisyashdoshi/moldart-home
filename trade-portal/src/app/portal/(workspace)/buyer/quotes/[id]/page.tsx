import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { acceptQuoteAction } from '@/server/actions/trade-actions';
import { getQuoteForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency, formatDate } from '@/lib/utils';

export default async function BuyerQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireScope('buyer');
  const { id } = await params;
  const quote = await getQuoteForScope(session, id);
  if (!quote) notFound();
  const canAccept = !quote.order && ['ISSUED', 'REVISED'].includes(quote.status);

  return (
    <div className="space-y-6">
      <SectionCard
        title={quote.publicId}
        subtitle={`${quote.currency} · ${quote.incoterm} · ${quote.fobPort ?? 'Port on quote'}`}
        actions={canAccept ? (
          <form action={acceptQuoteAction}>
            <input type="hidden" name="quotePublicId" value={quote.publicId} />
            <Button type="submit">Accept and create order</Button>
          </form>
        ) : null}
      >
        <div className="flex flex-wrap gap-2">
          <Badge>{quote.status}</Badge>
          <Badge tone="neutral">Revision {quote.revisionNo}</Badge>
          <Badge tone="success">Valid until {formatDate(quote.validityDate)}</Badge>
        </div>
      </SectionCard>
      <SectionCard title="Line items">
        <RecordTable columns={['Line', 'Qty', 'Unit USD', 'Total USD']} rows={quote.items.map((item) => [item.lineLabel, item.quantity, currency(item.unitPriceUsd), currency(item.totalPriceUsd)])} />
      </SectionCard>
      <SectionCard title="Documents and downstream order">
        <div className="grid gap-4 lg:grid-cols-2 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">Quote PDF</p>
            <p>{quote.pdfDocument?.originalFilename ?? 'PDF pending'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">Linked order</p>
            <p>{quote.order ? <Link href={`/portal/buyer/orders/${quote.order.publicId}`} className="font-semibold text-slate-950">{quote.order.publicId}</Link> : 'Order not released yet'}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
