import React from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import MetricCard from '../../components/MetricCard';
import Badge from '../../components/Badge';
import { KAUR_KEUANGAN_MENU } from './menu';
import { ReceiptText, CheckCircle2 } from 'lucide-react';

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'jenis', label: 'Jenis Pajak' },
  { key: 'nominal', label: 'Nominal' },
  { key: 'status', label: 'Status' },
];

const DUMMY_DATA = [
  { id: 1, tanggal: '05 Okt 2023', jenis: 'PPN 11%', nominal: 'Rp 2.200.000', status: 'Sudah Disetor' },
  { id: 2, tanggal: '05 Okt 2023', jenis: 'PPh 22', nominal: 'Rp 300.000', status: 'Sudah Disetor' },
  { id: 3, tanggal: '10 Okt 2023', jenis: 'PPN 11%', nominal: 'Rp 550.000', status: 'Sudah Disetor' },
  { id: 4, tanggal: '15 Okt 2023', jenis: 'PPh 21', nominal: 'Rp 1.500.000', status: 'Sudah Disetor' },
  { id: 5, tanggal: '20 Okt 2023', jenis: 'PPN 11%', nominal: 'Rp 3.000.000', status: 'Belum Disetor' },
  { id: 6, tanggal: '25 Okt 2023', jenis: 'PPh 22', nominal: 'Rp 950.000', status: 'Belum Disetor' },
];

export default function TaxBookPage() {
  const renderCell = (row: typeof DUMMY_DATA[0], columnKey: string) => {
    switch (columnKey) {
      case 'tanggal':
        return <span className="text-slate-600 text-sm">{row.tanggal}</span>;
      case 'jenis':
        return <span className="font-semibold text-slate-900 text-sm">{row.jenis}</span>;
      case 'nominal':
        return <span className="font-bold text-slate-900 text-sm">{row.nominal}</span>;
      case 'status':
        return (
          <Badge 
            variant={row.status === 'Sudah Disetor' ? 'success' : 'warning'} 
            label={row.status} 
          />
        );
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
        title="Buku Pajak" 
        description="Pencatatan pemungutan dan penyetoran pajak dari transaksi belanja desa" 
      />

      {/* Ringkasan Saldo Pajak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <MetricCard
          title="Total Pajak Dipungut"
          value="Rp 8.500.000"
          variant="default"
          icon={<ReceiptText className="w-5 h-5 text-brand-600" />}
        />
        <MetricCard
          title="Total Pajak Disetor"
          value="Rp 8.500.000"
          variant="success"
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
        />
      </div>

      {/* Tabel Pajak */}
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
