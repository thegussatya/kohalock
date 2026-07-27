import React, { ReactNode } from 'react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-full text-sm text-left text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-500 italic"
                >
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="bg-white border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  {columns.map((col) => {
                    const cellContent = renderCell
                      ? renderCell(row, col.key)
                      : row[col.key];

                    return (
                      <td key={col.key} className="px-4 py-4 whitespace-nowrap">
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
