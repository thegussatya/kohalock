import PageHeader from '../../components/PageHeader';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import RoleLayout from '../../components/RoleLayout';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { BPD_ADAT_MENU } from './menu';
import apiClient from '../../lib/apiClient';

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
];

export default function TransactionMonitoringPage() {
  const [data, setData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([
    { id: 1, sender: 'BPD (Anda)', role: 'BPD', content: 'Mohon tinjau kembali urgensi pengadaan aspal untuk Dusun 2, mengingat anggaran sebelumnya belum terserap penuh.', time: '10:30 WIB' },
    { id: 2, sender: 'Ahmad Fauzi', role: 'Kades', content: 'Terima kasih atas masukannya. Pengadaan ini diperlukan segera karena ada event desa bulan depan, namun akan kami evaluasi ulang volumenya.', time: '11:15 WIB' }
  ]);
  const [newReply, setNewReply] = useState('');

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

  const handleReply = () => {
    if (!newReply.trim()) return;
    setComments([
      ...comments,
      { id: Date.now(), sender: 'BPD (Anda)', role: 'BPD', content: newReply, time: 'Baru saja' }
    ]);
    setNewReply('');
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
    return undefined;
  };

  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Bapak RT/Adat" userRole="BPD / Tokoh Adat" settingsPath="/bpd-adat/pengaturan">
      <PageHeader title="Pantauan Transaksi" />
      {/* Read-Only Notice */}
      <div className="mb-6 p-4 bg-slate-100 border-l-4 border-slate-500 rounded-r-lg shadow-sm max-w-2xl">
        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

      {/* Thread Komentar / Catatan Pengawasan */}
      <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Catatan Pengawasan & Evaluasi</h3>
            <p className="text-xs text-slate-500">Diskusi dan catatan terkait transaksi berjalan</p>
          </div>
        </div>
        <div className="p-6 flex flex-col gap-4 bg-slate-50/50">
          {comments.map((msg) => {
            const isKades = msg.role === 'Kades';
            return (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${isKades ? 'self-start ml-12' : 'self-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700">{msg.sender}</span>
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm border ${
                  isKades 
                    ? 'bg-brand-50 border-brand-200 text-brand-900 rounded-tl-sm' 
                    : 'bg-white border-slate-200 text-slate-700 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
          <input 
            type="text" 
            placeholder="Ketik balasan Anda..." 
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReply()}
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50"
          />
          <button 
            onClick={handleReply}
            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
          >
            Kirim
          </button>
        </div>
      </div>
    </RoleLayout>
  );
}
