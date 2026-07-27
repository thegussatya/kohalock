import PageHeader from '../../components/PageHeader';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FileCheck, PieChart, MessageCircle, HelpCircle, History } from 'lucide-react';
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
  { key: 'checkbox', label: '' },
  { key: 'tanggalMasuk', label: 'Tanggal Masuk' },
  { key: 'namaProgram', label: 'Nama Program' },
  { key: 'namaKaur', label: 'Nama Kaur Pengaju' },
  { key: 'nominal', label: 'Nominal Pengajuan' },
  { key: 'aksi', label: 'Aksi' },
];

type TabType = 'menunggu' | 'diteruskan' | 'dikembalikan';

export default function VerificationQueuePage() {
  const [activeTab, setActiveTab] = useState<TabType>('menunggu');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderCell = (row: QueueData, columnKey: string) => {
    if (columnKey === 'checkbox') {
      // Only show checkboxes for 'menunggu' tab where verification is possible
      if (activeTab !== 'menunggu') return null;
      return (
        <input 
          type="checkbox" 
          checked={selectedIds.includes(row.id)}
          onChange={() => toggleSelect(row.id)}
          className="w-4 h-4 text-brand-600 bg-slate-100 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
        />
      );
    }
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
          onClick={() => {
            setActiveTab('dikembalikan');
            setSelectedIds([]); // clear selection on tab change
          }}
        >
          Dikembalikan (Revisi)
        </button>
      </div>

      {/* Bulk Action Toolbar */}
      {activeTab === 'menunggu' && selectedIds.length > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-4 flex justify-between items-center shadow-sm">
          <span className="text-sm font-semibold text-brand-800">{selectedIds.length} item dipilih</span>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-100 transition-colors shadow-sm"
          >
            Verifikasi Semua yang Dipilih
          </button>
        </div>
      )}

      {/* Table Content */}
      <DataTable
        columns={activeTab === 'menunggu' ? COLUMNS : COLUMNS.filter(c => c.key !== 'checkbox')}
        data={currentData}
        renderCell={renderCell}
      />

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center transform transition-all">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Verifikasi</h3>
            <p className="text-sm text-slate-600 mb-6">
              Verifikasi {selectedIds.length} pengajuan sekaligus?
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex-1"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  toast.success(`${selectedIds.length} pengajuan berhasil diverifikasi`);
                  setSelectedIds([]);
                  setShowModal(false);
                }}
                className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors flex-1 shadow-sm"
              >
                Ya, Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
