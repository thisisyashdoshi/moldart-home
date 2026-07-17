import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { getBuyerRfq } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function BuyerRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireScope('buyer');
  const { id } = await params;
  const rfq = await getBuyerRfq(session, id);
  if (!rfq) notFound();

  return (
    <div className="space-y-6">
      <SectionCard title={rfq.publicId} subtitle={`${rfq.destinationCountry} · ${rfq.destinationPort} · ${rfq.incoterm} / ${rfq.currency}`}>
        <div className="flex flex-wrap gap-2">
          <Badge>{rfq.status}</Badge>
          <Badge tone={rfq.shipmentType === 'FCL' && rfq.incoterm === 'FOB' ? 'warning' : 'neutral'}>{rfq.shipmentType}</Badge>
          {rfq.shipmentType === 'FCL' && rfq.incoterm === 'FOB' ? <Badge tone="warning">FCA review recommended</Badge> : null}
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">{rfq.notes ?? 'No additional notes.'}</p>
      </SectionCard>
      <SectionCard title="RFQ line items">
        <RecordTable columns={['Item', 'Qty', 'UOM', 'Reference']} rows={rfq.items.map((item) => [item.itemNameSnapshot, item.quantity, item.uom, item.product ? <Link key={item.id} href={`/portal/buyer/products/${item.product.slug}`} className="font-semibold text-slate-950">{item.product.title}</Link> : 'Snapshot only'])} />
      </SectionCard>
      <SectionCard title="Quotes issued against this RFQ">
        <RecordTable columns={['Quote', 'Seller', 'Status', 'Subtotal']} rows={rfq.quotes.map((quote) => [<Link key={quote.publicId} href={`/portal/buyer/quotes/${quote.publicId}`} className="font-semibold text-slate-950">{quote.publicId}</Link>, quote.sellerCompany.name, <Badge key={`${quote.publicId}-status`}>{quote.status}</Badge>, `${quote.currency} ${quote.subtotalUsd}`])} />
      </SectionCard>
    </div>
  );
}
