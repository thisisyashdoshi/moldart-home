import { SectionCard } from '@/components/portal/workspace-shell';

export default function AdminSettingsPage() {
  return (
    <SectionCard title="Settings" subtitle="Platform governance and extension surfaces">
      <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-950">Business defaults</p>
          <p className="mt-2">USD-only invoicing, China origin, and FOB/FCA trade terms are enforced in v1.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-950">Planned integrations</p>
          <p className="mt-2">ERP sync, logistics API connectors, external audit export, and customer-specific visibility rules can extend from this surface.</p>
        </div>
      </div>
    </SectionCard>
  );
}
