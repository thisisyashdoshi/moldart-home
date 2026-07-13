import { Badge } from '@/components/ui/badge';

export function RecordTable({
  columns,
  rows,
  emptyLabel = 'No records yet',
}: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
  emptyLabel?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] divide-y divide-slate-200 text-left text-sm lg:min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={index} className="transition hover:bg-slate-50/80">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3.5 align-top text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10 text-slate-500" colSpan={columns.length}>
                  <div className="flex flex-col gap-2">
                    <Badge>{emptyLabel}</Badge>
                    <span className="text-sm text-slate-500">New activity will appear here after the workflow starts.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
