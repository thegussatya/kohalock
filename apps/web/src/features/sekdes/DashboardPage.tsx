import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileCheck, PieChart, MessageCircle, HelpCircle, Clock, TrendingUp, History, AlertTriangle } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import MonthlyBarChart from '../../components/MonthlyBarChart';
import { SEKDES_MENU } from './menu';

const VERIFICATION_DATA = [
  { label: 'Minggu 1', value: 45, value2: 38 },
  { label: 'Minggu 2', value: 52, value2: 40 },
  { label: 'Minggu 3', value: 38, value2: 45 },
  { label: 'Minggu 4', value: 65, value2: 50 },
];



export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <RoleLayout menuItems={SEKDES_MENU} userName="Siti Rahma" userRole="Sekretaris Desa">
      <PageHeader title="Dashboard Sekdes" description="Selamat datang di dashboard panel untuk Sekretaris Desa." />

      {/* Deadline Notification */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 p-2 rounded-xl mt-0.5 sm:mt-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-base">Tindakan Diperlukan</h4>
            <p className="text-sm text-amber-800 mt-0.5">3 pengajuan sudah menunggu lebih dari 3 hari, segera ditinjau.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/sekdes/verifikasi')}
          className="whitespace-nowrap px-5 py-2 text-sm font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors w-full sm:w-auto shadow-sm"
        >
          Lihat Sekarang
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div onClick={() => navigate('/sekdes/verifikasi')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Total Pengajuan Menunggu"
            value="5"
            variant="warning"
          />
        </div>
        <MetricCard
          title="Total Pengajuan Disetujui (Bulan Ini)"
          value="Rp 150.000.000"
          variant="success"
        />
        <div onClick={() => navigate('/sekdes/klarifikasi')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Tiket Warga Belum Dijawab"
            value="2"
            variant="danger"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <MetricCard
          title="Rata-rata Waktu Verifikasi"
          value="1.2 Hari"
          variant="default"
          icon={<Clock className="w-5 h-5 text-brand-600" />}
        />
        <MetricCard
          title="Tingkat Approval"
          value="87%"
          variant="success"
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        />
      </div>

      <MonthlyBarChart 
        title="Perbandingan Verifikasi: Bulan Ini vs Bulan Lalu"
        data={VERIFICATION_DATA}
        series1Name="Bulan Ini"
        series2Name="Bulan Lalu"
        series1Color="#00AEEF"
        series2Color="#94a3b8"
      />
    </RoleLayout>
  );
}
