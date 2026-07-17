import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/portal/workspace-shell';
import { getProductBySlugForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency } from '@/lib/utils';

export default async function BuyerProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireScope('buyer');
  const { slug } = await params;
  const product = await getProductBySlugForScope(session, slug);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <SectionCard title={product.title} subtitle={product.description} actions={<Link href="/portal/buyer/rfqs/new" className="text-sm font-semibold text-slate-950">Add to inquiry</Link>}>
        <div className="grid gap-4 lg:grid-cols-4 text-sm text-slate-600">
          <div><span className="block font-medium text-slate-950">Origin</span>{product.originCountry}</div>
          <div><span className="block font-medium text-slate-950">Trade basis</span>{product.indicativeIncoterm}</div>
          <div><span className="block font-medium text-slate-950">Indicative USD</span>{product.indicativePriceUsd ? currency(product.indicativePriceUsd) : 'Quote only'}</div>
          <div><span className="block font-medium text-slate-950">MOQ / lead time</span>{product.moq ?? 'On quote'} / {product.leadTimeDays ?? 'TBD'} days</div>
        </div>
      </SectionCard>
      <SectionCard title="Technical structure" subtitle="Variants and product-linked documents visible to the buyer role">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {product.variants.map((variant) => (
              <div key={variant.id} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-950">{variant.sku ?? 'Variant'}</p>
                <p>{variant.finish ?? 'Finish on quote'} · {variant.size ?? 'Size on quote'} · {variant.grade ?? 'Grade on quote'}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {product.documents.map((entry) => (
              <div key={entry.document.publicId} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Badge>{entry.document.documentType}</Badge><Badge tone="success">{entry.document.status}</Badge></div>
                <p className="mt-2 font-semibold text-slate-950">{entry.document.originalFilename}</p>
                <p>{entry.document.accessRules.map((rule) => rule.visibility).join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
