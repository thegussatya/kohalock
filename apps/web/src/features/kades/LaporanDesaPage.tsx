import { useState } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import { KADES_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';
import { Upload, Lock, FileText, Info, Download } from 'lucide-react';
import PinModal from '../../components/PinModal';

export default function LaporanDesaPage() {
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState('1');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Pilih dokumen laporan (PDF) terlebih dahulu');
      return;
    }

    setShowConfirmModal(true);
  };

  const submitWithPin = async (pin: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('tahun', tahun);
      formData.append('semester', semester);
      if (file) formData.append('lpjDesa', file);
      formData.append('pin', pin);

      await apiClient.post('/reports/lpj-desa', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Laporan Desa Berhasil Dikunci di Blockchain!');
      setFile(null);
      setShowPinModal(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Gagal mengunci Laporan Desa');
    } finally {
      setUploading(false);
    }
  };

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Suryo Adi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <PageHeader 
        title="Laporan Realisasi Desa" 
        description="Unggah dan kunci dokumen resmi Laporan Realisasi APBDes (Semester/Tahunan) ke Blockchain." 
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-3xl mb-8">
        <div className="bg-blue-50 border-b border-blue-100 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Dokumen yang diunggah di sini adalah laporan tingkat desa secara utuh. Laporan ini akan mendapatkan cap waktu dan segel kriptografi (hash) permanen sebagai jaminan alat bukti untuk Inspektorat/Auditor.
          </p>
        </div>
        
        <form onSubmit={handleUpload} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tahun Anggaran</label>
              <select 
                value={tahun} 
                onChange={(e) => setTahun(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Semester</label>
              <select 
                value={semester} 
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
              >
                <option value="1">Semester 1 (Jan-Jun)</option>
                <option value="2">Semester 2 (Jul-Des)</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-slate-700">Dokumen Laporan (PDF)</label>
              <a 
                href="/templates/Template Laporan Keuangan Desa (Pertanggungjawaban APBDes).docx"
                download="Template_Laporan_Realisasi_APBDes.docx"
                className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors border border-brand-200"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Unduh Template
              </a>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <input 
                type="file" 
                id="file-upload"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-bold hover:underline">
                Klik untuk mengunggah file
              </label>
              <p className="text-xs text-slate-500 mt-2 mt-1">
                {file ? (
                  <span className="text-green-600 font-bold flex items-center justify-center gap-1">
                    <FileText className="w-3 h-3" /> {file.name}
                  </span>
                ) : 'Format yang didukung: PDF'}
              </p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={uploading || !file}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <span className="animate-pulse">Memproses Blockchain...</span>
            ) : (
              <>
                <Lock className="w-5 h-5" /> 
                Kunci Laporan ke Blockchain
              </>
            )}
          </button>
        </form>
      </div>

      <PinModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onConfirm={submitWithPin} 
        isLoading={uploading}
      />

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Penguncian</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              PERHATIAN! Jika dikunci ke Blockchain, Laporan Realisasi Desa ini TIDAK BISA DIUBAH LAGI selamanya. Anda yakin?
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-6">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold w-full sm:w-auto"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowPinModal(true);
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
