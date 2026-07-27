import PageHeader from '../../components/PageHeader';
import { Download } from 'lucide-react';
import RoleLayout from '../../components/RoleLayout';
import { AUDITOR_MENU } from './menu';

const INTEGRATED_AUDIT_PACKAGE = [
  { id: 'pkg-1', label: 'Laporan Keuangan Resmi (BKU, Buku Bank, Buku Pajak, Laporan Realisasi)' },
  { id: 'pkg-2', label: 'Nilai Hash SHA-256 tiap dokumen' },
  { id: 'pkg-3', label: 'Tanda Tangan Digital lengkap semua aktor' },
  { id: 'pkg-4', label: 'Log Akses Terenkripsi' },
  { id: 'pkg-5', label: 'Berita Acara Digital & Manifest File' },
];

export default function LegalExportPage() {
  const handleExport = () => {
    alert('Berhasil memulai unduhan Paket Bukti Audit Terpadu (.zip) yang disegel digital.');
  };

  return (
    <RoleLayout menuItems={AUDITOR_MENU} userName="Inspektur Andi" userRole="Auditor / APH">
      <div className="mb-8">
        <PageHeader 
          title="Paket Bukti Audit Terpadu" 
          description="Unduh seluruh bundel bukti digital yang memiliki kekuatan hukum, tersegel secara otomatis melalui kriptografi SHA-256." 
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-3xl overflow-hidden">
        
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Isi Paket Bukti (Otomatis Terangkum)
          </h2>
          <span className="text-sm font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
            1 Paket Utuh
          </span>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-3 mb-8">
            {INTEGRATED_AUDIT_PACKAGE.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 p-4 border bg-blue-50/30 border-blue-100 rounded-xl pointer-events-none"
              >
                <div className="relative flex items-center">
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-200 pt-6">
            <button
              onClick={handleExport}
              className="w-full px-6 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-colors flex justify-center items-center gap-3 text-sm uppercase tracking-wider"
            >
              <Download className="w-5 h-5" />
              Unduh Paket Bukti Audit Terpadu (Sekali Klik)
            </button>
          </div>
        </div>
        
      </div>
    </RoleLayout>
  );
}
