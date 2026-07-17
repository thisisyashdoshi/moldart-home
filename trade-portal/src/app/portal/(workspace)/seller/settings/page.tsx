import { SectionCard } from '@/components/portal/workspace-shell';

export default function SellerSettingsPage() {
  return (
    <SectionCard title="Settings" subtitle="Seller-side portal preferences and extension points">
      <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-950">Product governance</p>
          <p className="mt-2">Seller drafts, publishing review, and document upload limits are designed to be governed by internal ops.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-950">Execution scope</p>
          <p className="mt-2">Seller-side logistics and payment visibility stay restricted to records assigned to the seller company and approved visibility rules.</p>
        </div>
      </div>
    </SectionCard>
  );
}
