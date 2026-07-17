import { SectionCard } from '@/components/portal/workspace-shell';

export default function BuyerSettingsPage() {
  return (
    <SectionCard title="Settings" subtitle="Session, company profile, and notification extension points">
      <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-950">Security posture</p>
          <p className="mt-2">Auth.js credentials sign-in, server-side route authorization, and company-scoped DAL checks are enabled.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-950">Future extensions</p>
          <p className="mt-2">Multi-currency, ERP sync, forwarder API sync, and approval workflow expansion can attach here without breaking the quote-driven core.</p>
        </div>
      </div>
    </SectionCard>
  );
}
