import PageHeader from '../../components/PageHeader';
import { useState, useRef, useEffect } from 'react';
import { Search, FileSearch, Workflow, LockKeyhole, Download, HelpCircle, FileText } from 'lucide-react';
import RoleLayout from '../../components/RoleLayout';
import HashCheckerBadge from '../../components/HashCheckerBadge';
import { AUDITOR_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';

type DocType = 'berita_acara' | 'lpj_teknis' | 'lpj_keuangan' | 'lpj_desa';

export default function IntegrityCheckerPage() {
  const [docType, setDocType] = useState<DocType>('berita_acara');
  const [items, setItems] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [onChainHash, setOnChainHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMatch, setIsMatch] = useState<boolean>(false);
  const [catatan, setCatatan] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // reset selection
    setSelectedId('');
    setFileHash(null);
    setOnChainHash(null);
    setIsMatch(false);
    setFileName(null);
    setCatatan('');
    setSavedNotes([]);
    
    // fetch items based on docType
    if (docType === 'berita_acara' || docType === 'lpj_teknis') {
      apiClient.get('/disbursements').then(res => setItems(res.data)).catch(console.error);
    } else if (docType === 'lpj_keuangan') {
      apiClient.get('/public/projects').then(res => setItems(res.data)).catch(console.error);
    } else if (docType === 'lpj_desa') {
      apiClient.get('/public/reports/desa').then(res => setItems(res.data)).catch(console.error);
    }
  }, [docType]);

  const verifyFile = async (file: File) => {
    if (!selectedId) {
      alert("Pilih dokumen dari daftar terlebih dahulu!");
      return;
    }
    
    setFileName(file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    formData.append('docId', selectedId);

    try {
      const res = await apiClient.post('/public/verify-hash', formData);
      const data = res.data;
      setFileHash(data.calculatedHash);
      setOnChainHash(data.onChainHash);
      setIsMatch(data.isAuthentic);
      
      // Load existing notes for this document
      try {
        const notesRes = await apiClient.get(`/audit-notes?docType=${docType}&docId=${selectedId}`);
        setSavedNotes(notesRes.data);
      } catch (e) { /* ignore */ }
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
    <RoleLayout menuItems={AUDITOR_MENU} userName="Inspektur Andi" userRole="Auditor / APH" settingsPath="/auditor/profil">
      <div className="mb-8">
        <PageHeader title="Uji Alat Bukti (Integrity Checker)" description="Integrity Checker: Verifikasi keaslian dokumen digital atau foto lapangan dengan mencocokkan *Hash Cryptography* lokal melawan data yang tercatat permanen di Ledger Blockchain." />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8 max-w-5xl">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          1. Identifikasi Dokumen
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Dokumen (4 Role Utama)</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50 transition-colors font-semibold"
            >
              <option value="berita_acara">Berita Acara Pencairan (Sekdes/Kades)</option>
              <option value="lpj_teknis">LPJ Fisik (Kaur Teknis)</option>
              <option value="lpj_keuangan">LPJ Keuangan (Bendahara)</option>
              <option value="lpj_desa">Laporan Realisasi Desa (Kades)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Data Ledger</label>
            <select 
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setFileHash(null);
                setOnChainHash(null);
                setFileName(null);
                setIsMatch(false);
              }}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50 transition-colors"
            >
              <option value="" disabled>-- Pilih Berkas/Transaksi --</option>
              {items.map(item => {
                let hasLpj = false;
                if (docType === 'berita_acara') hasLpj = !!item.beritaAcaraHash;
                else if (docType === 'lpj_teknis') hasLpj = !!item.lpjTeknisHash;
                else if (docType === 'lpj_keuangan') hasLpj = !!item.lpjKeuanganHash;
                else if (docType === 'lpj_desa') hasLpj = !!item.dokumenHash;

                const statusLabel = hasLpj ? '✅ ADA' : '❌ BLUM';
                
                let label = '';
                if (docType === 'berita_acara' || docType === 'lpj_teknis') {
                  label = `[${statusLabel}] [${item.status}] ${item.proposal?.judulUsulan} (Rp ${Number(item.nominal).toLocaleString('id-ID')})`;
                } else if (docType === 'lpj_keuangan') {
                  label = `[${statusLabel}] ${item.judulUsulan} (Dusun: ${item.dusun})`;
                } else {
                  label = `[${statusLabel}] Laporan Desa Thn ${item.tahun} Sem ${item.semester}`;
                }

                return (
                  <option key={item.id} value={item.id} disabled={!hasLpj}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${selectedId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-5xl mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-blue-600" />
            2. Pindai Dokumen Fisik / PDF
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
            <FileSearch className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
            <p className="text-sm font-bold text-slate-700 mb-1">
              Tarik & Lepas File (PDF) / Foto di Sini untuk Uji Hash
            </p>
            <p className="text-xs text-slate-500 font-medium">Atau klik area ini untuk mencari file secara manual dari perangkat Anda.</p>
            
            <input 
              type="file" 
              accept=".pdf"
              ref={fileInputRef} 
              onChange={onFileChange} 
              className="hidden" 
            />
          </div>

          {fileName && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-sm font-bold text-blue-800 animate-in fade-in">
              <span className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
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
                  <Download className="w-4 h-4" />
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

            {/* Section 4: Catatan Auditor */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                4. Catatan Auditor (Sertakan ke Laporan)
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Tulis catatan Anda tentang hasil uji bukti ini. Misalnya: "Salah drop file", "Dokumen otentik", atau "Temuan perbedaan hash — perlu investigasi lanjut." Catatan ini akan disertakan di dalam laporan hukum PDF.
              </p>
              <textarea
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                rows={3}
                placeholder="Tulis catatan verifikasi di sini..."
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none resize-none"
              />
              <button
                onClick={async () => {
                  if (!catatan.trim()) return toast.error('Catatan tidak boleh kosong');
                  setSavingNote(true);
                  try {
                    await apiClient.post('/audit-notes', {
                      docType,
                      docId: selectedId,
                      catatan: catatan.trim(),
                      hasil: isMatch ? 'OTENTIK' : 'BERBEDA',
                      hashUpload: fileHash,
                      hashOnChain: onChainHash
                    });
                    toast.success('Catatan berhasil disimpan!');
                    const notesRes = await apiClient.get(`/audit-notes?docType=${docType}&docId=${selectedId}`);
                    setSavedNotes(notesRes.data);
                    setCatatan('');
                  } catch (err) {
                    console.error(err);
                    toast.error('Gagal menyimpan catatan');
                  } finally {
                    setSavingNote(false);
                  }
                }}
                disabled={savingNote || !catatan.trim()}
                className="mt-3 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                {savingNote ? 'Menyimpan...' : 'Simpan Catatan ke Laporan'}
              </button>

              {savedNotes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-slate-400 font-bold">Catatan yang sudah tersimpan:</p>
                  {savedNotes.map((note: any) => (
                    <div key={note.id} className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${note.hasil === 'OTENTIK' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                          {note.hasil}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(note.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-slate-300">{note.catatan}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </RoleLayout>
  );
}
