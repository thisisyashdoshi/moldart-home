'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType } from 'react';
import {
  Boxes,
  Building2,
  ClipboardCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  PackageCheck,
  ScrollText,
  Settings,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react';
import { SIDE_NAV, type WorkspaceScope } from '@/lib/portal-config';
import { cn } from '@/lib/utils';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  Products: Boxes,
  RFQs: ClipboardCheck,
  Quotes: ScrollText,
  Orders: PackageCheck,
  Payments: CreditCard,
  Logistics: Truck,
  Documents: FileText,
  Company: Building2,
  Settings,
  Inquiries: ClipboardCheck,
  Companies: Building2,
  Users,
  Catalog: Boxes,
  Audit: ShieldCheck,
};

export function SidebarNav({ scope }: { scope: WorkspaceScope }) {
  const pathname = usePathname();

  return (
    <nav className="mt-6 grid gap-1">
      {SIDE_NAV[scope].map((item) => {
        const Icon = iconMap[item.label] ?? ListChecks;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950',
              active && 'bg-slate-950 text-white shadow-sm hover:bg-slate-950 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
