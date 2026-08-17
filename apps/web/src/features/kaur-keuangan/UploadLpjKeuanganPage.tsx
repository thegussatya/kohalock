import { useState, useEffect } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import { KAUR_KEUANGAN_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';
import { Upload, CheckCircle2, FileText, Search, Lock, Download } from 'lucide-react';
import PinModal from '../../components/PinModal';
import Badge from '../../components/Badge';

export default function UploadLpjKeuanganPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{proposalId: string, file: File} | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await apiClient.get('/public/projects');
      setProposals(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data program');
      setLoading(false);
    }
  };

  const handleUpload = async (proposalId: string, file: File) => {
    setShowConfirmModal({ proposalId, file });
  };

  const submitWithPin = async (pin: string) => {
    const proposalId = showPinModal;
    if (!proposalId) return;

    setUploading(proposalId);
    try {
      const formData = new FormData();
      if (file) formData.append('lpjKeuangan', file);
      formData.append('pin', pin);

      await apiClient.post(`/proposals/${proposalId}/lpj-keuangan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('LPJ Keuangan Permanen Terkunci di Blockchain!');
      setFile(null);
      setShowPinModal(null);
      fetchProposals();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Gagal mengunci LPJ ke Blockchain');
    } finally {
      setUploading(null);
    }
  };

  const filteredProposals = proposals.filter(p => 
    p.judulUsulan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleLayout menuItems={KAUR_KEUANGAN_MENU} userName="Hastuti" userRole="Kaur Keuangan" settingsPath="/kaur-keuangan/pengaturan">
      <PageHeader 
        title="Laporan LPJ Keuangan" 
        description="Unggah dan kunci dokumen LPJ Keuangan ke dalam Blockchain untuk keperluan audit per program/kegiatan." 
      />

      <div className="mb-6 flex">
        <a 
          href="/templates/Template Laporan Pertanggungjawaban Keuangan Desa.docx" 
          download 
          className="inline-flex items-center justify-center text-sm font-bold text-blue-700 bg-white border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template LPJ Keuangan (Word)
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Daftar Program (Kegiatan)
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari program..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-brand-500 outline-none transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 font-medium animate-pulse">Memuat data...</div>
        ) : filteredProposals.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-medium bg-slate-50 rounded-lg border border-dashed border-slate-200">
            Tidak ada program yang ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-600 bg-slate-50/80">
                  <th className="p-4 font-bold">Program (Kegiatan)</th>
                  <th className="p-4 font-bold">Kategori & Dusun</th>
                  <th className="p-4 font-bold">Pagu Dana</th>
                  <th className="p-4 font-bold text-center">Status LPJ</th>
                  <th className="p-4 font-bold text-center w-[160px]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map(p => {
                  const isLocked = !!p.lpjKeuanganUrl;
                  
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 line-clamp-2 max-w-sm" title={p.judulUsulan}>
                          {p.judulUsulan}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <Badge label={p.kategori} variant="info" />
                          <span className="text-xs text-slate-500 font-semibold">{p.dusun}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        Rp {Number(p.paguMaksimal).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center">
                        {isLocked ? (
                          <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Terkunci
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            Menunggu LPJ
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-2 items-center justify-center">
                          {isLocked ? (
                            <>
                              <a 
                                href={p.lpjKeuanganUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full py-1.5 bg-blue-50 text-blue-600 border border-blue-100 font-bold rounded-md text-xs hover:bg-blue-100 transition-colors flex justify-center items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" /> Lihat PDF
                              </a>
                              <div className="text-[10px] text-slate-400 font-mono text-center" title={p.lpjKeuanganHash}>
                                {p.lpjKeuanganHash?.substring(0, 10)}...
                              </div>
                            </>
                          ) : (
                            <div className="relative w-full">
                              <input 
                                type="file" 
                                accept=".pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={uploading === p.id}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleUpload(p.id, e.target.files[0]);
                                  }
                                  e.target.value = '';
                                }}
                              />
                              <button 
                                disabled={uploading === p.id}
                                className="w-full py-2 bg-blue-600 text-white font-bold rounded-md text-xs shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                {uploading === p.id ? 'Memproses...' : (
                                  <>
                                    <Upload className="w-3.5 h-3.5" /> 
                                    Upload PDF
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PinModal 
        isOpen={showPinModal !== null} 
        onClose={() => setShowPinModal(null)} 
        onConfirm={submitWithPin} 
        isLoading={uploading !== null}
      />

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Penguncian</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              PERHATIAN! Jika dikunci ke Blockchain, LPJ Keuangan ini TIDAK BISA DIUBAH LAGI selamanya. Anda yakin?
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-6">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(null)}
                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold w-full sm:w-auto"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={() => {
                  setFile(showConfirmModal.file);
                  setShowPinModal(showConfirmModal.proposalId);
                  setShowConfirmModal(null);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm flex justify-center items-center gap-2 w-full sm:w-auto"
              >
                Ya, Kunci Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
