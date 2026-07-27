import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Wallet, History, HelpCircle, FolderKanban } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import MonthlyBarChart from '../../components/MonthlyBarChart';
import { KAUR_TEKNIS_MENU } from './menu';



const CHART_DATA_DUMMY = [
  { label: 'Jan', value: 25000000 },
  { label: 'Feb', value: 50000000 },
  { label: 'Mar', value: 15000000 },
  { label: 'Apr', value: 75000000 },
  { label: 'Mei', value: 100000000 },
  { label: 'Jun', value: 45000000 },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <RoleLayout menuItems={KAUR_TEKNIS_MENU} userName="Budi Santoso" userRole="Kaur Teknis">
      <PageHeader title="Dashboard Kaur Teknis" description="Selamat datang di dashboard panel untuk Kaur Teknis." />


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div onClick={() => navigate('/kaur-teknis/formulir-musrembang')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Total Pagu Musrembang Tahun Ini"
            value="Rp 500.000.000"
            variant="default"
          />
        </div>
        <div onClick={() => navigate('/kaur-teknis/ajukan-pencairan')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Pengajuan Pencairan Dipending"
            value="3"
            variant="warning"
          />
        </div>
        <div onClick={() => navigate('/kaur-teknis/riwayat-penolakan')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Usulan/Pencairan Ditolak"
            value="1"
            variant="danger"
          />
        </div>
      </div>

      <MonthlyBarChart 
        title="Pencairan yang Disetujui (6 Bulan Terakhir)" 
        data={CHART_DATA_DUMMY} 
      />
    </RoleLayout>
  );
}
