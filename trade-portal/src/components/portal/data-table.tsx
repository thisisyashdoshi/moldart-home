'use client';

import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type DataValue = string | number | null | undefined;
type DataRow = Record<string, DataValue>;

export function DataTable({
  columns,
  rows,
  emptyLabel = 'No records yet',
  searchPlaceholder = 'Filter records...',
}: {
  columns: Array<{ key: string; header: string }>;
  rows: DataRow[];
  emptyLabel?: string;
  searchPlaceholder?: string;
}) {
  const [globalFilter, setGlobalFilter] = useState('');
  const tableColumns = useMemo<ColumnDef<DataRow>[]>(
    () =>
      columns.map((column) => ({
        accessorKey: column.key,
        header: column.header,
        cell: ({ getValue }) => {
          const value = getValue<DataValue>();
          return value == null || value === '' ? <span className="text-slate-400">--</span> : String(value);
        },
      })),
    [columns],
  );

  // TanStack Table intentionally owns row model subscriptions.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const visibleRows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            placeholder={searchPlaceholder}
            type="search"
          />
        </label>
        <Badge>{visibleRows.length} visible</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] divide-y divide-slate-200 text-left text-sm lg:min-w-full">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleRows.length ? (
              visibleRows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/80">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 align-top text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10 text-slate-500" colSpan={columns.length}>
                  <div className="flex flex-col gap-2">
                    <Badge>{emptyLabel}</Badge>
                    <span className="text-sm text-slate-500">Adjust the filter or wait for new workflow activity.</span>
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
