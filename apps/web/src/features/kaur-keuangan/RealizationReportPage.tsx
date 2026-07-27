import React from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import MetricCard from '../../components/MetricCard';
import Badge from '../../components/Badge';
import MonthlyBarChart from '../../components/MonthlyBarChart';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { Download, Calendar, BarChart3, PieChart } from 'lucide-react';

const COLUMNS: TableColumn[] = [
  { key: 'bulan', label: 'Bulan' },
  { key: 'status', label: 'Status Penutupan' },
  { key: 'transaksi', label: 'Total Transaksi' },
  { key: 'nominal', label: 'Total Nominal' },
];

const DUMMY_DATA = [
  { id: 1, bulan: 'Januari 2026', status: 'Terkunci', transaksi: '45 Transaksi', nominal: 'Rp 80.000.000' },
  { id: 2, bulan: 'Februari 2026', status: 'Terkunci', transaksi: '38 Transaksi', nominal: 'Rp 75.000.000' },
  { id: 3, bulan: 'Maret 2026', status: 'Terkunci', transaksi: '62 Transaksi', nominal: 'Rp 120.000.000' },
  { id: 4, bulan: 'April 2026', status: 'Terkunci', transaksi: '51 Transaksi', nominal: 'Rp 90.000.000' },
  { id: 5, bulan: 'Mei 2026', status: 'Terkunci', transaksi: '70 Transaksi', nominal: 'Rp 150.000.000' },
  { id: 6, bulan: 'Juni 2026', status: 'Terkunci', transaksi: '68 Transaksi', nominal: 'Rp 135.000.000' },
  { id: 7, bulan: 'Juli 2026', status: 'Belum Ditutup', transaksi: '15 Transaksi', nominal: 'Rp 45.000.000' },
];

const CHART_DATA = [
  { label: 'Jan', value: 80000000 },
  { label: 'Feb', value: 75000000 },
  { label: 'Mar', value: 120000000 },
  { label: 'Apr', value: 90000000 },
  { label: 'Mei', value: 150000000 },
  { label: 'Jun', value: 135000000 },
];

export default function RealizationReportPage() {
  const renderCell = (row: typeof DUMMY_DATA[0], columnKey: string) => {
    switch(columnKey) {
      case 'bulan': return <span className="font-semibold text-slate-900 text-sm">{row.bulan}</span>;
      case 'status': 
        return <Badge variant={row.status === 'Terkunci' ? 'success' : 'warning'} label={row.status} />;
      case 'transaksi': return <span className="text-slate-600 text-sm">{row.transaksi}</span>;
      case 'nominal': return <span className="font-bold text-slate-900 text-sm">{row.nominal}</span>;
      default: return (row as any)[columnKey];
    }
  };

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
            onClick={() => toast.success("Laporan sedang disiapkan")} 
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Generate Laporan Realisasi
          </button>
          <button 
            onClick={() => toast.success("Laporan sedang disiapkan")} 
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Generate LPJ
          </button>
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
          value="Rp 650.000.000"
          variant="success"
          icon={<BarChart3 className="w-5 h-5 text-green-600" />}
        />
        <MetricCard
          title="Persentase dari Pagu"
          value="68%"
          variant="warning"
          icon={<PieChart className="w-5 h-5 text-amber-600" />}
        />
      </div>

      <MonthlyBarChart 
        title="Realisasi Anggaran per Bulan" 
        data={CHART_DATA} 
        series1Name="Realisasi" 
      />

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={COLUMNS}
          data={DUMMY_DATA}
          renderCell={renderCell}
        />
      </div>
    </RoleLayout>
  );
}
