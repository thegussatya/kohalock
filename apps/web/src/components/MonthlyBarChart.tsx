import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export type ChartData = {
  label: string;
  value: number;
  value2?: number;
};

export type MonthlyBarChartProps = {
  title?: string;
  data: ChartData[];
  series1Name?: string;
  series2Name?: string;
  series1Color?: string;
  series2Color?: string;
};

export default function MonthlyBarChart({
  title,
  data,
  series1Name = 'Pencairan',
  series2Name = 'Target',
  series1Color = '#3b82f6',
  series2Color = '#10b981',
}: MonthlyBarChartProps) {
  // Format angka besar menjadi satuan Juta (Jt) untuk label sumbu Y
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}Jt`;
    return `Rp ${value}`;
  };

  const hasSeries2 = data.some((d) => d.value2 !== undefined);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-6">
      {title && (
        <h3 className="text-lg font-semibold text-slate-800 mb-6">{title}</h3>
      )}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 30, bottom: 5 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `Rp ${value.toLocaleString('id-ID')}`,
                name,
              ]}
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            {hasSeries2 && <Legend wrapperStyle={{ fontSize: '14px' }} />}
            <Bar name={series1Name} dataKey="value" fill={series1Color} radius={[4, 4, 0, 0]} />
            {hasSeries2 && (
              <Bar name={series2Name} dataKey="value2" fill={series2Color} radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
