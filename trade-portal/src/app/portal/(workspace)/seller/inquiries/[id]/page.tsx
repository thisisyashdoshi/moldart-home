import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard } from '@/components/portal/workspace-shell';
import { issueSellerQuoteAction } from '@/server/actions/trade-actions';
import { getSellerInquiry } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function SellerInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireScope('seller');
  const { id } = await params;
  const inquiry = await getSellerInquiry(session, id);
  if (!inquiry) notFound();

  return (
    <div className="space-y-6">
      <SectionCard title={inquiry.publicId} subtitle={`${inquiry.buyerCompany.name} · ${inquiry.destinationCountry} / ${inquiry.destinationPort}`}>
        <div className="flex gap-2"><Badge>{inquiry.status}</Badge><Badge tone="warning">{inquiry.incoterm}</Badge></div>
      </SectionCard>
      <SectionCard title="Buyer requirement lines">
        <RecordTable columns={['Line', 'Qty', 'UOM', 'Reference']} rows={inquiry.items.map((item) => [item.itemNameSnapshot, item.quantity, item.uom, item.product?.title ?? 'Snapshot only'])} />
      </SectionCard>
      <SectionCard title="Quote chain">
        <RecordTable
          columns={['Quote', 'Revision', 'Status', 'Subtotal']}
          rows={inquiry.quotes.map((quote) => [quote.publicId, quote.revisionNo, <Badge key={quote.publicId}>{quote.status}</Badge>, `${quote.currency} ${quote.subtotalUsd}`])}
          emptyLabel="No seller quotes issued yet."
        />
      </SectionCard>
      <SectionCard title="Issue or revise quote" subtitle="Internal review quote form. Uploadable PDFs and real approval signatures can be added after workflow approval.">
        <form action={issueSellerQuoteAction} className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
          <input type="hidden" name="rfqPublicId" value={inquiry.publicId} />
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Unit USD
            <input name="unitPriceUsd" type="number" min="0.01" step="0.01" required className="min-h-11 rounded-xl border border-slate-200 px-3 font-normal text-slate-900" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            FOB port
            <input name="fobPort" placeholder="Shanghai" required className="min-h-11 rounded-xl border border-slate-200 px-3 font-normal text-slate-900" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Validity
            <input name="validityDate" type="date" required className="min-h-11 rounded-xl border border-slate-200 px-3 font-normal text-slate-900" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Lead days
            <input name="leadTimeDays" type="number" min="1" defaultValue={30} required className="min-h-11 rounded-xl border border-slate-200 px-3 font-normal text-slate-900" />
          </label>
          <Button type="submit">Issue quote</Button>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 lg:col-span-5">
            MOQ / revision note
            <textarea name="moqNote" rows={3} className="rounded-xl border border-slate-200 px-3 py-2 font-normal text-slate-900" placeholder="Add MOQ, packaging, revision, or inspection note." />
          </label>
        </form>
      </SectionCard>
    </div>
  );
}
