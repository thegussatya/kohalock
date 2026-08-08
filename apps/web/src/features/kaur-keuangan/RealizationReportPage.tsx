import { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import MetricCard from '../../components/MetricCard';
import Badge from '../../components/Badge';
import MonthlyBarChart from '../../components/MonthlyBarChart';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { Download, Calendar, BarChart3, PieChart, FileText } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { Link } from 'react-router-dom';

const COLUMNS: TableColumn[] = [
  { key: 'bulan', label: 'Bulan' },
  { key: 'status', label: 'Status Penutupan' },
  { key: 'nominal', label: 'Total Pengeluaran (Realisasi)' },
];

export default function RealizationReportPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    // Ambil metrics realization
    apiClient.get('/reports/realization')
      .then(res => {
        setReportData(res.data);
      })
      .catch(console.error);

    // Ambil daftar bulan yang sudah terkunci untuk tabel
    apiClient.get('/monthly-closing/archive')
      .then(res => {
        const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const mapped = res.data.map((item: any) => ({
          id: item.id,
          bulan: `${monthNames[item.bulan]} ${item.tahun}`,
          status: 'Terkunci',
          nominal: `Rp ${Number(item.pengeluaran).toLocaleString('id-ID')}`
        }));
        setTableData(mapped);
      })
      .catch(console.error);
  }, []);

  const renderCell = (row: any, columnKey: string) => {
    switch(columnKey) {
      case 'bulan': return <span className="font-semibold text-slate-900 text-sm">{row.bulan}</span>;
      case 'status': 
        return <Badge variant={row.status === 'Terkunci' ? 'success' : 'warning'} label={row.status} />;
      case 'nominal': return <span className="font-bold text-slate-900 text-sm">{row.nominal}</span>;
      default: return (row as any)[columnKey];
    }
  };

  const chartData = reportData ? Object.entries(reportData.breakdownDusun).map(([label, value]) => ({
    label,
    value: Number(value)
  })) : [];

  const totalRealisasi = reportData ? Number(reportData.totalRealisasi) : 0;
  const totalPagu = reportData ? Number(reportData.totalPagu) : 0;
  const persentase = totalPagu > 0 ? Math.round((totalRealisasi / totalPagu) * 100) : 0;

  return (
    <RoleLayout
      menuItems={KAUR_KEUANGAN_MENU}
      userName="Hastuti"
      userRole="Kaur Keuangan"
      settingsPath="/kaur-keuangan/pengaturan"
    >
      <div className="relative">
        <div className="absolute top-0 right-0 z-10 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => toast.success("Laporan PDF sedang di-generate...", { icon: '📄' })} 
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Generate Laporan Realisasi
          </button>
          <Link 
            to="/kaur-keuangan/laporan-lpj"
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <FileText className="w-4 h-4" /> Buka Laporan Rincian LPJ
          </Link>
        </div>
        <PageHeader 
          title="Laporan Realisasi & LPJ" 
          description="Tersusun otomatis dari akumulasi buku bulanan yang telah dikunci" 
        />
      </div>

      <div className="mb-8 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-amber-900">Tenggat Pelaporan Semester: 31 Juli 2026 (H-12)</h3>
          <p className="text-sm text-amber-700">Pastikan seluruh buku bulanan semester ini telah dikunci sebelum batas waktu.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
        <MetricCard
          title="Total Realisasi Tahun Berjalan"
          value={`Rp ${totalRealisasi.toLocaleString('id-ID')}`}
          variant="success"
          icon={<BarChart3 className="w-5 h-5 text-green-600" />}
        />
        <MetricCard
          title="Persentase dari Pagu"
          value={`${persentase}%`}
          variant="warning"
          icon={<PieChart className="w-5 h-5 text-amber-600" />}
        />
      </div>

      <MonthlyBarChart 
        title="Realisasi Anggaran per Dusun" 
        data={chartData} 
        series1Name="Realisasi" 
      />

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={COLUMNS}
          data={tableData}
          renderCell={renderCell}
        />
      </div>
    </RoleLayout>
  );
}
