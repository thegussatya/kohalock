import PageHeader from '../../components/PageHeader';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { decryptReport } from '../../lib/crypto';
import { AUDITOR_MENU } from './menu';
import apiClient from '../../lib/apiClient';

const COLUMNS: TableColumn[] = [
  { key: 'ticketCode', label: 'ID Tiket' },
  { key: 'createdAt', label: 'Tanggal Masuk' },
  { key: 'ciphertext', label: 'Ciphertext (Terenkripsi)' },
  { key: 'aksi', label: 'Aksi' },
];

type ReportData = {
  ticketCode: string;
  encryptedPayload: string;
  createdAt: string;
};

export default function WhistleblowerInboxPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await apiClient.get('/whistleblower/reports');
      setReports(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil daftar laporan dari server');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenReport = (report: ReportData) => {
    setSelectedReport(report);
    setPrivateKeyInput('');
    setDecryptedText(null);
    setErrorMsg(null);
  };

  const handleDecrypt = async () => {
    if (!selectedReport || !privateKeyInput.trim()) return;
    try {
      // Sesuai spec: POST ke backend dengan passprhase, backend hanya kembalikan ciphertext
      const res = await apiClient.post(`/whistleblower/reports/${selectedReport.ticketCode}/decrypt`, {
        privateKeyPassphrase: privateKeyInput.trim()
      });

      const { encryptedPayload } = res.data;

      // Dekripsi asli terjadi di sisi client
      const result = decryptReport(encryptedPayload, privateKeyInput.trim());
      if (result) {
        setDecryptedText(result);
        setErrorMsg(null);
        toast.success("Laporan berhasil didekripsi");
      } else {
        throw new Error('Decryption failed');
      }
    } catch (e: any) {
      setDecryptedText(null);
      setErrorMsg(e.response?.data?.error || 'Gagal membuka - private key salah atau data rusak');
      toast.error(e.response?.data?.error || "Private key salah atau data rusak");
    }
  };

  const renderCell = (row: ReportData, columnKey: string) => {
    if (columnKey === 'createdAt') {
      return (
        <span className="text-slate-600 text-sm font-medium">
          {new Date(row.createdAt).toLocaleString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </span>
      );
    }
    if (columnKey === 'ciphertext') {
      return (
        <div className="flex flex-col items-start">
          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1.5 rounded border border-slate-200 truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] block" title={row.encryptedPayload}>
            {row.encryptedPayload}
          </span>
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">
            Terkunci (Encrypted)
          </span>
        </div>
      );
    }
    if (columnKey === 'aksi') {
      return (
        <button
          onClick={() => handleOpenReport(row)}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-slate-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Buka Gembok
        </button>
      );
    }
    return undefined;
  };

  return (
    <RoleLayout menuItems={AUDITOR_MENU} userName="Inspektur Andi" userRole="Auditor / APH">
      <div className="mb-8">
        <PageHeader title="Kotak Masuk Rahasia" description="Whistleblower Inbox: Fasilitas dekripsi untuk membuka laporan Whistleblower anonim dari publik. Pastikan Anda memiliki Private Key Inspektorat untuk dapat membaca konten aslinya." />

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Tabel Laporan */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              Daftar Laporan Masuk
            </h3>
            
            {reports.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">Belum ada laporan rahasia yang masuk.</p>
              </div>
            ) : (
              <DataTable
                columns={COLUMNS}
                data={reports}
                renderCell={renderCell}
              />
            )}
          </div>
        </div>

        {/* Kolom Kanan: Panel Dekripsi (Split View) */}
        <div className="xl:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 sticky top-6 text-white overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Dekripsi Laporan (Offline)
            </h3>

            {!selectedReport ? (
              <div className="text-center py-12 px-4 border border-slate-700 border-dashed rounded-xl bg-slate-800/50">
                <svg className="w-8 h-8 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                <p className="text-slate-400 text-sm font-medium">Klik tombol <span className="text-white">Buka Gembok</span> pada salah satu baris laporan di tabel untuk memulai proses dekripsi.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
                
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tiket Terpilih</span>
                  <span className="text-lg font-black text-blue-400 tracking-widest">{selectedReport.ticketCode}</span>
                </div>

                {!decryptedText ? (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Input Private Key Inspektorat</label>
                      <textarea
                        rows={3}
                        value={privateKeyInput}
                        onChange={(e) => setPrivateKeyInput(e.target.value)}
                        placeholder="Masukkan kunci privat format Base64 Anda di sini..."
                        className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-sm font-mono text-slate-300 resize-none placeholder-slate-600"
                      ></textarea>
                    </div>

                    <button
                      onClick={handleDecrypt}
                      disabled={!privateKeyInput.trim()}
                      className="w-full px-6 py-4 bg-yellow-500 text-slate-900 font-black rounded-xl shadow-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 uppercase tracking-wide text-sm"
                    >
                      Buka Gembok Laporan
                    </button>

                    {errorMsg && (
                      <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-400 text-sm font-bold mt-2 animate-in slide-in-from-top-1">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {errorMsg}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="p-3 bg-green-900/40 border border-green-800/50 rounded-lg flex items-center gap-2 text-green-400 text-sm font-bold animate-in zoom-in-95">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Dekripsi Berhasil!
                    </div>
                    
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Isi Kronologi (Plaintext)</span>
                      <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-medium">
                        {decryptedText}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </RoleLayout>
  );
}
