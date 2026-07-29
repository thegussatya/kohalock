import PageHeader from '../../components/PageHeader';
import { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Badge from '../../components/Badge';
import { toast } from 'react-hot-toast';
import { KADES_MENU } from './menu';
import apiClient from '../../lib/apiClient';

type HistoryRow = {
  id: string;
  waktu: string;
  transaksiId: string;
  proposal: string;
  status: string;
};

const COLUMNS: TableColumn[] = [
  { key: 'waktu', label: 'Waktu Kejadian' },
  { key: 'transaksiId', label: 'TX Hash' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'aksi', label: 'Aksi' },
];

export default function IntegrityShieldPage() {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Data for the form
  const [pendingDisbursements, setPendingDisbursements] = useState<any[]>([]);
  const [selectedDisbursement, setSelectedDisbursement] = useState('');
  const [alasan, setAlasan] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/interventions');
      const formatted = res.data.map((item: any) => ({
        id: item.id,
        waktu: new Date(item.createdAt).toLocaleString('id-ID'),
        transaksiId: item.txHash,
        proposal: item.disbursement?.proposal?.judulUsulan || '-',
        status: 'REJECTED_SYSTEM',
      }));
      setHistory(formatted);
    } catch (error) {
      console.error('Failed to fetch interventions', error);
    }
  };

  const fetchPendingDisbursements = async () => {
    try {
      const res = await apiClient.get('/disbursements?status=PENDING_KADES');
      setPendingDisbursements(res.data);
    } catch (error) {
      console.error('Failed to fetch pending disbursements', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openModal = () => {
    fetchPendingDisbursements();
    setAlasan('');
    setSelectedDisbursement('');
    setShowModal(true);
  };

  const handleLockTransaction = async () => {
    if (!selectedDisbursement) {
      toast.error('Pilih transaksi yang ingin dibekukan');
      return;
    }
    
    setIsLoading(true);
    try {
      await apiClient.post(`/disbursements/${selectedDisbursement}/reject-intervention`, {
        alasan: alasan || 'Intervensi non-prosedural (darurat)',
      });
      
      toast.success('Intervensi berhasil ditolak & dicatat permanen di Blockchain');
      setShowModal(false);
      fetchHistory(); // refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menolak transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSertifikat = async (id: string) => {
    try {
      const res = await apiClient.get(`/interventions/${id}/certificate`);
      if (res.data && res.data.pdfUrl) {
        window.open(res.data.pdfUrl, '_blank');
      } else {
        toast.error('Gagal memuat sertifikat');
      }
    } catch (error) {
      toast.error('Gagal mengunduh sertifikat');
    }
  };

  const renderCell = (row: HistoryRow, columnKey: string) => {
    if (columnKey === 'aksi') {
      return (
        <button
          type="button"
          onClick={() => handleDownloadSertifikat(row.id)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <span>📄</span> Unduh Sertifikat
        </button>
      );
    }
    if (columnKey === 'status') {
      return <Badge label={row.status} variant="danger" />;
    }
    return undefined;
  };

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <div className="mb-8">
        <PageHeader title="Perisai Integritas" description="Fitur darurat (Panic Button) eksklusif untuk Kepala Desa. Gunakan untuk mencatat dan membekukan transaksi non-prosedural ke dalam sistem secara permanen tanpa bisa dihapus (Immutable Log)." />
      </div>

      <div className="mb-12 bg-red-50/80 border border-red-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-red-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-200">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Intervensi Non-Prosedural?</h2>
          <p className="text-slate-700 max-w-xl mb-8 font-medium leading-relaxed">
            Gunakan tombol merah di bawah ini HANYA jika Anda menerima tekanan, ancaman, atau paksaan untuk menyetujui pencairan dana di luar prosedur tata kelola yang berlaku.
          </p>
          <button
            onClick={openModal}
            className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 uppercase tracking-wide text-base md:text-lg w-full md:w-auto flex items-center justify-center gap-2 border-b-4 border-red-800 leading-tight"
          >
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Tolak Intervensi Non-Prosedural
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Riwayat Penolakan Sistemik</h3>
        <DataTable
          columns={COLUMNS}
          data={history}
          renderCell={renderCell}
        />
      </div>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-red-300 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-red-600 mb-4 flex items-center gap-3">
              <span className="p-2 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </span>
              Peringatan Kritis
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <p className="text-slate-800 font-semibold mb-2">
                Pilih Transaksi yang akan dibekukan:
              </p>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg mb-4 text-sm"
                value={selectedDisbursement}
                onChange={(e) => setSelectedDisbursement(e.target.value)}
              >
                <option value="">-- Pilih Pengajuan Pencairan (Menunggu Kades) --</option>
                {pendingDisbursements.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.proposal?.judulUsulan} (Rp {d.nominal?.toString()})
                  </option>
                ))}
              </select>
              
              <p className="text-slate-800 font-semibold mb-2">
                Alasan Penolakan / Intervensi (Opsional):
              </p>
              <textarea
                className="w-full p-2 border border-slate-300 rounded-lg mb-2 text-sm"
                rows={3}
                placeholder="Deskripsikan bentuk intervensi jika perlu..."
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
              ></textarea>
              
              <p className="text-slate-600 text-xs leading-relaxed mt-2">
                Tindakan ini akan dicatat secara permanen di Blockchain dan otomatis mengirimkan notifikasi audit darurat kepada BPD dan Tokoh Adat. Aksi ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold w-full sm:w-auto disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleLockTransaction}
                disabled={isLoading}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold shadow-md w-full sm:w-auto border-b-2 border-red-800 disabled:opacity-50"
              >
                {isLoading ? 'Memproses...' : 'Ya, Kunci Transaksi Ini'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
