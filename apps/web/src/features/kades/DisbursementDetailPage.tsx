import PageHeader from '../../components/PageHeader';
import BackLink from '../../components/BackLink';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { LayoutDashboard, BadgeCheck, ShieldAlert, QrCode, Settings, AlertTriangle, HelpCircle, History, BarChart3 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import Badge from '../../components/Badge';
import { KADES_MENU } from './menu';
import apiClient from '../../lib/apiClient';



export default function DisbursementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      apiClient.get(`/disbursements/${id}`).then(res => {
        setData(res.data);
      }).catch(err => {
        console.error(err);
        toast.error('Gagal mengambil data pengajuan');
      });
    }
  }, [id]);

  if (!data) return <div className="p-8 text-center text-slate-500 font-bold">Memuat data...</div>;

  const judulUsulan = data.proposal?.judulUsulan || 'Program';
  const nominalStr = Number(data.nominal).toLocaleString('id-ID');
  const namaKaur = data.proposal?.kaurTeknis?.nama || 'Kaur Teknis';

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <div className="mb-6">
        <BackLink to="/kades/persetujuan-pencairan" label="Kembali ke Daftar Pengajuan" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge label={id || 'TRX-XYZ'} variant="info" />
              <Badge 
                label={
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Siap Dicairkan
                  </span>
                } 
                variant="success" 
              />
            </div>
            <PageHeader title={judulUsulan} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Ringkasan Pemeriksaan */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Ringkasan Pemeriksaan Dokumen
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Bukti Foto Geotagging</h4>
                  <p className="text-sm font-semibold text-green-600">Ada & Valid</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Hash Berita Acara</h4>
                  <p className="text-sm font-semibold text-green-600">Dokumen Otentik</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-5 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-1">Total Pencairan Diajukan</span>
                <span className="text-2xl font-black text-blue-900">Rp {nominalStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Chain of Trust & Action */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Log Persetujuan Berantai
            </h3>

            <div className="relative border-l-2 border-slate-200 ml-3 mb-8 space-y-6">
              
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-slate-50"></div>
                <h4 className="text-sm font-bold text-slate-900">{namaKaur} (Kaur Teknis)</h4>
                <p className="text-xs font-semibold text-slate-500 mb-1">Mengajukan Pencairan</p>
                <p className="text-xs text-slate-400">{new Date(data.submittedAt).toLocaleDateString('id-ID')}</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 ring-4 ring-slate-50"></div>
                <h4 className="text-sm font-bold text-slate-900">Sekretaris Desa</h4>
                <p className="text-xs font-semibold text-slate-500 mb-1">Memverifikasi Dokumen & Geotagging</p>
                <p className="text-xs text-slate-400">{data.verifiedAt ? new Date(data.verifiedAt).toLocaleDateString('id-ID') : 'Selesai'}</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-slate-50"></div>
                <h4 className="text-sm font-bold text-slate-400">Kepala Desa</h4>
                <p className="text-xs font-semibold text-slate-400">Menunggu Tanda Tangan Final</p>
              </div>

            </div>

            {data.status === 'PENDING_KADES' ? (
              <button 
                onClick={() => setShowConfirmModal(true)}
                className="w-full px-5 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Otorisasi Pencairan (Tanda Tangan Digital)
              </button>
            ) : (
              <div className="w-full px-5 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-2 uppercase tracking-wide text-sm text-center">
                Pengajuan sudah diproses
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Konfirmasi Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Pencairan Dana</h3>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              Anda akan mencairkan dana sebesar <strong className="text-slate-900">Rp {nominalStr}</strong> untuk program <strong className="text-slate-900">{judulUsulan}</strong>. Setelah diotorisasi, transaksi akan diteruskan ke Kaur Keuangan untuk eksekusi pemindahan dana riil.
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
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold shadow-sm"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Otorisasi Eksekutif</h3>
            <p className="text-slate-600 text-sm mb-6">
              Masukkan 6 digit PIN untuk menandatangani persetujuan ini dan mencatatnya ke Blockchain.
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
                  if (isSubmitting) return;
                  setIsSubmitting(true);
                  try {
                    await apiClient.post(`/disbursements/${id}/authorize`);
                    setShowModal(false);
                    toast.success("Berhasil diotorisasi & diteruskan ke Kaur Keuangan untuk eksekusi");
                    navigate("/kades/persetujuan-pencairan");
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || "Gagal melakukan otorisasi");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Memproses...' : 'Tanda Tangani'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
