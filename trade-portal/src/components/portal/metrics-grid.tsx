import { Card } from '@/components/ui/card';

export function MetricsGrid({
  items,
}: {
  items: Array<{ label: string; value: number | string; detail: string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <Card key={item.label} className="relative overflow-hidden p-5">
          <div className="absolute right-5 top-5 h-8 w-8 rounded-full bg-slate-100 text-center text-xs font-semibold leading-8 text-slate-400">
            {String(index + 1).padStart(2, '0')}
          </div>
          <p className="max-w-[11rem] text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{item.value}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
        </Card>
      ))}
    </div>
  );
}
