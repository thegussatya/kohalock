import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal Otorisasi' },
  { key: 'program', label: 'Nama Program' },
  { key: 'nominal', label: 'Nominal' },
  { key: 'kades', label: 'Nama Kades Pengotorisasi' },
  { key: 'aksi', label: 'Aksi' },
];

export default function ExecutionQueuePage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = () => {
    apiClient.get('/disbursements/execution-queue').then(res => {
      const formatted = res.data.map((item: any) => ({
        id: item.id,
        tanggal: item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString('id-ID') : new Date(item.submittedAt).toLocaleDateString('id-ID'),
        program: item.proposal?.judulUsulan || '-',
        nominal: `Rp ${Number(item.nominal).toLocaleString('id-ID')}`,
        kades: item.kadesApprover?.nama || '-'
      }));
      setData(formatted);
    }).catch(err => {
      console.error(err);
      toast.error('Gagal mengambil antrean eksekusi');
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case 'tanggal':
        return <span className="text-slate-600">{row.tanggal}</span>;
      case 'program':
        return <span className="font-semibold text-slate-900">{row.program}</span>;
      case 'nominal':
        return <span className="font-bold text-slate-900">{row.nominal}</span>;
      case 'kades':
        return <span className="text-slate-600">{row.kades}</span>;
      case 'aksi':
        return (
          <button
            onClick={() => {
              setSelectedTx(row);
              setShowConfirmModal(true);
            }}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Eksekusi & Catat
          </button>
        );
      default:
        return row[columnKey];
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
        title="Antrean Eksekusi Dana" 
        description="Transaksi yang telah diotorisasi Kades, menunggu eksekusi pemindahan dana riil" 
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={COLUMNS}
          data={data}
          renderCell={renderCell}
        />
      </div>

      {/* Konfirmasi Modal */}
      {showConfirmModal && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Eksekusi Dana</h3>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              Anda akan mengeksekusi dana sebesar <strong className="text-slate-900">{selectedTx.nominal}</strong> untuk <strong className="text-slate-900">{selectedTx.program}</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowModal(true);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-sm"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Otorisasi PIN</h3>
            <p className="text-slate-600 text-sm mb-6">
              Masukkan 6 digit PIN Anda untuk mengeksekusi dan mencatat transaksi ke Buku Kas Umum.
            </p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-10 h-12 border-2 border-slate-300 rounded-lg flex items-center justify-center text-xl font-bold text-slate-900 bg-slate-50">
                  •
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold"
              >
                Batal
              </button>
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  if (isSubmitting || !selectedTx) return;
                  setIsSubmitting(true);
                  try {
                    await apiClient.post(`/disbursements/${selectedTx.id}/execute`);
                    setShowModal(false);
                    toast.success("Dana berhasil dieksekusi & otomatis tercatat ke Buku Kas Umum");
                    fetchData();
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || "Gagal melakukan eksekusi");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}

