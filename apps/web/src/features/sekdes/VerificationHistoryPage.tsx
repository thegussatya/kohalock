import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Badge, { type BadgeVariant } from '../../components/Badge';
import { LayoutDashboard, FileCheck, History, PieChart, MessageCircle, HelpCircle, Download, Search } from 'lucide-react';
import { SEKDES_MENU } from './menu';



type HistoryData = {
  id: string;
  tanggal: string;
  namaProgram: string;
  keputusan: string;
  nominal: string;
};

const DUMMY_HISTORY: HistoryData[] = [
  { id: '1', tanggal: '2023-10-15', namaProgram: 'Pembangunan Posyandu Dusun 1', keputusan: 'Disetujui', nominal: 'Rp 150.000.000' },
  { id: '2', tanggal: '2023-10-14', namaProgram: 'Pengaspalan Jalan Utama', keputusan: 'Disetujui', nominal: 'Rp 300.000.000' },
  { id: '3', tanggal: '2023-10-12', namaProgram: 'Bantuan Bibit Pertanian', keputusan: 'Revisi', nominal: 'Rp 25.000.000' },
  { id: '4', tanggal: '2023-10-10', namaProgram: 'Beasiswa Anak Berprestasi', keputusan: 'Disetujui', nominal: 'Rp 50.000.000' },
  { id: '5', tanggal: '2023-10-08', namaProgram: 'Pelatihan Kader PKK', keputusan: 'Revisi', nominal: 'Rp 15.000.000' },
  { id: '6', tanggal: '2023-10-05', namaProgram: 'Pengadaan Lampu Jalan', keputusan: 'Disetujui', nominal: 'Rp 75.000.000' },
  { id: '7', tanggal: '2023-10-02', namaProgram: 'Pembangunan Gapura Desa', keputusan: 'Revisi', nominal: 'Rp 30.000.000' },
  { id: '8', tanggal: '2023-10-01', namaProgram: 'Dana Siaga Bencana Alam', keputusan: 'Disetujui', nominal: 'Rp 20.000.000' },
];

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'namaProgram', label: 'Nama Program' },
  { key: 'keputusan', label: 'Keputusan' },
  { key: 'nominal', label: 'Nominal' },
];

export default function VerificationHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredHistory = DUMMY_HISTORY.filter(h => {
    if (searchQuery && !h.namaProgram.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dateFrom && new Date(h.tanggal) < new Date(dateFrom)) return false;
    if (dateTo && new Date(h.tanggal) > new Date(dateTo)) return false;
    return true;
  });

  const renderCell = (row: HistoryData, columnKey: string) => {
    if (columnKey === 'keputusan') {
      const variant: BadgeVariant = row.keputusan === 'Disetujui' ? 'success' : 'danger';
      return <Badge label={row.keputusan} variant={variant} />;
    }
    return undefined;
  };

  return (
    <RoleLayout menuItems={SEKDES_MENU} userName="Siti Rahma" userRole="Sekretaris Desa">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <PageHeader 
            title="Riwayat Verifikasi Saya" 
            description="Daftar semua keputusan verifikasi yang pernah Anda buat." 
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm">
          <Download className="w-4 h-4" />
          Export ke CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama program..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      <DataTable 
        columns={COLUMNS} 
        data={filteredHistory} 
        renderCell={renderCell}
      />
    </RoleLayout>
  );
}
