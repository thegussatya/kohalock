import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { LayoutDashboard, FilePlus, Wallet, History, HelpCircle, FolderKanban } from 'lucide-react';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { KAUR_TEKNIS_MENU } from './menu';



import { useState, useEffect, useMemo } from 'react';
import apiClient from '../../lib/apiClient';

type RejectionData = {
  id: string;
  tanggal: string;
  namaProgram: string;
  tahap: string;
  jenis: string;
  alasan: string;
  status: 'Belum Diperbaiki' | 'Sudah Diperbaiki';
};

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'namaProgram', label: 'Nama Program' },
  { key: 'tahap', label: 'Tahap' },
  { key: 'alasan', label: 'Alasan Penolakan' },
  { key: 'status', label: 'Status' },
];

export default function RejectionHistoryPage() {
  const [dataRejection, setDataRejection] = useState<RejectionData[]>([]);
  const [filterBulan, setFilterBulan] = useState('');
  const [filterJenis, setFilterJenis] = useState('');

  useEffect(() => {
    apiClient.get('/disbursements/rejections')
      .then(res => {
        const mapped = res.data.map((item: any) => ({
          ...item,
          tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }));
        setDataRejection(mapped);
      })
      .catch(console.error);
  }, []);

  const filteredData = useMemo(() => {
    return dataRejection.filter(item => {
      if (filterBulan) {
        // e.g. item.tanggal is like "15 Okt 2023" or similar depending on toLocaleDateString,
        // Actually, filtering by month is easier if we have the original ISO string.
        // Let's assume filterBulan works via string match on month abbreviation if we use short month,
        // or we just keep it simple. But wait, earlier UI had: '9' for Sep, '10' for Oct.
        // It's better to fetch and keep ISO date somewhere.
        // For now, let's do a simple string include check for month name in Indonesian
        const monthNames = ['', 'jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
        const mIdx = parseInt(filterBulan);
        if (mIdx > 0 && mIdx <= 12) {
           const monthStr = monthNames[mIdx];
           if (!item.tanggal.toLowerCase().includes(monthStr)) return false;
        }
      }
      if (filterJenis && item.jenis !== filterJenis) return false;
      return true;
    });
  }, [dataRejection, filterBulan, filterJenis]);

  const renderCell = (row: RejectionData, columnKey: string) => {
    if (columnKey === 'status') {
      const isFixed = row.status === 'Sudah Diperbaiki';
      return (
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            isFixed
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}
        >
          {row.status}
        </span>
      );
    }
    return undefined;
  };

  return (
    <RoleLayout menuItems={KAUR_TEKNIS_MENU} userName="Budi Santoso" userRole="Kaur Teknis">
      <PageHeader title="Riwayat Penolakan" description="Halaman untuk memantau pengajuan yang ditolak sistem atau dikembalikan oleh verifikator." />


      {/* Filters Section */}
      <div className="flex flex-wrap gap-6 mb-6 p-5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
        <div className="flex flex-col">
          <label htmlFor="bulan" className="text-sm font-semibold text-slate-700 mb-1.5">
            Bulan Pengajuan
          </label>
          <select
            id="bulan"
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="border border-slate-300 bg-white rounded-md shadow-sm px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
          >
            <option value="">Semua Bulan</option>
            <option value="9">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="jenis" className="text-sm font-semibold text-slate-700 mb-1.5">
            Jenis Penolakan
          </label>
          <select
            id="jenis"
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="border border-slate-300 bg-white rounded-md shadow-sm px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[250px]"
          >
            <option value="">Semua Jenis</option>
            <option value="sistem">Ditolak Sistem/Blockchain</option>
            <option value="sekdes">Dikembalikan oleh Sekdes</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <DataTable
        columns={COLUMNS}
        data={filteredData}
        renderCell={renderCell}
      />
    </RoleLayout>
  );
}
