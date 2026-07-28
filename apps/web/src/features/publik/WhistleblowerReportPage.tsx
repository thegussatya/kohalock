import PageHeader from '../../components/PageHeader';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

import RoleLayout from '../../components/RoleLayout';
import { encryptReport } from '../../lib/crypto';
import { INSPEKTORAT_PUBLIC_KEY } from '../../lib/inspektoratKeys';
import { PUBLIK_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function WhistleblowerReportPage() {
  const [kronologi, setKronologi] = useState('');
  const [newTicket, setNewTicket] = useState<string | null>(null);
  
  const [searchTicket, setSearchTicket] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'found' | 'not-found'>('idle');
  const [searchStatusValue, setSearchStatusValue] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleKirimLaporan = async () => {
    if (!kronologi.trim()) return;

    setLoading(true);
    // 1. Generate ticketCode acak (WB-XXXXXX)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const ticketCode = `WB-${randomDigits}`;

    // 2. Encrypt isi textarea
    const encryptedPayload = encryptReport(kronologi, INSPEKTORAT_PUBLIC_KEY);

    try {
      // 3. Kirim POST ke backend
      await apiClient.post('/public/whistleblower', {
        ticketCode,
        encryptedPayload,
        attachmentUrls: []
      });

      // 4. Update UI untuk menampilkan tiket dan mereset form
      setNewTicket(ticketCode);
      setKronologi('');
      toast.success("Laporan terenkripsi berhasil dikirim");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim laporan, terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleCekStatus = async () => {
    if (!searchTicket.trim()) {
      setSearchStatus('idle');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get(`/public/whistleblower/${searchTicket}/status`);
      setSearchStatus('found');
      setSearchStatusValue(res.data.status);
    } catch (error: any) {
      setSearchStatus('not-found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout menuItems={PUBLIK_MENU} userName="Warga" userRole="Masyarakat">
      <div className="mb-6">
        <PageHeader title="Lapor Rahasia (Whistleblower)" description="Kirimkan laporan dugaan penyelewengan dana atau pelanggaran administratif. Sistem ini merombak teks Anda menjadi kode kriptografi yang mustahil dilacak oleh siapapun selain otoritas Inspektorat tingkat Kabupaten." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Kolom Kiri: Form Lapor */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative overflow-hidden">
            {/* Banner Aman */}
            <div className="absolute top-0 left-0 right-0 bg-green-600 text-white p-3 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Identitas Anda dijamin aman & terlindungi oleh sistem enkripsi.
            </div>

            <div className="mt-12">
              {newTicket ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Laporan Terkirim & Terenkripsi!</h3>
                  <p className="text-slate-600 mb-6">Simpan kode ini untuk melacak laporan Anda secara anonim:</p>
                  
                  <div className="text-3xl font-black text-green-700 tracking-widest bg-white py-4 px-6 rounded-lg border-2 border-dashed border-green-300 mb-6 inline-block">
                    {newTicket}
                  </div>
                  
                  <div>
                    <button 
                      onClick={() => setNewTicket(null)}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Kirim Laporan Baru
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kronologi Kejadian</label>
                  <textarea 
                    rows={6}
                    value={kronologi}
                    onChange={(e) => setKronologi(e.target.value)}
                    disabled={loading}
                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm resize-none mb-6 font-medium text-slate-700 disabled:opacity-50"
                    placeholder="Ceritakan sedetail mungkin apa yang Anda ketahui. (Contoh: Pada tanggal X, di Dusun Y, proyek jalan menggunakan aspal kualitas rendah...)"
                  ></textarea>

                  <button
                    onClick={handleKirimLaporan}
                    disabled={!kronologi.trim() || loading}
                    className="w-full px-6 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 uppercase tracking-wide text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                    {loading ? 'Mengenkripsi & Mengirim...' : 'Kirim Laporan Anonim'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pelacak Tiket */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Pelacak Tiket
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              Masukkan kode tiket <b>WB-XXXXXX</b> Anda untuk melihat status tindak lanjut tanpa perlu mengorbankan identitas pribadi.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full">
              <input 
                type="text" 
                value={searchTicket}
                onChange={(e) => {
                  setSearchTicket(e.target.value);
                  setSearchStatus('idle');
                }}
                disabled={loading}
                className="w-full sm:flex-grow p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-base font-bold tracking-wider uppercase bg-white placeholder-slate-400 disabled:opacity-50"
                placeholder="WB-123456"
              />
              <button
                onClick={handleCekStatus}
                disabled={loading}
                className="w-full sm:w-auto flex-shrink-0 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                Cek Status
              </button>
            </div>

            {/* Hasil Pelacakan */}
            {searchStatus === 'found' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <div className="mt-0.5 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Status Laporan: {searchStatusValue}</h4>
                  <p className="text-sm text-blue-800 mt-1 font-medium">Laporan Anda saat ini berada dalam sistem dan direkam secara transparan.</p>
                </div>
              </div>
            )}

            {searchStatus === 'not-found' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <div className="mt-0.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-red-900">Kode tiket tidak ditemukan</h4>
                  <p className="text-sm text-red-800 mt-1 font-medium">Pastikan Anda memasukkan format kode dengan benar (contoh: WB-123456).</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
