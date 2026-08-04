import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import MetricCard from '../../components/MetricCard';
import Badge from '../../components/Badge';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { Database, Landmark, CheckCircle, AlertTriangle } from 'lucide-react';
import apiClient from '../../lib/apiClient';

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'keterangan', label: 'Keterangan' },
  { key: 'debit', label: 'Debit' },
  { key: 'kredit', label: 'Kredit' },
  { key: 'saldo', label: 'Saldo' },
];

export default function BankBookPage() {
  const [data, setData] = useState<any[]>([]);
  const [systemBalance, setSystemBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [bankRes, cashRes] = await Promise.all([
          apiClient.get('/bank-book'),
          apiClient.get('/cash-book')
        ]);
        
        setData(bankRes.data);
        
        const cashEntries = cashRes.data.entries || [];
        if (cashEntries && cashEntries.length > 0) {
          setSystemBalance(Number(cashEntries[cashEntries.length - 1].saldoBerjalan));
        }
      } catch (err) {
        console.error('Error fetching bank book:', err);
        toast.error('Gagal mengambil data buku bank');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const formatCurrency = (val: number | string | BigInt) => {
    if (val === undefined || val === null || val === '-') return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const bankBalance = data.length > 0 ? Number(data[data.length - 1].saldo) : 0;
  const isMatch = systemBalance === bankBalance;
  const diff = Math.abs(systemBalance - bankBalance);

  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case 'tanggal':
        return <span className="text-slate-600 text-sm">{formatDate(row.tanggal)}</span>;
      case 'keterangan':
        return <span className="font-semibold text-slate-900 text-sm">{row.keterangan}</span>;
      case 'debit':
        const debitVal = Number(row.debit);
        return <span className={`text-sm font-medium ${debitVal > 0 ? 'text-green-600' : 'text-slate-400'}`}>{debitVal > 0 ? formatCurrency(debitVal) : '-'}</span>;
      case 'kredit':
        const kreditVal = Number(row.kredit);
        return <span className={`text-sm font-medium ${kreditVal > 0 ? 'text-red-600' : 'text-slate-400'}`}>{kreditVal > 0 ? formatCurrency(kreditVal) : '-'}</span>;
      case 'saldo':
        return <span className="font-bold text-slate-900 text-sm">{formatCurrency(row.saldo)}</span>;
      default:
        return row[columnKey];
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Memuat Buku Bank...</div>;

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
          data={data}
          renderCell={renderCell}
        />
      </div>
    </RoleLayout>
  );
}
