import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import PinModal from '../../components/PinModal';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { Undo2, AlertCircle } from 'lucide-react';

export default function CorrectionTransactionPage() {
  const [lockedEntries, setLockedEntries] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [jenis, setJenis] = useState<'KREDIT' | 'DEBIT'>('KREDIT');
  const [nominalKoreksi, setNominalKoreksi] = useState<string>('');
  const [uraian, setUraian] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLockedEntries();
  }, []);

  const fetchLockedEntries = async () => {
    try {
      const res = await apiClient.get('/koreksi/locked-entries');
      setLockedEntries(res.data);
    } catch (error: any) {
      toast.error('Gagal mengambil data entri terkunci');
    }
  };

  const handleConfirmCorrection = async (pin: string) => {
    try {
      setIsSubmitting(true);
      await apiClient.post('/koreksi', {
        targetEntryId: selectedEntryId,
        jenis,
        nominalKoreksi: nominalKoreksi.replace(/\D/g, ''),
        uraian,
        pin
      });
      toast.success('Transaksi koreksi berhasil dieksekusi dan dicatat!');
      setNominalKoreksi('');
      setUraian('');
      setSelectedEntryId('');
      fetchLockedEntries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengeksekusi koreksi');
    } finally {
      setIsSubmitting(false);
      setShowPinModal(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntryId) {
      toast.error('Pilih entri yang akan dikoreksi');
      return;
    }
    if (!nominalKoreksi || Number(nominalKoreksi.replace(/\D/g, '')) <= 0) {
      toast.error('Masukkan nominal koreksi yang valid');
      return;
    }
    if (!uraian) {
      toast.error('Uraian koreksi wajib diisi');
      return;
    }
    setShowPinModal(true);
  };

  return (
    <RoleLayout role="kaur-keuangan" menuItems={KAUR_KEUANGAN_MENU}>
      <PageHeader 
        title="Transaksi Koreksi" 
        description="Mencatat jurnal pembalik untuk mengoreksi entri bulan sebelumnya tanpa menghapus data asli" 
      />

      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-8 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>Peringatan Penting!</strong> Transaksi koreksi tidak akan menghapus data yang sudah terkunci, melainkan akan membuat entri "Jurnal Pembalik" baru di bulan berjalan untuk memastikan <em>audit trail</em> tetap terjaga 100%. Pastikan angka yang dimasukkan adalah nilai selisih yang perlu dikoreksi.
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Entri Transaksi yang Salah (Terkunci)</label>
            <select
              value={selectedEntryId}
              onChange={(e) => setSelectedEntryId(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium"
            >
              <option value="" disabled>-- Pilih Entri Terkunci --</option>
              {lockedEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  [{entry.bulan}/{entry.tahun}] {entry.uraian.substring(0, 50)}... | {Number(entry.penerimaan) > 0 ? `Penerimaan Rp ${Number(entry.penerimaan).toLocaleString('id-ID')}` : `Pengeluaran Rp ${Number(entry.pengeluaran).toLocaleString('id-ID')}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Koreksi</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as 'KREDIT' | 'DEBIT')}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium"
              >
                <option value="KREDIT">Jurnal Pembalik (Kredit / Penerimaan)</option>
                <option value="DEBIT">Jurnal Pembalik (Debit / Pengeluaran)</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                *Kredit untuk memulihkan dana keluar (kembali ke kas). Debit untuk mengurangi dana masuk berlebih.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nominal Koreksi (Selisih)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                <input
                  type="text"
                  value={nominalKoreksi}
                  onChange={(e) => {
                    const num = e.target.value.replace(/\D/g, '');
                    setNominalKoreksi(num ? Number(num).toLocaleString('id-ID') : '');
                  }}
                  className="w-full pl-12 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-800"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Uraian / Alasan Koreksi</label>
            <textarea
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Contoh: Koreksi kesalahan input Termin 1. Nominal seharusnya Rp 4.000.000 bukan Rp 40.000.000"
              rows={3}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold p-4 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Undo2 className="w-5 h-5" />
            Simpan Koreksi
          </button>
        </form>
      </div>

      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Otorisasi Koreksi"
        description="Masukkan PIN Anda untuk menyetujui transaksi koreksi jurnal pembalik ini secara kriptografis."
        onConfirm={handleConfirmCorrection}
        isLoading={isSubmitting}
      />
    </RoleLayout>
  );
}
