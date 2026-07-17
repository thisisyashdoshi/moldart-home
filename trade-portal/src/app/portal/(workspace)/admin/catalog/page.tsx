import { SectionCard } from '@/components/portal/workspace-shell';
import { getAdminSnapshot } from '@/server/repositories/portal-repository';

export default async function AdminCatalogPage() {
  const snapshot = await getAdminSnapshot();

  return (
    <SectionCard title="Master catalog" subtitle="Recently touched seller catalog lines visible to ops">
      <div className="space-y-3">
        {snapshot.products.map((product) => (
          <div key={product.id} className="rounded-2xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">{product.title}</p>
            <p className="text-sm text-slate-500">{product.sellerCompany.name} · {product.category} · {product.status}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
