import React, { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';
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

export default function TaxBookPage() {
  const [data, setData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ pungut: 0, setor: 0 });

  useEffect(() => {
    apiClient.get('/tax-book').then(res => {
      const formatted = res.data.map((item: any) => ({
        id: item.id,
        tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
        jenis: item.jenisPajak,
        nominal: Number(item.nominal),
        status: item.statusSetor
      }));
      setData(formatted);

      const totalPungut = formatted.reduce((acc: number, curr: any) => acc + curr.nominal, 0);
      const totalSetor = formatted.reduce((acc: number, curr: any) => 
        curr.status !== 'BELUM_SETOR' ? acc + curr.nominal : acc, 0
      );
      setMetrics({ pungut: totalPungut, setor: totalSetor });
    }).catch(err => console.error(err));
  }, []);
  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case 'tanggal':
        return <span className="text-slate-600 text-sm">{row.tanggal}</span>;
      case 'jenis':
        return <span className="font-semibold text-slate-900 text-sm">{row.jenis}</span>;
      case 'nominal':
        return <span className="font-bold text-slate-900 text-sm">Rp {row.nominal.toLocaleString('id-ID')}</span>;
      case 'status':
        return (
          <Badge 
            variant={row.status !== 'BELUM_SETOR' ? 'success' : 'warning'} 
            label={row.status.replace('_', ' ')} 
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
          value={`Rp ${metrics.pungut.toLocaleString('id-ID')}`}
          variant="default"
          icon={<ReceiptText className="w-5 h-5 text-brand-600" />}
        />
        <MetricCard
          title="Total Pajak Disetor"
          value={`Rp ${metrics.setor.toLocaleString('id-ID')}`}
          variant="success"
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
        />
      </div>

      {/* Tabel Pajak */}
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
