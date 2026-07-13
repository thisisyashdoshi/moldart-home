import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/portal/workspace-shell';
import { listSellerProducts } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';
import { currency } from '@/lib/utils';

export default async function SellerProductsPage() {
  const session = await requireScope('seller');
  const products = await listSellerProducts(session);

  return (
    <SectionCard title="Product management" subtitle="Seller-owned catalog lines with publication state and indicative trade basis" actions={<Link href="/portal/seller/products/new" className="text-sm font-semibold text-slate-950">New product draft</Link>}>
      <div className="grid gap-4 xl:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-wrap gap-2"><Badge>{product.status}</Badge><Badge>{product.category}</Badge></div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">{product.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{product.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
              <div><span className="block font-medium text-slate-950">Incoterm</span>{product.indicativeIncoterm}</div>
              <div><span className="block font-medium text-slate-950">MOQ</span>{product.moq ?? 'On quote'}</div>
              <div><span className="block font-medium text-slate-950">USD</span>{product.indicativePriceUsd ? currency(product.indicativePriceUsd) : 'Quote only'}</div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
