import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileSearch, Workflow, LockKeyhole, Download, HelpCircle } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { AUDITOR_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/auditor')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Memuat dashboard...</div>;

  const totalTurnover = data?.totalTurnover ? `Rp ${Number(data.totalTurnover).toLocaleString('id-ID')}` : 'Rp 0';
  const redFlagCount = data?.redFlagCount?.toString() || "0";
  const chartData = data?.chartData || [];
  const timeBoundAccess = data?.timeBoundAccess || "-";

  return (
    <RoleLayout menuItems={AUDITOR_MENU} userName="Inspektur Andi" userRole="Auditor / APH">
      <PageHeader title="Dashboard Auditor" description="Selamat datang di dashboard panel untuk Inspektorat / Auditor." />


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Sisa Akses (Time-Bound)"
          value={timeBoundAccess}
          variant="warning"
        />
        <MetricCard
          title="Total Perputaran Uang"
          value={totalTurnover}
          variant="default"
        />
        <div onClick={() => navigate('/auditor/ledger')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Transaksi Anomali (Red Flags)"
            value={redFlagCount}
            variant="danger"
          />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-red-500" />
          Tren Red Flag 6 Bulan Terakhir
        </h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartData.length > 0 ? (
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [value, 'Anomali']}
                />
                <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#ef4444' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }} />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">Belum ada data intervensi</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </RoleLayout>
  );
}
