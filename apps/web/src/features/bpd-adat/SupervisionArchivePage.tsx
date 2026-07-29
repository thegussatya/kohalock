import PageHeader from '../../components/PageHeader';
import { useState, useEffect } from 'react';

import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import Badge from '../../components/Badge';
import { BPD_ADAT_MENU } from './menu';
import apiClient from '../../lib/apiClient';

type BpdHistoryData = {
  id: string;
  tanggal: string;
  program: string;
  isiCatatan: string;
};

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'program', label: 'Program Terkait' },
  { key: 'isiCatatan', label: 'Isi Catatan Pengawasan' },
];

type AdatHistoryData = {
  id: string;
  kasus: string;
  tanggalSelesai: string;
  hasilPutusan: string;
};

type TabType = 'bpd' | 'adat';

export default function SupervisionArchivePage() {
  const [activeTab, setActiveTab] = useState<TabType>('bpd');
  const [searchAdat, setSearchAdat] = useState('');
  
  const [bpdHistory, setBpdHistory] = useState<BpdHistoryData[]>([]);
  const [adatHistory, setAdatHistory] = useState<AdatHistoryData[]>([]);

  useEffect(() => {
    // Fetch BPD History
    apiClient.get('/supervision-notes/history')
      .then(res => {
        const mapped = res.data.map((item: any) => ({
          id: item.id,
          tanggal: item.createdAt.split('T')[0],
          program: item.disbursement?.proposal?.judulUsulan || 'Tanpa Program',
          isiCatatan: item.catatan
        }));
        setBpdHistory(mapped);
      })
      .catch(console.error);

    // Fetch Adat History
    apiClient.get('/adat-cases?status=SELESAI')
      .then(res => {
        const mapped = res.data.map((item: any) => {
          let parties = '';
          try {
            if (Array.isArray(item.pihakTerlibat)) parties = item.pihakTerlibat.join(' vs ');
            else if (typeof item.pihakTerlibat === 'string') parties = JSON.parse(item.pihakTerlibat).join(' vs ');
          } catch (e) {
            parties = 'Pihak Terkait';
          }
          
          return {
            id: item.id,
            kasus: item.kategori + (parties ? ` (${parties})` : ''),
            tanggalSelesai: item.createdAt.split('T')[0], // Since there's no finishedDate, fallback to createdAt
            hasilPutusan: item.keputusanResolusi || 'Telah diselesaikan secara kekeluargaan.'
          };
        });
        setAdatHistory(mapped);
      })
      .catch(console.error);
  }, []);

  const filteredAdatHistory = adatHistory.filter(
    (item) => 
      item.kasus.toLowerCase().includes(searchAdat.toLowerCase()) || 
      item.hasilPutusan.toLowerCase().includes(searchAdat.toLowerCase())
  );

  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Bapak RT/Adat" userRole="BPD / Tokoh Adat" settingsPath="/bpd-adat/pengaturan">
      <PageHeader title="Arsip Pengawasan & Etik" description="Halaman penyimpanan permanen untuk riwayat catatan pengawasan BPD dan rekam jejak putusan adat." />


      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
        <button
          type="button"
          className={`py-3 px-6 border-b-2 font-medium text-sm transition-all ${
            activeTab === 'bpd'
              ? 'border-blue-500 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
          onClick={() => setActiveTab('bpd')}
        >
          Histori BPD (Catatan Pengawasan)
        </button>
        <button
          type="button"
          className={`py-3 px-6 border-b-2 font-medium text-sm transition-all ${
            activeTab === 'adat'
              ? 'border-blue-500 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
          onClick={() => setActiveTab('adat')}
        >
          Histori Adat (Kasus Selesai)
        </button>
      </div>

      {/* Tab Content: BPD */}
      {activeTab === 'bpd' && (
        <div className="animate-in fade-in duration-300">
          <DataTable
            columns={COLUMNS}
            data={bpdHistory}
          />
        </div>
      )}

      {/* Tab Content: Adat */}
      {activeTab === 'adat' && (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6 relative">
            <svg 
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari arsip kasus atau putusan adat..."
              value={searchAdat}
              onChange={(e) => setSearchAdat(e.target.value)}
              className="w-full md:w-1/2 pl-10 pr-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <div className="space-y-4">
            {filteredAdatHistory.length > 0 ? (
              filteredAdatHistory.map((item) => (
                <div key={item.id} className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <h3 className="text-lg font-bold text-slate-800">{item.kasus}</h3>
                    <Badge label="Selesai" variant="success" />
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      "{item.hasilPutusan}"
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-400">
                    <span>Tanggal Putusan: {item.tanggalSelesai}</span>
                    <span>Ref: {item.id}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-500 italic">Tidak ada data histori adat yang cocok dengan pencarian.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
