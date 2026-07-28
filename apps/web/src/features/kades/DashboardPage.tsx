import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BadgeCheck, ShieldAlert, QrCode, Settings, HelpCircle, History, BarChart3, Calendar } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import MonthlyBarChart from '../../components/MonthlyBarChart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { KADES_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/kades')
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

  const pendingAuthCount = data?.pendingAuthCount?.toString() || "0";
  const totalDisbursedYear = data?.totalDisbursedYear ? `Rp ${Number(data.totalDisbursedYear).toLocaleString('id-ID')}` : 'Rp 0';
  const kasBalance = data?.kasBalance || "Rp 0";
  const absorptionRate = data?.absorptionRate || "0%";
  const donutData = data?.donutData || [];
  const barData = data?.barData || [];
  const penyerapanData = data?.penyerapanData || [];

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <PageHeader title="Dashboard Kades" description="Selamat datang di dashboard panel untuk Kepala Desa." />


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Sisa Kas Desa"
          value={kasBalance}
          variant="success"
        />
        <div onClick={() => navigate('/kades/persetujuan-pencairan')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Menunggu Otorisasi Final"
            value={pendingAuthCount}
            variant="warning"
          />
        </div>
        <MetricCard
          title="Target Penyerapan Tercapai"
          value={absorptionRate}
          variant="default"
        />
      </div>

      {/* Widget Ringkasan Eksekutif Tahunan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Ring Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Total Dana Terserap Tahun Ini</h3>
          <div className="relative w-48 h-48 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-900">{absorptionRate}</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600 text-center">
            {totalDisbursedYear}
          </p>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ranking Realisasi per Dusun</h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                  width={70}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value}%`, 'Realisasi']}
                />
                <Bar dataKey="percentage" fill="#00AEEF" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {penyerapanData && penyerapanData.length > 0 && (
            <MonthlyBarChart
              title="Penyerapan Anggaran: Target vs Realisasi"
              data={penyerapanData}
              series1Name="Target"
              series2Name="Realisasi"
              series1Color="#94a3b8"
              series2Color="#10b981"
            />
          )}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full mt-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-brand-100 p-2.5 rounded-xl">
                <Calendar className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Jatuh Tempo Mendatang</h3>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg p-2 min-w-[56px] shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jul</span>
                  <span className="text-lg font-black text-slate-800 leading-none mt-0.5">31</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">Akhir Termin 2 Pengaspalan Jalan</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    Dusun 3
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg p-2 min-w-[56px] shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agu</span>
                  <span className="text-lg font-black text-slate-800 leading-none mt-0.5">15</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">Tenggat Laporan Triwulan</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Administrasi Desa
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg p-2 min-w-[56px] shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sep</span>
                  <span className="text-lg font-black text-slate-800 leading-none mt-0.5">05</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">Masa Garansi Bibit Selesai</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Dusun 2
                  </p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 py-2 text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors">
              Lihat Semua Kalender
            </button>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
