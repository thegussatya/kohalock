import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, MessageCircleQuestion, Lock, HelpCircle, ShieldCheck, CheckCircle2, MessageSquareCheck, Download } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import { PUBLIK_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [reportPeriod, setReportPeriod] = useState('Bulan Ini');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/public/summary')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    toast.success(`Laporan transparansi periode ${reportPeriod} sedang disiapkan, akan diunduh otomatis`);
  };

  return (
    <RoleLayout menuItems={PUBLIK_MENU} userName="Warga" userRole="Masyarakat">
      <PageHeader title="Dashboard Publik" description="Selamat datang di portal informasi Publik." />

      {loading ? (
        <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Memuat dashboard...</div>
      ) : (
        <>

      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mb-6 mt-[-1rem]">
        <select 
          value={reportPeriod} 
          onChange={(e) => setReportPeriod(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm bg-white font-medium"
        >
          <option value="Bulan Ini">Bulan Ini</option>
          <option value="Kuartal Ini">Kuartal Ini</option>
          <option value="Tahun Ini">Tahun Ini</option>
        </select>
        <button 
          onClick={handleDownload}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Unduh Laporan Transparansi
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Dana Desa Tahun Ini"
          value={data?.totalDana ? `Rp ${Number(data.totalDana).toLocaleString('id-ID')}` : 'Rp 0'}
          variant="default"
        />
        <div onClick={() => navigate('/publik/proyek')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
          <MetricCard
            title="Total Realisasi Dana"
            value={data?.persentaseRealisasi ? `${data.persentaseRealisasi}%` : '0%'}
            variant="success"
          />
        </div>
        <MetricCard
          title="Proyek Sedang Berjalan"
          value={data?.proyekAktif?.toString() || '0'}
          variant="warning"
        />
      </div>
      <div className="mt-10">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          Statistik Transparansi Desa
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Dana Desa Transparan On-Chain"
            value="Belum Tersedia"
            variant="default"
            icon={<ShieldCheck className="w-5 h-5 text-slate-400" />}
          />
          <MetricCard
            title="Proyek Selesai Tahun Ini"
            value={data?.proyekSelesai?.toString() || '0'}
            variant="success"
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          />
          <MetricCard
            title="Laporan Warga Ditindaklanjuti"
            value={data?.laporanDitindaklanjuti?.toString() || '0'}
            variant="warning"
            icon={<MessageSquareCheck className="w-5 h-5 text-brand-600" />}
          />
        </div>
      </div>
      </>
      )}
    </RoleLayout>
  );
}
