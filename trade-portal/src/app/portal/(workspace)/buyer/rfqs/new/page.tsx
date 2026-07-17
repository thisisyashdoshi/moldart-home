import { SectionCard } from '@/components/portal/workspace-shell';
import { BuyerRfqForm } from '@/components/portal/buyer-rfq-form';
import { listBuyerProducts } from '@/server/repositories/portal-repository';

export default async function BuyerNewRfqPage() {
  const products = await listBuyerProducts();

  return (
    <SectionCard title="New RFQ" subtitle="Build one multi-product inquiry using USD, FOB/FCA, destination, shipment type, and role-safe notes">
      <BuyerRfqForm products={products.map((item) => ({ id: item.id, title: item.title, category: item.category }))} />
    </SectionCard>
  );
}
