import React, { useState, useMemo } from 'react';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { Search, Eye, X, ShieldCheck, Lock } from 'lucide-react';
import apiClient from '../../lib/apiClient';

const COLUMNS: TableColumn[] = [
  { key: 'bulan', label: 'Bulan' },
  { key: 'tanggalKunci', label: 'Tanggal Dikunci' },
  { key: 'hash', label: 'Hash Kriptografi' },
  { key: 'aksi', label: 'Aksi' },
];

export default function LockedArchivePage() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const fetchArchive = () => {
    apiClient.get('/monthly-closing/archive')
      .then(res => {
        const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const mapped = res.data.map((item: any) => ({
          id: item.id,
          bulanRaw: item.bulan,
          tahun: item.tahun,
          bulan: `${monthNames[item.bulan]} ${item.tahun}`,
          tanggalKunci: new Date(item.ditutupPada).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }),
          hash: item.hashKunci,
          penerimaan: `Rp ${Number(item.penerimaan).toLocaleString('id-ID')}`,
          pengeluaran: `Rp ${Number(item.pengeluaran).toLocaleString('id-ID')}`,
          rawId: item.id, // Keep the actual closing ID for verify if needed
        }));
        setData(mapped);
      })
      .catch(console.error);
  };

  React.useEffect(() => {
    fetchArchive();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) => 
      item.bulan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tanggalKunci.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case 'bulan':
        return <span className="font-bold text-slate-900 text-sm">{row.bulan}</span>;
      case 'tanggalKunci':
        return <span className="text-slate-600 text-sm">{row.tanggalKunci}</span>;
      case 'hash':
        return (
          <span className="font-mono text-sm bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-200">
            {row.hash.substring(0, 16)}...
          </span>
        );
      case 'aksi':
        return (
          <button 
            onClick={() => setSelectedRow(row)}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Eye className="w-4 h-4" /> Lihat Detail
          </button>
        );
      default:
        return (row as any)[columnKey];
    }
  };

  return (
    <RoleLayout
      menuItems={KAUR_KEUANGAN_MENU}
      userName="Hastuti"
      userRole="Kaur Keuangan"
      settingsPath="/kaur-keuangan/pengaturan"
    >
      <PageHeader 
        title="Arsip Buku Terkunci" 
        description="Riwayat seluruh buku bulanan yang telah dikunci beserta hash kriptografinya" 
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan bulan atau tahun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={COLUMNS}
          data={filteredData}
          renderCell={renderCell}
        />
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Tidak ada arsip buku yang cocok dengan pencarian "{searchTerm}"
          </div>
        )}
      </div>

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Arsip {selectedRow.bulan}</h3>
                  <p className="text-xs text-slate-500">Dikunci pada: {selectedRow.tanggalKunci}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRow(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Penerimaan</p>
                  <p className="text-lg font-black text-green-600">{selectedRow.penerimaan}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Pengeluaran</p>
                  <p className="text-lg font-black text-red-600">{selectedRow.pengeluaran}</p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> 
                  Cryptographic Hash Signature (SHA-256)
                </p>
                <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                  <p className="font-mono text-sm text-slate-700 break-all select-all leading-relaxed">
                    {selectedRow.hash}
                  </p>
                </div>
                <p className="text-xs text-slate-400 mt-2">Signature ini menjamin integritas data secara matematis di sistem ledger lokal.</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRow(null)}
                  className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.loading('Memverifikasi hash...', { id: 'verify' });
                    apiClient.get(`/monthly-closing/${selectedRow.rawId}/verify`)
                      .then(res => {
                        if (res.data.match) {
                          toast.success('Hash cocok, data belum berubah sejak dikunci', { id: 'verify' });
                        } else {
                          toast.error('Hash TIDAK cocok! Data kemungkinan telah dimanipulasi', { id: 'verify' });
                        }
                      })
                      .catch(() => {
                        toast.error('Gagal memverifikasi hash', { id: 'verify' });
                      });
                  }}
                  className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-bold shadow-sm flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" /> Verifikasi Ulang Hash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
