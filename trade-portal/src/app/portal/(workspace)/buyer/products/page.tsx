import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/portal/workspace-shell';
import { listBuyerProducts } from '@/server/repositories/portal-repository';
import { currency } from '@/lib/utils';

export default async function BuyerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const products = await listBuyerProducts(typeof q === 'string' ? q : undefined);

  return (
    <SectionCard title="Published products" subtitle="B2B catalog view with origin, MOQ, indicative trade basis, and technical visibility">
      <div className="grid gap-4 xl:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{product.category}</Badge>
              <Badge tone={product.indicativeIncoterm === 'FCA' ? 'warning' : 'neutral'}>{product.indicativeIncoterm}</Badge>
              <Badge tone={product.isQuoteOnly ? 'warning' : 'success'}>{product.isQuoteOnly ? 'Quote only' : 'Indicative pricing'}</Badge>
            </div>
            <div className="mt-4 space-y-3">
              <h3 className="text-xl font-semibold text-slate-950">{product.title}</h3>
              <p className="text-sm leading-7 text-slate-600">{product.description}</p>
              <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
                <div><span className="block font-medium text-slate-950">Origin</span>{product.originCountry}</div>
                <div><span className="block font-medium text-slate-950">MOQ</span>{product.moq ?? 'On quote'}</div>
                <div><span className="block font-medium text-slate-950">Indicative</span>{product.indicativePriceUsd ? currency(product.indicativePriceUsd) : 'Quote only'}</div>
              </div>
              <Link href={`/portal/buyer/products/${product.slug}`} className="text-sm font-semibold text-slate-950">
                Open product detail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
