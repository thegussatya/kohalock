import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { LayoutDashboard, FilePlus, Wallet, History, HelpCircle, FolderKanban } from 'lucide-react';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { KAUR_TEKNIS_MENU } from './menu';



type RejectionData = {
  id: string;
  tanggal: string;
  namaProgram: string;
  tahap: string;
  status: 'Belum Diperbaiki' | 'Sudah Diperbaiki';
};

const DATA_REJECTION: RejectionData[] = [
  { 
    id: '1', 
    tanggal: '2023-10-15', 
    namaProgram: 'Pengaspalan Jalan Dusun 1', 
    tahap: 'Pencairan', 
    status: 'Belum Diperbaiki' 
  },
  { 
    id: '2', 
    tanggal: '2023-10-10', 
    namaProgram: 'Pembangunan Posyandu', 
    tahap: 'Musrembang', 
    status: 'Sudah Diperbaiki' 
  },
  { 
    id: '3', 
    tanggal: '2023-09-28', 
    namaProgram: 'Bantuan Bibit Jagung', 
    tahap: 'Pencairan', 
    status: 'Sudah Diperbaiki' 
  },
  { 
    id: '4', 
    tanggal: '2023-09-15', 
    namaProgram: 'Pengadaan Traktor', 
    tahap: 'Musrembang', 
    status: 'Belum Diperbaiki' 
  },
];

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'namaProgram', label: 'Nama Program' },
  { key: 'tahap', label: 'Tahap' },
  { key: 'status', label: 'Status' },
];

export default function RejectionHistoryPage() {
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
        data={DATA_REJECTION}
        renderCell={renderCell}
      />
    </RoleLayout>
  );
}
