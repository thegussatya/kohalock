import PageHeader from '../../components/PageHeader';
import { useState } from 'react';
import { LayoutDashboard, BadgeCheck, ShieldAlert, QrCode, Settings, HelpCircle, BarChart3, History } from 'lucide-react';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Badge from '../../components/Badge';
import { toast } from 'react-hot-toast';
import { KADES_MENU } from './menu';



type HistoryRow = {
  id: string;
  waktu: string;
  transaksiId: string;
  status: string;
};

const DUMMY_HISTORY: HistoryRow[] = [
  { id: '1', waktu: '2023-10-05 14:30', transaksiId: 'TRX-9901-X', status: 'Terkunci Sementara' },
  { id: '2', waktu: '2023-09-12 09:15', transaksiId: 'TRX-8822-Y', status: 'Menunggu Audit BPD' },
];

const COLUMNS: TableColumn[] = [
  { key: 'waktu', label: 'Waktu Kejadian' },
  { key: 'transaksiId', label: 'ID Transaksi Terkait' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' },
];

export default function IntegrityShieldPage() {
  const [history, setHistory] = useState<HistoryRow[]>(DUMMY_HISTORY);
  const [showModal, setShowModal] = useState(false);

  const handleLockTransaction = () => {
    // Generate new dummy row and add to top of history
    const newRow: HistoryRow = {
      id: Date.now().toString(),
      waktu: new Date().toLocaleString('id-ID', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }),
      transaksiId: `TRX-${Math.floor(Math.random() * 10000)}-NEW`,
      status: 'Terkunci (Baru)',
    };
    
    setHistory([newRow, ...history]);
    setShowModal(false);
    toast.error('Intervensi berhasil ditolak & dicatat permanen di Blockchain');
  };

  const renderCell = (row: HistoryRow, columnKey: string) => {
    if (columnKey === 'aksi') {
      return (
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <span>📄</span> Unduh Sertifikat Penolakan
        </button>
      );
    }
    if (columnKey === 'status') {
      return (
        <Badge 
          label={row.status} 
          variant={row.status.includes('Menunggu') ? 'warning' : 'danger'} 
        />
      );
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
            onClick={() => setShowModal(true)}
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
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
              <p className="text-slate-800 font-semibold mb-2">
                Anda akan mengunci pos dana ini sementara.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tindakan ini akan dicatat secara permanen di Blockchain dan otomatis mengirimkan notifikasi audit darurat kepada BPD dan Tokoh Adat. Aksi ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold w-full sm:w-auto"
              >
                Batal
              </button>
              <button
                onClick={handleLockTransaction}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold shadow-md w-full sm:w-auto border-b-2 border-red-800"
              >
                Ya, Kunci Transaksi Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
