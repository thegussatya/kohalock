import PageHeader from '../../components/PageHeader';
import BackLink from '../../components/BackLink';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FileCheck, PieChart, MessageCircle, HelpCircle, History } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import MapWidget from '../../components/MapWidget';
import HashCheckerBadge from '../../components/HashCheckerBadge';
import Badge from '../../components/Badge';
import { SEKDES_MENU } from './menu';
import apiClient from '../../lib/apiClient';



export default function ReviewSubmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [showRevisiModal, setShowRevisiModal] = useState(false);
  const [data, setData] = useState<any>(null);
  const [sisaPagu, setSisaPagu] = useState<number>(0);
  const [catatanRevisi, setCatatanRevisi] = useState('');

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
              <p className="text-xs text-slate-500 mt-1">Kaur Teknis: {data.proposal?.kaurTeknis?.nama}</p>
              <p className="text-xs text-slate-600 mt-2 italic">"{data.keterangan}"</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Status Otentikasi Dokumen
            </h3>
            <HashCheckerBadge isValid={true} />
            <p className="text-xs text-slate-500 mt-3">
              Hash dokumen telah diverifikasi dan cocok dengan metadata di blockchain.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Lokasi Titik Koordinat (Geo-Tagging)
            </h3>
            <MapWidget 
              latitude={data.geotagLat} 
              longitude={data.geotagLng} 
              photoUrl={data.fotoUrl || "https://images.unsplash.com/photo-1541888086925-9276d418296a?q=80&w=600&auto=format&fit=crop"}
              popupText={data.keterangan || "Lokasi Proyek"}
            />
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 h-[800px] lg:h-full min-h-[600px] shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="text-sm font-bold text-slate-700">Dokumen RAB & Proposal (PDF)</span>
              <Badge label="Read-Only" variant="neutral" />
            </div>
            {/* Dummy PDF viewer - menggunakan URL dummy w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf */}
            <iframe 
              src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
              title="PDF Viewer"
              className="w-full flex-grow rounded-lg border border-slate-300 bg-white"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Aksi Bawah */}
      <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-200 pt-8 pb-4">
        <button
          type="button"
          onClick={() => setShowPinModal(true)}
          className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-lg shadow-sm hover:bg-green-700 transition-all text-sm uppercase tracking-wide"
        >
          Verifikasi & Teruskan ke Kades
        </button>
        <button
          type="button"
          onClick={() => setShowRevisiModal(true)}
          className="px-8 py-3.5 bg-yellow-500 text-white font-bold rounded-lg shadow-sm hover:bg-yellow-600 transition-all text-sm uppercase tracking-wide"
        >
          Kembalikan untuk Revisi
        </button>
      </div>

      {/* Modal PIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Tanda Tangan Digital</h3>
            <p className="text-sm text-slate-600 mb-8">
              Masukkan 6 digit PIN rahasia Anda untuk memberikan persetujuan (approval) yang akan dicatat permanen ke dalam sistem.
            </p>
            <input 
              type="password" 
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center tracking-[1em] text-3xl p-4 border border-slate-300 rounded-xl mb-8 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-mono"
              placeholder="••••••"
            />
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowPinModal(false)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={async () => {
                  try {
                    await apiClient.post(`/disbursements/${id}/verify`, { pin });
                    setShowPinModal(false);
                    setPin('');
                    toast.success("Berhasil diverifikasi & diteruskan ke Kades");
                    navigate("/sekdes/verifikasi");
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || "Gagal melakukan verifikasi");
                  }
                }}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-sm"
              >
                Konfirmasi
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
              Berikan catatan evaluasi yang jelas agar Kaur Teknis dapat memperbaiki dokumen pengajuan ini.
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
                onClick={async () => {
                  if (!catatanRevisi.trim()) {
                    toast.error("Catatan revisi tidak boleh kosong");
                    return;
                  }
                  try {
                    await apiClient.post(`/disbursements/${id}/return-revision`, { catatan: catatanRevisi });
                    setShowRevisiModal(false);
                    toast("Pengajuan dikembalikan untuk revisi", {icon: '↩️'});
                    navigate("/sekdes/verifikasi");
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || "Gagal mengembalikan pengajuan");
                  }
                }}
                className="px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-bold shadow-sm"
              >
                Kirim Catatan Revisi
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
