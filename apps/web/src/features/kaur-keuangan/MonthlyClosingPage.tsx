import { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PinModal from '../../components/PinModal';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { CheckCircle2, AlertTriangle, ShieldAlert, Lock, Loader2 } from 'lucide-react';
import apiClient from '../../lib/apiClient';

export default function MonthlyClosingPage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [closingState, setClosingState] = useState<'idle' | 'hashing' | 'success'>('idle');
  const [months, setMonths] = useState<any[]>([]);
  const [validations, setValidations] = useState<any>(null);
  const [currentOpenMonth, setCurrentOpenMonth] = useState<any>(null);
  const [saldoAktual, setSaldoAktual] = useState('');
  const [isReconciling, setIsReconciling] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await apiClient.get('/monthly-closing/status');
      setMonths(res.data.months);
      setValidations(res.data.validations);
      setCurrentOpenMonth(res.data.currentOpenMonth);
    } catch (err) {
      toast.error('Gagal mengambil status penutupan buku');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleReconcile = async () => {
    if (!currentOpenMonth || !saldoAktual) return;
    setIsReconciling(true);
    try {
      await apiClient.post('/bank-book/reconcile', {
        bulan: currentOpenMonth.bulan,
        tahun: currentOpenMonth.tahun,
        saldoAktualBank: saldoAktual
      });
      toast.success('Rekonsiliasi bank berhasil');
      setSaldoAktual('');
      await fetchStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal melakukan rekonsiliasi');
    } finally {
      setIsReconciling(false);
    }
  };

  const handleConfirmWarning = () => {
    setShowConfirmModal(false);
    setShowPinModal(true);
  };

  const handleConfirmPin = async (pinStr: string) => {
    if (pinStr.length !== 6) {
      toast.error("PIN harus 6 digit");
      return;
    }
    setShowPinModal(false);
    setClosingState('hashing');
    
    try {
      const res = await apiClient.post('/monthly-closing/close', {
        bulan: currentOpenMonth.bulan,
        tahun: currentOpenMonth.tahun,
        pin: pinStr
      });
      
      setClosingState('success');
      toast.success("Buku bulanan berhasil dikunci secara permanen");
      setCurrentOpenMonth({ ...currentOpenMonth, hashKunci: res.data.hashKunci });
      fetchStatus();
    } catch (err: any) {
      setClosingState('idle');
      toast.error(err.response?.data?.error || "Gagal mengunci buku");
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
        title="Penutupan Buku Bulanan" 
        description="Kunci data bulan berjalan secara permanen menggunakan hash kriptografi sebelum melangkah ke pelaporan" 
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {months.map((m) => (
          <div 
            key={m.value} 
            className={`p-5 rounded-2xl flex flex-col justify-center gap-3 ${
              m.locked 
                ? 'bg-slate-50 border border-slate-200 opacity-70' 
                : 'bg-blue-50 border-2 border-blue-500 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-bold ${m.locked ? 'text-slate-600' : 'text-blue-900'}`}>{m.label}</span>
              {m.locked ? (
                <Badge variant="success" label="Sudah Terkunci" />
              ) : (
                <Badge variant="warning" label="Terbuka" />
              )}
            </div>
            {!m.locked && closingState === 'success' && (
              <Badge variant="success" label="Baru Saja Dikunci" />
            )}
          </div>
        ))}
      </div>

      {closingState === 'idle' && (
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${validations?.kasSeimbang ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {validations?.kasSeimbang ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Buku Kas Umum</p>
                <p className={`text-xs font-semibold ${validations?.kasSeimbang ? 'text-green-600' : 'text-red-600'}`}>{validations?.kasSeimbang ? 'Seimbang' : 'Tidak Seimbang'}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${validations?.bankCocok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {validations?.bankCocok ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Buku Bank</p>
                <p className={`text-xs font-semibold ${validations?.bankCocok ? 'text-green-600' : 'text-red-600'}`}>{validations?.bankCocok ? 'Rekonsiliasi Cocok' : 'Selisih'}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${validations?.pajakLengkap ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {validations?.pajakLengkap ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Buku Pajak</p>
                <p className={`text-xs font-semibold ${validations?.pajakLengkap ? 'text-green-600' : 'text-red-600'}`}>{validations?.pajakLengkap ? 'Lengkap' : 'Tidak Lengkap'}</p>
              </div>
            </div>
          </div>

          {!validations?.bankCocok && currentOpenMonth && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8 shadow-sm">
              <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Butuh Rekonsiliasi Bank
              </h3>
              <p className="text-sm text-red-700 mb-4">
                Saldo akhir Buku Bank tidak sama dengan saldo Buku Kas. Silakan masukkan Saldo Aktual Bank (sesuai rekening koran) untuk melakukan penyesuaian.
              </p>
              <div className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-red-800 mb-1">Saldo Aktual Bank (Rp)</label>
                  <input 
                    type="number" 
                    value={saldoAktual}
                    onChange={(e) => setSaldoAktual(e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    placeholder="Contoh: 15000000"
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  />
                </div>
                <button 
                  onClick={handleReconcile}
                  disabled={isReconciling || !saldoAktual}
                  className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 h-[42px]"
                >
                  {isReconciling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Rekonsiliasi
                </button>
              </div>
            </div>
          )}

          <button 
            type="button"
            onClick={() => setShowConfirmModal(true)} 
            disabled={!validations?.kasSeimbang || !validations?.bankCocok || !currentOpenMonth}
            className={`w-full py-5 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-[0.98] ${
              !validations?.kasSeimbang || !validations?.bankCocok || !currentOpenMonth
                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-6 h-6 text-slate-300" />
            Tutup & Kunci Buku Bulan {currentOpenMonth?.label || 'Ini'}
          </button>
        </div>
      )}

      {closingState === 'hashing' && (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
          <p className="text-lg font-bold text-slate-700">Menghitung hash kriptografi...</p>
          <p className="text-sm text-slate-500 mt-2">Menyegel transaksi ke dalam ledger block...</p>
        </div>
      )}

      {closingState === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 md:p-12 text-center shadow-sm animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-green-900 mb-3">Buku Bulan {currentOpenMonth?.label || 'Ini'} Berhasil Dikunci</h3>
          <p className="text-green-700 mb-8 max-w-xl mx-auto">Seluruh transaksi bulan ini telah direkam secara permanen. Laporan bulan ini sekarang siap untuk dilaporkan ke struktur di atasnya.</p>
          
          <div className="bg-white p-5 rounded-xl border border-green-200 inline-block text-left w-full max-w-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cryptographic Hash Signature</p>
            </div>
            <p className="font-mono text-sm text-slate-700 break-all bg-slate-50 p-4 rounded-lg border border-slate-200 select-all">
              {currentOpenMonth?.hashKunci || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </p>
          </div>
        </div>
      )}

      {/* Konfirmasi Warning Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Peringatan Penguncian</h3>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              Setelah dikunci, data bulan ini <strong className="text-red-600">TIDAK DAPAT</strong> diubah/dihapus. Koreksi hanya bisa dilakukan lewat Transaksi Koreksi baru.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmWarning}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-bold shadow-sm"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Otorisasi PIN"
        description="Masukkan 6 digit PIN Anda untuk memvalidasi penutupan buku."
        onConfirm={handleConfirmPin}
      />
    </RoleLayout>
  );
}
