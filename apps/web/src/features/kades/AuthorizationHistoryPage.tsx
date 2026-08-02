import { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { Wallet } from 'lucide-react';
import { KADES_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import DocumentPreviewViewer from '../../components/DocumentPreviewViewer';

type AuthHistoryData = {
  id: string;
  tanggal: string;
  namaProgram: string;
  dusun: string;
  kategori: string;
  nominal: number;
  fotoUrl?: string;
  beritaAcaraUrl?: string;
  lpjUrl?: string;
};

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'namaProgram', label: 'Nama Program' },
  { key: 'dusun', label: 'Dusun' },
  { key: 'nominal_formatted', label: 'Nominal' },
  { key: 'aksi', label: 'Aksi' },
];

export default function AuthorizationHistoryPage() {
  const [historyData, setHistoryData] = useState<AuthHistoryData[]>([]);
  const [filterDusun, setFilterDusun] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [selectedDoc, setSelectedDoc] = useState<AuthHistoryData | null>(null);

  useEffect(() => {
    apiClient.get('/disbursements/authorizations')
      .then(res => {
        const mapped = res.data.map((item: any) => ({
          ...item,
          tanggalRaw: item.tanggal,
          tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
        }));
        setHistoryData(mapped);
      })
      .catch(console.error);
  }, []);

  const filteredHistory = useMemo(() => {
    return historyData.filter((h: any) => {
      if (filterDusun && h.dusun !== filterDusun) return false;
      if (filterKategori && h.kategori !== filterKategori) return false;
      if (dateFrom && new Date(h.tanggalRaw) < new Date(dateFrom)) return false;
      if (dateTo && new Date(h.tanggalRaw) > new Date(dateTo)) return false;
      return true;
    });
  }, [historyData, filterDusun, filterKategori, dateFrom, dateTo]);

  const totalNominal = filteredHistory.reduce((sum, item) => sum + item.nominal, 0);

  const tableData = filteredHistory.map(item => ({
    ...item,
    nominal_formatted: `Rp ${item.nominal.toLocaleString('id-ID')}`
  }));

  return (
    <RoleLayout menuItems={KADES_MENU} userName="Ahmad Fauzi" userRole="Kepala Desa" settingsPath="/kades/pengaturan">
      <PageHeader 
        title="Riwayat Otorisasi" 
        description="Daftar pencairan dana yang telah Anda setujui." 
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterDusun}
            onChange={e => setFilterDusun(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Dusun</option>
            <option value="Dusun 1">Dusun 1</option>
            <option value="Dusun 2">Dusun 2</option>
            <option value="Dusun 3">Dusun 3</option>
            <option value="Dusun 4">Dusun 4</option>
          </select>

          <select
            value={filterKategori}
            onChange={e => setFilterKategori(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Semua Kategori</option>
            <option value="Kesehatan">Kesehatan</option>
            <option value="Infrastruktur">Infrastruktur</option>
            <option value="Pemberdayaan">Pemberdayaan</option>
            <option value="Pendidikan">Pendidikan</option>
            <option value="Darurat">Darurat</option>
          </select>

          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1"
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1"
            />
          </div>
        </div>
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-6 flex items-center gap-4 shadow-sm">
        <div className="bg-brand-100 p-3 rounded-lg">
          <Wallet className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-brand-800">Total Nominal Periode Ini</p>
          <h3 className="text-2xl font-bold text-brand-900 mt-1">Rp {totalNominal.toLocaleString('id-ID')}</h3>
        </div>
      </div>

      <DataTable 
        columns={COLUMNS} 
        data={tableData} 
        renderCell={(row, columnKey) => {
          if (columnKey === 'aksi') {
            return (
              <button
                onClick={() => setSelectedDoc(row)}
                className="inline-flex items-center text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-100 transition-colors"
              >
                Lihat Dokumen
              </button>
            );
          }
          return row[columnKey];
        }}
      />

      {/* Modal Preview Dokumen */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Preview Dokumen - {selectedDoc.namaProgram}
            </h3>
            <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4">
              Dusun: {selectedDoc.dusun} | Kategori: {selectedDoc.kategori} | Nominal: Rp {selectedDoc.nominal.toLocaleString('id-ID')}
            </p>

            <DocumentPreviewViewer
              fotoUrl={selectedDoc.fotoUrl}
              beritaAcaraUrl={selectedDoc.beritaAcaraUrl}
              lpjUrl={selectedDoc.lpjUrl}
            />

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
