import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import MetricCard from '../../components/MetricCard';
import { Download, FileBarChart, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { BPD_ADAT_MENU } from './menu';

const QUARTERLY_DATA = [
  { name: 'Kuartal 1', catatan: 24 },
  { name: 'Kuartal 2', catatan: 35 },
  { name: 'Kuartal 3', catatan: 18 },
  { name: 'Kuartal 4', catatan: 42 },
];

export default function AnnualReportPage() {
  const handleExport = () => {
    toast.success('Laporan sedang disiapkan untuk diunduh');
  };

  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Dewan & Tokoh Adat" userRole="BPD & Adat">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <PageHeader 
          title="Laporan Evaluasi Tahunan" 
          description="Rangkuman aktivitas pengawasan desa dan penyelesaian kasus adat sepanjang tahun."
        />
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors w-full md:w-auto justify-center"
        >
          <Download className="w-5 h-5" />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric Card */}
        <div className="lg:col-span-1">
          <MetricCard
            title="Kasus Adat Terselesaikan Tahun Ini"
            value="9"
            variant="success"
            icon={<Scale className="w-5 h-5 text-green-600" />}
            description="Mediasi dan sidang adat yang telah mencapai mufakat."
          />
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-brand-600" />
            Jumlah Catatan Pengawasan per Kuartal
          </h3>
          
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={QUARTERLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [value, 'Catatan']}
                />
                <Bar dataKey="catatan" radius={[4, 4, 0, 0]}>
                  {QUARTERLY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#2563eb' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
