import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { CheckCircle2, AlertTriangle, ShieldAlert, Lock, Loader2 } from 'lucide-react';

export default function MonthlyClosingPage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [closingState, setClosingState] = useState<'idle' | 'hashing' | 'success'>('idle');

  const MONTHS = [
    { value: '08', label: 'Agustus 2023', locked: true },
    { value: '09', label: 'September 2023', locked: true },
    { value: '10', label: 'Oktober 2023', locked: false },
  ];

  const handleConfirmWarning = () => {
    setShowConfirmModal(false);
    setShowPinModal(true);
  };

  const handleConfirmPin = () => {
    setShowPinModal(false);
    setClosingState('hashing');
    setTimeout(() => {
      setClosingState('success');
      toast.success("Buku bulanan berhasil dikunci secara permanen");
    }, 2000);
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
        {MONTHS.map((m) => (
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
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Buku Kas Umum</p>
                <p className="text-xs text-green-600 font-semibold">Seimbang</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Buku Bank</p>
                <p className="text-xs text-green-600 font-semibold">Rekonsiliasi Cocok</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Buku Pajak</p>
                <p className="text-xs text-green-600 font-semibold">Lengkap</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowConfirmModal(true)} 
            className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-[0.98]"
          >
            <Lock className="w-6 h-6 text-slate-300" />
            Tutup & Kunci Buku Bulan Ini
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
          <h3 className="text-2xl md:text-3xl font-black text-green-900 mb-3">Buku Bulan Oktober 2023 Berhasil Dikunci</h3>
          <p className="text-green-700 mb-8 max-w-xl mx-auto">Seluruh transaksi bulan ini telah direkam secara permanen. Laporan bulan ini sekarang siap untuk dilaporkan ke struktur di atasnya.</p>
          
          <div className="bg-white p-5 rounded-xl border border-green-200 inline-block text-left w-full max-w-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cryptographic Hash Signature</p>
            </div>
            <p className="font-mono text-sm text-slate-700 break-all bg-slate-50 p-4 rounded-lg border border-slate-200 select-all">
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
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
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold"
              >
                Batal
              </button>
              <button
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
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Otorisasi PIN</h3>
            <p className="text-slate-600 text-sm mb-6">
              Masukkan 6 digit PIN Anda untuk memvalidasi penutupan buku.
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
                onClick={() => setShowPinModal(false)}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPin}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-sm"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
