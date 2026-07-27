import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export type DonutData = {
  label: string;
  value: number;
  color: string;
};

export type BudgetDonutChartProps = {
  title?: string;
  data: DonutData[];
};

export default function BudgetDonutChart({
  title,
  data,
}: BudgetDonutChartProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
      {title && (
        <h3 className="text-lg font-bold text-slate-800 mb-6">{title}</h3>
      )}
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Chart Area */}
        <div className="h-[300px] w-full md:w-1/2 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `Rp ${value.toLocaleString('id-ID')}`,
                  'Nominal',
                ]}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontWeight: '500',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend Area */}
        <div className="w-full md:w-1/2">
          <ul className="flex flex-col space-y-3">
            {data.map((entry, index) => (
              <li key={`legend-${index}`} className="flex flex-row items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-slate-600 flex-1">
                  {entry.label}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Rp {entry.value.toLocaleString('id-ID')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
