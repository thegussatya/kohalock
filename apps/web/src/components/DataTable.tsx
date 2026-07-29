import type { ReactNode } from 'react';

export type TableColumn = {
  key: string;
  label: string;
};

export type DataTableProps<T = any> = {
  columns: TableColumn[];
  data: T[];
  renderCell?: (row: T, columnKey: string) => ReactNode;
};

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  renderCell,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden w-full transition-all">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-full text-sm text-left text-slate-700">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-bold">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-5 py-4 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-slate-400 text-xs italic"
                >
                  Belum ada data tersedia
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="bg-white hover:bg-brand-50/20 transition-colors"
                >
                  {columns.map((col) => {
                    const cellContent = renderCell
                      ? renderCell(row, col.key)
                      : row[col.key];

                    return (
                      <td key={col.key} className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-700">
                        {cellContent !== undefined && cellContent !== null
                          ? cellContent
                          : row[col.key]}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

