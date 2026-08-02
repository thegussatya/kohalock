import { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, XCircle, Upload, FileText } from 'lucide-react';
import { KAUR_TEKNIS_MENU } from './menu';
import apiClient from '../../lib/apiClient';



export default function ProgramDetailPage() {
  const { id } = useParams();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDisbursementId, setSelectedDisbursementId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (id) {
      apiClient.get(`/public/projects/${id}`)
        .then(res => {
          setProgram(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, refreshKey]);

  const handleUploadLPJ = async () => {
    if (!selectedDisbursementId || !uploadFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      await apiClient.post(`/disbursements/${selectedDisbursementId}/lpj`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setUploadFile(null);
      setSelectedDisbursementId(null);
      setRefreshKey(prev => prev + 1); // refresh data
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengupload LPJ');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <RoleLayout menuItems={KAUR_TEKNIS_MENU} userName="Budi Santoso" userRole="Kaur Teknis">
      <div className="mb-6">
        <Link 
          to="/kaur-teknis/program-saya" 
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Program Saya
        </Link>
      </div>


      {loading ? (
        <div className="py-16 text-center text-slate-500 font-bold animate-pulse">Memuat detail program...</div>
      ) : !program ? (
        <div className="py-16 text-center text-slate-500 font-bold">Program tidak ditemukan</div>
      ) : (
        <>
          <PageHeader 
            title={program.judulUsulan} 
            description={`Kategori: ${program.kategori} | Total Pagu: Rp ${Number(program.paguMaksimal).toLocaleString('id-ID')}`}
          />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Riwayat Termin Pencairan</h3>
        
        {program.terms && program.terms.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 ml-3 md:ml-4 space-y-8">
            {program.terms.map((event: any) => (
              <div key={event.id} className="relative pl-6 md:pl-8">
                {/* Timeline dot/icon */}
                <div className="absolute -left-[11px] md:-left-[13px] top-1 bg-white p-1">
                  {event.status === 'DISBURSED' && <CheckCircle2 className="w-5 h-5 text-green-500 bg-white" />}
                  {['PENDING_SEKDES', 'PENDING_KADES', 'PENDING_EKSEKUSI'].includes(event.status) && <Clock className="w-5 h-5 text-amber-500 bg-white" />}
                  {['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION'].includes(event.status) && <XCircle className="w-5 h-5 text-red-500 bg-white" />}
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{event.term}</h4>
                      <div className="text-sm font-medium text-slate-500 mt-0.5">Rp {Number(event.anggaran).toLocaleString('id-ID')} • {new Date(event.tanggal).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        label={event.status === 'DISBURSED' ? 'Selesai' : (['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION'].includes(event.status) ? 'Ditolak/Revisi' : 'Diproses')} 
                        variant={event.status === 'DISBURSED' ? 'success' : (['REJECTED_SYSTEM', 'RETURNED_FOR_REVISION'].includes(event.status) ? 'danger' : 'warning')} 
                      />
                      {event.status === 'DISBURSED' && (
                        <div className="mt-2">
                          {event.lpjUrl ? (
                            <a 
                              href={event.lpjUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Lihat Dokumen Termin
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedDisbursementId(event.id);
                                setShowUploadModal(true);
                              }}
                              className="inline-flex items-center text-xs font-bold text-white bg-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Upload Dokumen Termin
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 italic py-6">Belum ada riwayat termin pencairan.</div>
        )}
      </div>
      </>
      )}

      {/* Upload LPJ Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand-600" />
              Upload Dokumen Termin
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Silakan unggah dokumen pendukung (PDF/Gambar) untuk pencairan dana ini.
            </p>
            <div className="mb-6">
              <input 
                type="file" 
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setSelectedDisbursementId(null);
                }}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleUploadLPJ}
                disabled={!uploadFile || isUploading}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
              >
                {isUploading ? 'Mengunggah...' : 'Unggah LPJ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
