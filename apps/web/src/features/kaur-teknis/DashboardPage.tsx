import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FilePlus, Wallet, History, HelpCircle, FolderKanban } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import MonthlyBarChart from '../../components/MonthlyBarChart';
import { KAUR_TEKNIS_MENU } from './menu';
import apiClient from '../../lib/apiClient';



export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/kaur-teknis')
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

  const totalPagu = data?.totalPaguMusrembang ? `Rp ${Number(data.totalPaguMusrembang).toLocaleString('id-ID')}` : 'Rp 0';
  const pendingCount = data?.pendingCount?.toString() || "0";
  const rejectedCount = data?.rejectedCount?.toString() || "0";
  const chartData = data?.chartData || [];

  return (
    <RoleLayout menuItems={KAUR_TEKNIS_MENU} userName="Budi Santoso" userRole="Operator Desa">
      <PageHeader title="Dashboard Operator Desa" description="Selamat datang di dashboard panel untuk Operator Desa." />


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div onClick={() => navigate('/kaur-teknis/formulir-musrembang')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Total Pagu Musrembang Tahun Ini"
            value={totalPagu}
            variant="default"
          />
        </div>
        <div onClick={() => navigate('/kaur-teknis/ajukan-pencairan')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Pengajuan Pencairan Dipending"
            value={pendingCount}
            variant="warning"
          />
        </div>
        <div onClick={() => navigate('/kaur-teknis/riwayat-penolakan')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Usulan/Pencairan Ditolak"
            value={rejectedCount}
            variant="danger"
          />
        </div>
      </div>

      <MonthlyBarChart 
        title="Pencairan yang Disetujui (6 Bulan Terakhir)" 
        data={chartData} 
      />
    </RoleLayout>
  );
}
