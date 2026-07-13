import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReactNode } from 'react';
import type { WorkspaceScope } from '@/lib/portal-config';
import type { SecureSession } from '@/server/auth/session';
import { LogoutButton } from './logout-button';
import { SidebarNav } from './sidebar-nav';

const scopeLabels: Record<WorkspaceScope, string> = {
  buyer: 'Buyer workspace',
  seller: 'Seller workspace',
  admin: 'Internal ops',
};

const workflowByScope: Record<WorkspaceScope, string[]> = {
  buyer: ['RFQ', 'Quote', 'Order', 'Payment', 'Logistics', 'Documents'],
  seller: ['Inquiry', 'Offer', 'Approval', 'Production', 'Shipment', 'Documents'],
  admin: ['Review', 'Assign', 'Approve', 'Reconcile', 'Ship', 'Audit'],
};

export function WorkspaceShell({
  session,
  scope,
  title,
  intro,
  children,
}: {
  session: SecureSession;
  scope: WorkspaceScope;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc,#eef2f7_42%,#f8fafc)]">
      <div className="mx-auto grid min-h-screen max-w-[1680px] grid-cols-1 gap-5 px-4 py-4 lg:grid-cols-[292px_minmax(0,1fr)] lg:px-6">
        <aside className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Moldart Trade</p>
            <h1 className="text-lg font-semibold text-slate-950">{session.companyName}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge tone={scope === 'admin' ? 'info' : scope === 'buyer' ? 'success' : 'warning'}>{scopeLabels[scope]}</Badge>
              <Badge>{session.roleKey.replaceAll('_', ' ')}</Badge>
            </div>
            <p className="text-sm text-slate-500">{session.name}</p>
          </div>
          <SidebarNav scope={scope} />
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Review mode</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Payment gateway and carrier APIs are adapter-ready. This internal build uses controlled mock/manual milestones.</p>
          </div>
        </aside>
        <div className="min-w-0 space-y-6">
          <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Authenticated workspace</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">{title}</h2>
                <p className="max-w-4xl text-sm leading-7 text-slate-600">{intro}</p>
              </div>
              <LogoutButton />
            </div>
            <div className="grid border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:grid-cols-3 lg:grid-cols-6">
              {workflowByScope[scope].map((step, index) => (
                <div key={step} className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-slate-500">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] text-slate-500 shadow-sm">
                    {index + 1}
                  </span>
                  <span className="truncate">{step}</span>
                </div>
              ))}
            </div>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

export function SectionCard({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
              {subtitle ? <p className="max-w-4xl text-sm leading-6 text-slate-500">{subtitle}</p> : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </div>
      <div className="p-5 sm:p-6">{children}</div>
    </Card>
  );
}

export function WorkflowPanel({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; detail: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }>;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Badge tone={item.tone ?? 'neutral'}>{item.label}</Badge>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
