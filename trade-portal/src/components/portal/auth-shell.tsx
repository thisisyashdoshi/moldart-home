import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AuthShell({
  title,
  intro,
  children,
  secondary,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  const workflowCards = [
    ['Inquiry control', 'Buyer RFQs, supplier assignment, and quote review stay tied to one commercial file.'],
    ['Mock payments', 'Deposit and balance milestones are simulated for internal review before a real gateway is approved.'],
    ['Manual logistics', 'FOB, ETD, ETA, container, BL/AWB, and delivery milestones stay controlled by role.'],
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc,#ffffff_48%,#eef2f7)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/portal" className="text-base font-semibold tracking-[0.22em] text-slate-950">
            MOLDART TRADE PORTAL
          </Link>
          <Badge tone="info">Internal review only</Badge>
        </header>
        <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,0.78fr)] lg:items-center">
          <section className="space-y-7">
            <div className="inline-flex rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm">
              India inquiries · China sourcing · controlled execution
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">{title}</h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">{intro}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {workflowCards.map(([heading, copy]) => (
                <Card key={heading} className="border-slate-200 bg-white/90 px-5 py-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">{heading}</div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
                </Card>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-sm leading-7 text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-950">Designed for role-safe trade visibility.</p>
              <p className="mt-2">Buyers, sellers, and internal ops see only company-scoped records. Payment gateways and carrier APIs stay mocked/manual until credentials, compliance, and security review are complete.</p>
            </div>
          </section>
          <div className="grid gap-4">
            <Card className="border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/50 sm:p-8">{children}</Card>
            {secondary ? <Card className="border-slate-200 bg-white/90 p-6 shadow-sm">{secondary}</Card> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
