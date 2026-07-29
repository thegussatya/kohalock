import PageHeader from '../../components/PageHeader';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { BPD_ADAT_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import { X, MapPin, FileText } from 'lucide-react';

type TransactionData = {
  id: string;
  tanggal: string;
  namaProgram: string;
  dusun: string;
  nominal: string;
  status: string;
  statusEksekusi: string;
};

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'namaProgram', label: 'Nama Program' },
  { key: 'dusun', label: 'Dusun' },
  { key: 'nominal', label: 'Nominal' },
  { key: 'status', label: 'Status Pengajuan' },
  { key: 'statusEksekusi', label: 'Status Eksekusi (Kaur Keuangan)' },
  { key: 'aksi', label: 'Aksi' }
];

export default function TransactionMonitoringPage() {
  const [data, setData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Detail states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionData | null>(null);
  const [txDetail, setTxDetail] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/ledger/timeline');
      const mapped = res.data.map((item: any) => ({
        id: item.id,
        tanggal: new Date(item.submittedAt).toLocaleDateString('id-ID'),
        namaProgram: item.proposal?.judulUsulan || '-',
        dusun: item.proposal?.dusun || '-',
        nominal: `Rp ${parseInt(item.nominal).toLocaleString('id-ID')}`,
        status: item.status,
        statusEksekusi: item.status === 'DISBURSED' ? 'Sudah Dieksekusi' : 'Menunggu Eksekusi'
      }));
      setData(mapped);
    } catch (error) {
      console.error('Error fetching ledger timeline:', error);
      toast.error('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchNotes = async (txId: string) => {
    try {
      const notesRes = await apiClient.get('/supervision-notes/history');
      const txNotes = notesRes.data.filter((n: any) => n.disbursementId === txId);
      // reverse because backend gives desc, and chat usually renders chronological
      setComments(txNotes.reverse());
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const openDetailModal = async (row: TransactionData) => {
    setSelectedTx(row);
    setIsModalOpen(true);
    setTxDetail(null);
    setComments([]);

    try {
      const [res] = await Promise.all([
        apiClient.get(`/ledger/timeline/${row.id}`),
        fetchNotes(row.id)
      ]);
      setTxDetail(res.data);
    } catch (error) {
      toast.error('Gagal memuat detail transaksi');
    }
  };

  const handleReply = async () => {
    if (!newReply.trim() || !selectedTx) return;
    try {
      setSubmittingReply(true);
      await apiClient.post('/supervision-notes', {
        disbursementId: selectedTx.id,
        catatan: newReply
      });
      toast.success('Catatan pengawasan berhasil ditambahkan');
      setNewReply('');
      await fetchNotes(selectedTx.id);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menambahkan catatan');
    } finally {
      setSubmittingReply(false);
    }
  };

  const renderCell = (row: TransactionData, columnKey: string) => {
    if (columnKey === 'status') {
      let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
      if (row.status === 'DISBURSED' || row.status === 'PENDING_EKSEKUSI') {
        badgeClass = 'bg-green-100 text-green-700 border-green-200';
      } else if (row.status === 'RETURNED_FOR_REVISION' || row.status === 'REJECTED_SYSTEM') {
        badgeClass = 'bg-red-100 text-red-700 border-red-200';
      } else {
        badgeClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
      }
      return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeClass}`}>
          {row.status.replace(/_/g, ' ')}
        </span>
      );
    }
    if (columnKey === 'statusEksekusi') {
      if (!row.statusEksekusi || row.statusEksekusi === '-') {
        return <span className="text-slate-400 font-medium">-</span>;
      }
      const isDone = row.statusEksekusi === 'Sudah Dieksekusi';
      return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${isDone ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
          {row.statusEksekusi}
        </span>
      );
    }
    if (columnKey === 'aksi') {
      return (
        <button 
          onClick={() => openDetailModal(row)}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
        >
          Lihat Detail
        </button>
      );
    }
    return undefined;
  };

  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Bapak RT/Adat" userRole="BPD / Tokoh Adat" settingsPath="/bpd-adat/pengaturan">
      <PageHeader title="Pantauan Transaksi" />
      {/* Read-Only Notice */}
      <div className="mb-6 p-4 bg-slate-100 border-l-4 border-slate-500 rounded-r-lg shadow-sm max-w-2xl">
        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Read-Only - Tidak ada tombol setuju/tolak/cairkan
        </p>
        <p className="text-xs text-slate-500 mt-1 ml-7">
          Halaman ini khusus untuk pemantauan pengawasan aliran dana tanpa hak intervensi operasional.
        </p>
      </div>

      {/* Table Section */}
      <div className="mb-4">
        {loading ? <span className="text-sm text-slate-500">Memuat data...</span> : null}
      </div>
      <DataTable
        columns={COLUMNS}
        data={data}
        renderCell={renderCell}
      />

      {/* Detail Modal */}
      {isModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detail Transaksi & Pengawasan</h3>
                <p className="text-xs text-slate-500">{selectedTx.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 bg-slate-50/50">
              {/* Detail Info */}
              <div className="p-6 border-b border-slate-100 bg-white">
                <h4 className="text-xl font-bold text-slate-900 mb-1">{selectedTx.namaProgram}</h4>
                <p className="text-sm font-semibold text-slate-500 mb-4">{selectedTx.nominal} &bull; {selectedTx.dusun}</p>

                {txDetail && (
                  <div className="flex gap-4 mb-4">
                    {txDetail.buktiGeotagUrl && (
                      <a href={txDetail.buktiGeotagUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
                        <MapPin className="w-4 h-4" /> Foto Geotag
                      </a>
                    )}
                    {txDetail.buktiPdfUrl && (
                      <a href={txDetail.buktiPdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
                        <FileText className="w-4 h-4" /> Berita Acara PDF
                      </a>
                    )}
                  </div>
                )}
                {!txDetail && <p className="text-sm text-slate-400 animate-pulse">Memuat bukti...</p>}
              </div>

              {/* Thread Komentar / Catatan Pengawasan */}
              <div className="px-6 py-4 flex flex-col gap-4">
                {comments.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">Belum ada catatan pengawasan.</div>
                ) : (
                  comments.map((msg: any) => {
                    // Check if message is from BPD user by role
                    const isBPD = msg.bpdUser?.role === 'BPD';
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[85%] ${!isBPD ? 'self-start mr-12' : 'self-end items-end ml-12'}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-700">{msg.bpdUser?.nama || 'Sistem'} ({msg.bpdUser?.role || 'User'})</span>
                          <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                        <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm border ${
                          isBPD 
                            ? 'bg-blue-50 border-blue-200 text-blue-900 rounded-tr-sm' 
                            : 'bg-white border-slate-200 text-slate-700 rounded-tl-sm'
                        }`}>
                          {msg.catatan}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
              <input 
                type="text" 
                placeholder="Tambahkan catatan pengawasan untuk transaksi ini..." 
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50"
              />
              <button 
                onClick={handleReply}
                disabled={submittingReply}
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {submittingReply ? 'Mengirim...' : 'Kirim Catatan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </RoleLayout>
  );
}
