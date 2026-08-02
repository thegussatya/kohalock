import PageHeader from '../../components/PageHeader';
import BackLink from '../../components/BackLink';
import { toast } from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import Badge from '../../components/Badge';
import MapWidget from '../../components/MapWidget';
import HashCheckerBadge from '../../components/HashCheckerBadge';
import { KADES_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import DocumentPreviewViewer from '../../components/DocumentPreviewViewer';

export default function DisbursementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectAlasan, setRejectAlasan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [data, setData] = useState<any>(null);
  const [sisaPagu, setSisaPagu] = useState<number>(0);
  const [interventionId, setInterventionId] = useState<string | null>(null);

  const fetchDisbursementData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiClient.get(`/disbursements/${id}`);
      setData(res.data);
      if (res.data.proposalId) {
        const resPagu = await apiClient.get(`/disbursements/sisa-pagu/${res.data.proposalId}`);
        setSisaPagu(Number(resPagu.data.sisaPagu));
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data pengajuan');
    }
  }, [id]);

  const fetchInterventionLog = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiClient.get('/interventions');
      const item = res.data.find((l: any) => l.disbursementId === id || l.disbursement?.id === id);
      if (item) {
        setInterventionId(item.id);
      }
    } catch (err) {
      console.error('Failed to fetch intervention log', err);
    }
  }, [id]);

  useEffect(() => {
    fetchDisbursementData();
  }, [fetchDisbursementData]);

  useEffect(() => {
    if (data?.status === 'REJECTED_SYSTEM') {
      fetchInterventionLog();
    }
  }, [data?.status, fetchInterventionLog]);

  if (!data) return <div className="p-8 text-center text-slate-500 font-bold">Memuat data...</div>;

  const judulUsulan = data.proposal?.judulUsulan || 'Program';
  const nominalDiajukan = Number(data.nominal);
  const nominalStr = nominalDiajukan.toLocaleString('id-ID');
  const namaKaur = data.proposal?.kaurTeknis?.nama || 'Kaur Teknis';
  const isMelebihi = nominalDiajukan > sisaPagu;

  const handleDownloadSertifikat = async (certId: string) => {
    try {
      const res = await apiClient.get(`/interventions/${certId}/certificate`);
      if (res.data && res.data.pdfUrl) {
        window.open(res.data.pdfUrl, '_blank');
      } else {
        toast.error('Gagal memuat sertifikat');
      }
    } catch (error) {
      toast.error('Gagal mengunduh sertifikat');
    }
  };

  const handleLockTransaction = async () => {
    if (!id) return;
    setIsRejecting(true);
    try {
      const res = await apiClient.post(`/disbursements/${id}/reject-intervention`, {
        alasan: rejectAlasan || 'Intervensi non-prosedural (darurat)',
      });

      if (res.data?.log?.id) {
        setInterventionId(res.data.log.id);
      }
      
      toast.success('Intervensi berhasil ditolak & dicatat permanen di Blockchain');
      setShowRejectModal(false);
      await fetchDisbursementData();
      await fetchInterventionLog();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menolak transaksi');
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadge = () => {
    switch (data.status) {
      case 'PENDING_KADES':
        return <Badge label="Menunggu Otorisasi Kades" variant="warning" />;
      case 'REJECTED_SYSTEM':
        return <Badge label="Intervensi Ditolak (Locked)" variant="danger" />;
      case 'PENDING_EKSEKUSI':
        return <Badge label="Diotorisasi Kades" variant="success" />;
      case 'DISBURSED':
        return <Badge label="Sudah Dicairkan" variant="success" />;
      default:
        return <Badge label={data.status} variant="neutral" />;
    }
  };

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <div className="mb-6">
        <BackLink to="/kades/persetujuan-pencairan" label="Kembali ke Daftar Pengajuan" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge label={id || 'TRX-XYZ'} variant="info" />
              {getStatusBadge()}
            </div>
            <PageHeader title={judulUsulan} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Detail Pengajuan & Ringkasan */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Status Pagu Anggaran (Diadopsi dari Sekdes) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Status Pagu Anggaran
            </h3>
            <p className="text-lg font-bold text-slate-800">
              Sisa Pagu: <span className="text-green-600">Rp {sisaPagu.toLocaleString('id-ID')}</span> <span className="text-slate-400 font-normal">vs</span> Diajukan: <span className={isMelebihi ? "text-red-600" : "text-blue-600"}>Rp {nominalStr}</span>
            </p>
            {isMelebihi && (
              <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                ⚠️ Pengajuan melebihi sisa pagu anggaran berjalan.
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-700">Kaur Teknis: {namaKaur}</p>
              <p className="text-xs text-slate-600 mt-2 italic">"{data.keterangan}"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Status Otentikasi
              </h3>
              <HashCheckerBadge isValid={true} />
              <p className="text-xs text-slate-500 mt-3">
                Hash dokumen cocok dengan metadata di blockchain.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Lokasi Geo-Tagging
              </h3>
              <div className="flex-1 min-h-[200px]">
                <MapWidget 
                  latitude={data.geotagLat} 
                  longitude={data.geotagLng} 
                  photoUrl={data.fotoUrl || "https://images.unsplash.com/photo-1541888086925-9276d418296a?q=80&w=600&auto=format&fit=crop"}
                  popupText={data.keterangan || "Lokasi Proyek"}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Ringkasan Pemeriksaan Dokumen
            </h2>

            <DocumentPreviewViewer 
              fotoUrl={data.fotoUrl} 
              beritaAcaraUrl={data.beritaAcaraUrl} 
              lpjUrl={data.lpjUrl} 
            />

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
                <p className="text-xs text-slate-400">{data.submittedAt ? new Date(data.submittedAt).toLocaleDateString('id-ID') : '-'}</p>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 ring-4 ring-slate-50"></div>
                <h4 className="text-sm font-bold text-slate-900">Sekretaris Desa</h4>
                <p className="text-xs font-semibold text-slate-500 mb-1">Memverifikasi Dokumen & Geotagging</p>
                <p className="text-xs text-slate-400">{data.verifiedAt ? new Date(data.verifiedAt).toLocaleDateString('id-ID') : 'Selesai'}</p>
              </div>

              <div className="relative pl-6">
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${data.status === 'REJECTED_SYSTEM' ? 'bg-rose-500' : data.status === 'PENDING_EKSEKUSI' || data.status === 'DISBURSED' ? 'bg-green-500' : 'bg-slate-300'} ring-4 ring-slate-50`}></div>
                <h4 className="text-sm font-bold text-slate-900">Kepala Desa</h4>
                <p className="text-xs font-semibold text-slate-500">
                  {data.status === 'REJECTED_SYSTEM' 
                    ? 'Intervensi Ditolak (Tolak Intervensi)' 
                    : data.status === 'PENDING_EKSEKUSI' || data.status === 'DISBURSED' 
                    ? 'Sudah Diotorisasi' 
                    : 'Menunggu Tanda Tangan Final'}
                </p>
              </div>

            </div>

            {data.status === 'PENDING_KADES' ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wide text-xs sm:text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Otorisasi Pencairan (Tanda Tangan Digital)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectAlasan('');
                    setShowRejectModal(true);
                  }}
                  className="w-full px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wide text-xs sm:text-sm border-b-2 border-rose-800"
                >
                  <ShieldAlert className="w-5 h-5" />
                  Tolak Intervensi Non-Prosedural
                </button>
              </div>
            ) : data.status === 'REJECTED_SYSTEM' ? (
              <div className="flex flex-col gap-3">
                <div className="w-full px-4 py-3 bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center justify-center gap-2 uppercase tracking-wide text-xs text-center">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Transaksi Dibekukan (Intervensi Ditolak)
                </div>
                {interventionId && (
                  <button
                    type="button"
                    onClick={() => handleDownloadSertifikat(interventionId)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    <span>📄</span> Unduh Sertifikat Penolakan
                  </button>
                )}
              </div>
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
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-sm"
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
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Memproses...' : 'Tanda Tangani'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Tolak Intervensi Non-Prosedural */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-rose-300 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-rose-600 mb-3 flex items-center gap-3">
              <span className="p-2 bg-rose-100 rounded-full">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </span>
              Tolak Intervensi Non-Prosedural
            </h3>

            <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-xl mb-5 text-rose-900 text-sm font-semibold">
              Anda akan mengunci pos dana ini sementara. Tindakan ini akan dicatat permanen.
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <p className="text-slate-800 font-semibold text-xs uppercase tracking-wider mb-2">
                Alasan Penolakan / Intervensi (Opsional):
              </p>
              <textarea
                className="w-full p-3 border border-slate-300 rounded-xl mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                rows={3}
                placeholder="Deskripsikan bentuk intervensi jika perlu..."
                value={rejectAlasan}
                onChange={(e) => setRejectAlasan(e.target.value)}
              ></textarea>
              
              <p className="text-slate-500 text-xs leading-relaxed mt-2">
                Tindakan ini akan dicatat secara permanen di Blockchain dan otomatis mengirimkan notifikasi audit darurat kepada BPD dan Tokoh Adat. Aksi ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                disabled={isRejecting}
                className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold w-full sm:w-auto disabled:opacity-50 text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLockTransaction}
                disabled={isRejecting}
                className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-bold shadow-md w-full sm:w-auto border-b-2 border-rose-800 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {isRejecting ? 'Memproses...' : 'Ya, Kunci Transaksi Ini'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
