import React from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import MetricCard from '../../components/MetricCard';
import Badge from '../../components/Badge';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { Database, Landmark, CheckCircle, AlertTriangle } from 'lucide-react';

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'keterangan', label: 'Keterangan' },
  { key: 'debit', label: 'Debit' },
  { key: 'kredit', label: 'Kredit' },
  { key: 'saldo', label: 'Saldo' },
];

const DUMMY_DATA = [
  { id: 1, tanggal: '01 Okt 2023', keterangan: 'Saldo Awal', debit: '-', kredit: '-', saldo: 'Rp 25.000.000' },
  { id: 2, tanggal: '05 Okt 2023', keterangan: 'Transfer Masuk (Dana Desa)', debit: 'Rp 50.000.000', kredit: '-', saldo: 'Rp 75.000.000' },
  { id: 3, tanggal: '10 Okt 2023', keterangan: 'Cek Keluar No. 123 (Material)', debit: '-', kredit: 'Rp 15.000.000', saldo: 'Rp 60.000.000' },
  { id: 4, tanggal: '15 Okt 2023', keterangan: 'Biaya Administrasi Bank', debit: '-', kredit: 'Rp 500.000', saldo: 'Rp 59.500.000' },
  { id: 5, tanggal: '20 Okt 2023', keterangan: 'Bunga Bank (Penerimaan)', debit: 'Rp 5.000.000', kredit: '-', saldo: 'Rp 64.500.000' },
];

export default function BankBookPage() {
  const systemBalance = 65000000;
  const bankBalance = 64500000;
  const isMatch = systemBalance === bankBalance;
  const diff = Math.abs(systemBalance - bankBalance);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const renderCell = (row: typeof DUMMY_DATA[0], columnKey: string) => {
    switch (columnKey) {
      case 'tanggal':
        return <span className="text-slate-600 text-sm">{row.tanggal}</span>;
      case 'keterangan':
        return <span className="font-semibold text-slate-900 text-sm">{row.keterangan}</span>;
      case 'debit':
        return <span className={`text-sm font-medium ${row.debit !== '-' ? 'text-green-600' : 'text-slate-400'}`}>{row.debit}</span>;
      case 'kredit':
        return <span className={`text-sm font-medium ${row.kredit !== '-' ? 'text-red-600' : 'text-slate-400'}`}>{row.kredit}</span>;
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
      <PageHeader 
        title="Buku Bank" 
        description="Rekonsiliasi mutasi rekening kas desa terhadap ledger sistem" 
      />

      {/* Ringkasan Saldo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MetricCard
          title="Saldo Menurut Sistem"
          value={formatCurrency(systemBalance)}
          variant="default"
          icon={<Database className="w-5 h-5 text-brand-600" />}
        />
        <MetricCard
          title="Saldo Menurut Rekening Bank"
          value={formatCurrency(bankBalance)}
          variant={isMatch ? 'success' : 'warning'}
          icon={<Landmark className={`w-5 h-5 ${isMatch ? 'text-green-600' : 'text-amber-600'}`} />}
        />
      </div>

      {/* Status Rekonsiliasi */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Status Rekonsiliasi Bulan Ini:</span>
          {isMatch ? (
            <Badge variant="success" label={
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Rekonsiliasi Cocok
              </span>
            } />
          ) : (
            <Badge variant="danger" label={
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Selisih Ditemukan: {formatCurrency(diff)}
              </span>
            } />
          )}
        </div>
        <button
          onClick={() => toast.success("Rekonsiliasi berhasil dicatat")}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors active:scale-95 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Cocokkan Rekonsiliasi
        </button>
      </div>

      {/* Tabel Mutasi */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={COLUMNS}
          data={DUMMY_DATA}
          renderCell={renderCell}
        />
      </div>
    </RoleLayout>
  );
}
