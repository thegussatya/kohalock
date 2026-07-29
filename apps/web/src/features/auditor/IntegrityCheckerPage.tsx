import PageHeader from '../../components/PageHeader';
import { useState, useRef, useEffect } from 'react';
import { Search, FileSearch, Workflow, LockKeyhole, Download, HelpCircle } from 'lucide-react';
import RoleLayout from '../../components/RoleLayout';
import HashCheckerBadge from '../../components/HashCheckerBadge';
import { AUDITOR_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function IntegrityCheckerPage() {
  const [selectedTrxId, setSelectedTrxId] = useState('');
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [onChainHash, setOnChainHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMatch, setIsMatch] = useState<boolean>(false);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient.get('/disbursements?status=DISBURSED')
      .then(res => setDisbursements(res.data))
      .catch(console.error);
  }, []);

  const verifyFile = async (file: File) => {
    if (!selectedTrxId) {
      alert("Pilih transaksi terlebih dahulu!");
      return;
    }
    
    setFileName(file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('disbursementId', selectedTrxId);

    try {
      const res = await apiClient.post('/disbursements/verify-hash', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const data = res.data;
      setFileHash(data.hashUpload);
      setOnChainHash(data.hashTersimpan);
      setIsMatch(data.cocok);
    } catch (error) {
      console.error('Error verifying hash:', error);
      alert("Terjadi kesalahan saat memverifikasi file.");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await verifyFile(file);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await verifyFile(file);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <RoleLayout menuItems={AUDITOR_MENU} userName="Inspektur Andi" userRole="Auditor / APH">
      <div className="mb-8">
        <PageHeader title="Uji Alat Bukti (Integrity Checker)" description="Integrity Checker: Verifikasi keaslian dokumen digital atau foto lapangan dengan mencocokkan *Hash Cryptography* lokal melawan data yang tercatat permanen di Ledger Blockchain." />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8 max-w-5xl">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          1. Identifikasi Transaksi
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Pilih ID Transaksi Ledger</label>
          <select 
            value={selectedTrxId}
            onChange={(e) => {
              setSelectedTrxId(e.target.value);
              setFileHash(null);
              setOnChainHash(null);
              setFileName(null);
              setIsMatch(false);
            }}
            className="w-full md:w-1/2 p-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50 transition-colors"
          >
            <option value="" disabled>-- Pilih Transaksi --</option>
            {disbursements.map(trx => (
              <option key={trx.id} value={trx.id}>{trx.proposal?.judulUsulan} (Rp {Number(trx.nominal).toLocaleString('id-ID')})</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${selectedTrxId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-5xl mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            2. Pindai Dokumen / Berkas Fisik
          </h2>
          
          <div 
            onClick={handleBoxClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-blue-500 bg-blue-50 scale-[1.01]' 
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            <svg className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="text-sm font-bold text-slate-700 mb-1">
              Tarik & Lepas File Berita Acara (PDF) / Foto di Sini untuk Uji Hash
            </p>
            <p className="text-xs text-slate-500 font-medium">Atau klik area ini untuk mencari file secara manual dari perangkat Anda.</p>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onFileChange} 
              className="hidden" 
            />
          </div>

          {fileName && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-sm font-bold text-blue-800 animate-in fade-in">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {fileName}
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded text-blue-600 border border-blue-100">Dipindai</span>
            </div>
          )}
        </div>

        {fileHash && onChainHash !== null && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 max-w-5xl text-white overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                3. Hasil Komparasi Integritas
              </span>
              <HashCheckerBadge isValid={isMatch} />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              
              {/* Garis VS Tengah */}
              <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center justify-center pointer-events-none z-10">
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs font-black text-slate-400">
                  VS
                </div>
              </div>

              {/* Kolom Kiri: Dokumen Lokal */}
              <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Dokumen Unggahan
                </h3>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">SHA-256 Checksum Lokal</span>
                  <div className="font-mono text-sm break-all text-blue-300 font-bold leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-700">
                    {fileHash}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Data On-Chain */}
              <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Ledger On-Chain
                </h3>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Hash Segel Original</span>
                  <div className="font-mono text-sm break-all text-yellow-300 font-bold leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-700">
                    {onChainHash || 'Hash tidak ditemukan (kosong)'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
