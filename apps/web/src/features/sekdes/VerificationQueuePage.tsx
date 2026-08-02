import PageHeader from '../../components/PageHeader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import toast from 'react-hot-toast';
import { SEKDES_MENU } from './menu';
import apiClient from '../../lib/apiClient';



type QueueData = {
  id: string;
  tanggalMasuk: string;
  namaProgram: string;
  namaKaur: string;
  nominal: string;
};

const COLUMNS: TableColumn[] = [
  { key: 'tanggalMasuk', label: 'Tanggal Masuk' },
  { key: 'namaProgram', label: 'Nama Program' },
  { key: 'namaKaur', label: 'Nama Kaur Pengaju' },
  { key: 'nominal', label: 'Nominal Pengajuan' },
  { key: 'aksi', label: 'Aksi' },
];

type TabType = 'menunggu' | 'diteruskan' | 'dikembalikan';

export default function VerificationQueuePage() {
  const [activeTab, setActiveTab] = useState<TabType>('menunggu');
  const [currentData, setCurrentData] = useState<QueueData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let status = 'PENDING_SEKDES';
    if (activeTab === 'diteruskan') status = 'PENDING_KADES';
    else if (activeTab === 'dikembalikan') status = 'RETURNED_FOR_REVISION';

    apiClient.get(`/disbursements?status=${status}`).then(res => {
      const formatted = res.data.map((item: any) => ({
        id: item.id,
        tanggalMasuk: new Date(item.submittedAt).toISOString().split('T')[0],
        namaProgram: item.proposal?.judulUsulan || '-',
        namaKaur: item.proposal?.kaurTeknis?.nama || '-',
        nominal: `Rp ${Number(item.nominal).toLocaleString('id-ID')}`
      }));
      setCurrentData(formatted);
    }).catch(err => {
      console.error(err);
      toast.error('Gagal mengambil data antrean');
    });
  }, [activeTab]);

  const renderCell = (row: QueueData, columnKey: string) => {
    if (columnKey === 'aksi') {
      return (
        <button
          type="button"
          onClick={() => navigate(`/sekdes/verifikasi/${row.id}`)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
        >
          Periksa Berkas
        </button>
      );
    }
    return undefined;
  };

  return (
    <RoleLayout menuItems={SEKDES_MENU} userName="Siti Rahma" userRole="Sekretaris Desa">
      <PageHeader title="Verifikasi Pengajuan" description="Halaman antrean pengajuan pencairan dari Kaur Teknis." />


      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          type="button"
          className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'menunggu'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
          onClick={() => setActiveTab('menunggu')}
        >
          Menunggu Verifikasi
        </button>
        <button
          type="button"
          className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'diteruskan'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
          onClick={() => setActiveTab('diteruskan')}
        >
          Telah Diteruskan (Ke Kades)
        </button>
        <button
          type="button"
          className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'dikembalikan'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
          onClick={() => setActiveTab('dikembalikan')}
        >
          Dikembalikan (Revisi)
        </button>
      </div>

      <DataTable
        columns={COLUMNS}
        data={currentData}
        renderCell={renderCell}
      />
    </RoleLayout>
  );
}
