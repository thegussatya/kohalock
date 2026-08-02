import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Badge, { type BadgeVariant } from '../../components/Badge';
import { Download, Search } from 'lucide-react';
import { SEKDES_MENU } from './menu';
import apiClient from '../../lib/apiClient';

type HistoryData = {
  id: string;
  tanggal: string;
  namaProgram: string;
  keputusan: string;
  nominal: string;
};

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'TANGGAL' },
  { key: 'namaProgram', label: 'NAMA PROGRAM' },
  { key: 'keputusan', label: 'KEPUTUSAN' },
  { key: 'nominal', label: 'NOMINAL' },
  { key: 'aksi', label: 'AKSI' },
];

export default function VerificationHistoryPage() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    apiClient.get('/disbursements/verifications')
      .then(res => {
        const mapped = res.data.map((item: any) => ({
          ...item,
          tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          isoDate: item.tanggal, // for easier filtering
          nominal: `Rp ${Number(item.nominal).toLocaleString('id-ID')}`
        }));
        setHistoryData(mapped);
      })
      .catch(console.error);
  }, []);

  const filteredHistory = useMemo(() => {
    return historyData.filter((h: any) => {
      if (searchQuery && !h.namaProgram.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (dateFrom && new Date(h.isoDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(h.isoDate) > new Date(dateTo)) return false;
      return true;
    });
  }, [historyData, searchQuery, dateFrom, dateTo]);

  const renderCell = (row: HistoryData, columnKey: string) => {
    if (columnKey === 'keputusan') {
      const variant: BadgeVariant = row.keputusan === 'Disetujui' ? 'success' : 'danger';
      return <Badge label={row.keputusan} variant={variant} />;
    }
    if (columnKey === 'aksi') {
      return (
        <button
          onClick={() => navigate(`/sekdes/verifikasi/${row.id}`)}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
        >
          Lihat Berkas
        </button>
      );
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
