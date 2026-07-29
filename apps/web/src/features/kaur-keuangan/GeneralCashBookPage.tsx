import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import MetricCard from '../../components/MetricCard';
import Badge from '../../components/Badge';
import { KAUR_KEUANGAN_MENU } from './menu';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Lock } from 'lucide-react';

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'uraian', label: 'Uraian Transaksi' },
  { key: 'penerimaan', label: 'Penerimaan' },
  { key: 'pengeluaran', label: 'Pengeluaran' },
  { key: 'saldo', label: 'Saldo' },
];

export default function GeneralCashBookPage() {
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = currentDate.getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    saldoAwal: 0,
    totalPenerimaan: 0,
    totalPengeluaran: 0
  });

  const years = Array.from({ length: currentYear - 2022 + 1 }, (_, i) => (2022 + i).toString());
  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  useEffect(() => {
    apiClient.get(`/cash-book?bulan=${selectedMonth}&tahun=${selectedYear}`)
      .then(res => {
        let totalPenerimaan = 0;
        let totalPengeluaran = 0;
        
        const formatted = res.data.map((item: any) => {
          const penerimaan = Number(item.penerimaan);
          const pengeluaran = Number(item.pengeluaran);
          
          totalPenerimaan += penerimaan;
          totalPengeluaran += pengeluaran;
          
          return {
            id: item.id,
            tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
            uraian: item.uraian,
            penerimaan: penerimaan > 0 ? `Rp ${penerimaan.toLocaleString('id-ID')}` : '-',
            pengeluaran: pengeluaran > 0 ? `Rp ${pengeluaran.toLocaleString('id-ID')}` : '-',
            saldo: `Rp ${Number(item.saldoBerjalan).toLocaleString('id-ID')}`
          };
        });
        
        setData(formatted);
        setSummary({
          saldoAwal: 0,
          totalPenerimaan,
          totalPengeluaran
        });
      })
      .catch(err => {
        console.error('Error fetching cash book:', err);
      });
  }, [selectedMonth, selectedYear]);

  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear.toString();

  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case 'tanggal':
        return <span className="text-slate-600 text-sm">{row.tanggal}</span>;
      case 'uraian':
        return <span className="font-semibold text-slate-900 text-sm">{row.uraian}</span>;
      case 'penerimaan':
        return <span className={`text-sm font-medium ${row.penerimaan !== '-' ? 'text-green-600' : 'text-slate-400'}`}>{row.penerimaan}</span>;
      case 'pengeluaran':
        return <span className={`text-sm font-medium ${row.pengeluaran !== '-' ? 'text-red-600' : 'text-slate-400'}`}>{row.pengeluaran}</span>;
      case 'saldo':
        return <span className="font-bold text-slate-900 text-sm">{row.saldo}</span>;
      default:
        return (row as any)[columnKey];
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
        <div className="absolute top-0 right-0 z-10">
          {isCurrentMonth ? (
            <Badge variant="warning" label="Bulan Berjalan (Belum Ditutup)" />
          ) : (
            <Badge variant="success" label={
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> Terkunci
              </span>
            } />
          )}
        </div>
        <PageHeader 
          title="Buku Kas Umum" 
          description="Pencatatan otomatis seluruh transaksi kas dari ledger yang terverifikasi, mengikuti format Lampiran Permendagri No. 20/2018" 
        />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
        >
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Saldo Awal"
          value={`Rp ${summary.saldoAwal.toLocaleString('id-ID')}`}
          variant="default"
          icon={<Wallet className="w-5 h-5 text-brand-600" />}
        />
        <MetricCard
          title="Total Penerimaan"
          value={`Rp ${summary.totalPenerimaan.toLocaleString('id-ID')}`}
          variant="success"
          icon={<ArrowDownToLine className="w-5 h-5 text-green-600" />}
        />
        <MetricCard
          title="Total Pengeluaran"
          value={`Rp ${summary.totalPengeluaran.toLocaleString('id-ID')}`}
          variant="danger"
          icon={<ArrowUpFromLine className="w-5 h-5 text-red-600" />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={COLUMNS}
          data={data}
          renderCell={renderCell}
        />
      </div>
    </RoleLayout>
  );
}
