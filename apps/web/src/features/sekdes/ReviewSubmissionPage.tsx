import PageHeader from '../../components/PageHeader';
import BackLink from '../../components/BackLink';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ShieldAlert } from 'lucide-react';
import RoleLayout from '../../components/RoleLayout';
import PinModal from '../../components/PinModal';
import MapWidget from '../../components/MapWidget';
import DocumentPreviewViewer from '../../components/DocumentPreviewViewer';
import { SEKDES_MENU } from './menu';
import apiClient from '../../lib/apiClient';



export default function ReviewSubmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinActionType, setPinActionType] = useState<'VERIFY' | 'RETURN_REVISION' | null>(null);
  const [showRevisiModal, setShowRevisiModal] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [data, setData] = useState<any>(null);
  const [sisaPagu, setSisaPagu] = useState<number>(0);
  const [catatanRevisi, setCatatanRevisi] = useState('');
  const [isPanicking, setIsPanicking] = useState(false);

  useEffect(() => {
    if (id) {
      apiClient.get(`/disbursements/${id}`).then(res => {
        setData(res.data);
        if (res.data.proposalId) {
          apiClient.get(`/disbursements/sisa-pagu/${res.data.proposalId}`).then(resPagu => {
            setSisaPagu(Number(resPagu.data.sisaPagu));
          });
        }
      }).catch(err => {
        console.error(err);
        toast.error('Gagal mengambil data pengajuan');
      });
    }
  }, [id]);

  if (!data) return <div className="p-8 text-center text-slate-500 font-bold">Memuat data...</div>;

  const nominalDiajukan = Number(data.nominal);
  const isMelebihi = nominalDiajukan > sisaPagu;

  return (
    <RoleLayout menuItems={SEKDES_MENU} userName="Siti Rahma" userRole="Sekretaris Desa">
      <div className="flex justify-between items-center mb-6">
        <div>
          <BackLink to="/sekdes/verifikasi" label="Kembali ke Antrean Verifikasi" />
          <PageHeader title={`Pemeriksaan Berkas #${id}`} />
        </div>
      </div>

      {/* Template Download Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-blue-900 text-sm">Butuh Template Pengembalian Berkas?</h4>
          <p className="text-xs text-blue-700 mt-1">Unduh template pengembalian jika berkas yang diajukan perlu direvisi.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <a 
            href="/templates/Template Pengembalian Berkas Pencairan Dana yang Diajukan.docx" 
            download 
            className="flex items-center gap-2 px-3 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Template Pengembalian Berkas
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Kolom Kiri */}
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Status Pagu Anggaran
            </h3>
            <p className="text-lg font-bold text-slate-800">
              Sisa Pagu: <span className="text-green-600">Rp {sisaPagu.toLocaleString('id-ID')}</span> <span className="text-slate-400 font-normal">vs</span> Diajukan: <span className={isMelebihi ? "text-red-600" : "text-blue-600"}>Rp {nominalDiajukan.toLocaleString('id-ID')}</span>
            </p>
            {isMelebihi && (
              <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                ⚠️ Pengajuan melebihi sisa pagu anggaran berjalan. Mohon periksa dengan teliti.
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-700">Program: {data.proposal?.judulUsulan}</p>
              <p className="text-xs text-slate-500 mt-1">Operator Desa: {data.proposal?.kaurTeknis?.nama}</p>
              <p className="text-xs text-slate-600 mt-2 italic">"{data.keterangan}"</p>
            </div>
          </div>


          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Lokasi Titik Koordinat (Geo-Tagging)
            </h3>
            <MapWidget 
              latitude={data.geotagLat} 
              longitude={data.geotagLng} 
              popupText={data.keterangan || "Lokasi Proyek"}
            />
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 h-[800px] lg:h-full min-h-[600px] shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Pemeriksaan Dokumen
            </h3>
            
            <div className="flex-grow flex flex-col overflow-y-auto">
              <DocumentPreviewViewer 
                fotoUrl={data.fotoUrl}
                beritaAcaraUrl={data.beritaAcaraUrl} 
                lpjTeknisUrl={data.lpjTeknisUrl} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aksi Bawah */}
      {data.status === 'PENDING_SEKDES' && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 border-t border-slate-200 pt-8 pb-4">
          <button 
            type="button"
            onClick={() => setShowPanicModal(true)}
            disabled={isPanicking}
            className="w-full sm:w-auto px-6 py-3.5 bg-red-600 text-white font-bold rounded-lg shadow-sm hover:bg-red-700 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
          >
            <ShieldAlert className="w-5 h-5" />
            {isPanicking ? "Membekukan..." : "Bekukan (Panic Button)"}
          </button>
          <button
            type="button"
            onClick={() => setShowRevisiModal(true)}
            className="px-8 py-3.5 bg-yellow-500 text-white font-bold rounded-lg shadow-sm hover:bg-yellow-600 transition-all text-sm uppercase tracking-wide"
          >
            Kembalikan untuk Revisi
          </button>
          <button
            type="button"
            onClick={() => {
              setPinActionType('VERIFY');
              setShowPinModal(true);
            }}
            className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-lg shadow-sm hover:bg-green-700 transition-all text-sm uppercase tracking-wide flex-grow sm:flex-grow-0"
          >
            Verifikasi & Teruskan ke Kades
          </button>
        </div>
      )}

      {/* Jika bukan PENDING_SEKDES, beri info */}
      {data.status !== 'PENDING_SEKDES' && (
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <p className="text-sm font-bold text-slate-500">Mode Read-Only: Berkas ini sudah diverifikasi atau dikembalikan.</p>
        </div>
      )}

      {/* Modal PIN */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPin('');
        }}
        title="Tanda Tangan Digital"
        description="Masukkan 6 digit PIN rahasia Anda untuk memberikan persetujuan (approval) yang akan dicatat permanen ke dalam sistem."
        onConfirm={async (pin) => {
          try {
            if (pinActionType === 'VERIFY') {
              await apiClient.post(`/disbursements/${id}/verify`, { pin });
              toast.success("Berhasil diverifikasi & diteruskan ke Kades");
            } else if (pinActionType === 'RETURN_REVISION') {
              await apiClient.post(`/disbursements/${id}/return-revision`, { catatan: catatanRevisi, pin });
              toast("Pengajuan dikembalikan untuk revisi", {icon: '↩️'});
            }
            setShowPinModal(false);
            setPin('');
            setPinActionType(null);
            navigate("/sekdes/verifikasi");
          } catch (error: any) {
            toast.error(error.response?.data?.error || "Gagal memproses transaksi");
          }
        }}
      />

      {showPanicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Panic Button</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              BAHAYA: Fitur ini akan mencatat transaksi ini lalu membekukannya secara permanen karena adanya indikasi intervensi. Lanjutkan?
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-6">
              <button 
                type="button"
                onClick={() => setShowPanicModal(false)}
                disabled={isPanicking}
                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold w-full sm:w-auto"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={async () => {
                  setIsPanicking(true);
                  try {
                    await apiClient.post(`/disbursements/${id}/reject-intervention`, { alasan: "Intervensi saat verifikasi berkas (Sekdes)" });
                    toast.success('Transaksi BERHASIL DIBEKUKAN secara permanen!');
                    navigate("/sekdes/verifikasi");
                  } catch (error) {
                    toast.error('Gagal membekukan transaksi');
                    setIsPanicking(false);
                  }
                }}
                disabled={isPanicking}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-sm flex justify-center items-center gap-2 w-full sm:w-auto"
              >
                {isPanicking ? "Membekukan..." : "Ya, Bekukan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Revisi */}
      {showRevisiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Kembalikan Dokumen</h3>
            <p className="text-sm text-slate-600 mb-6">
              Berikan catatan evaluasi yang jelas agar Operator Desa dapat memperbaiki dokumen pengajuan ini.
            </p>
            <textarea 
              rows={5}
              value={catatanRevisi}
              onChange={(e) => setCatatanRevisi(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-xl mb-6 focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none text-sm transition-all resize-none"
              placeholder="Contoh: Titik koordinat yang dilampirkan tidak sesuai dengan lokasi di RAB..."
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowRevisiModal(false)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (!catatanRevisi.trim()) {
                    toast.error("Catatan revisi tidak boleh kosong");
                    return;
                  }
                  setShowRevisiModal(false);
                  setPinActionType('RETURN_REVISION');
                  setShowPinModal(true);
                }}
                className="px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-bold shadow-sm"
              >
                Kirim Catatan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Panic Button */}
      {showPinModal && pin === 'PANIC' && ( // just reusing showPinModal or we can add a new state, let's just do it directly on click with confirmation
        <></> 
      )}
    </RoleLayout>
  );
}
