import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';
import RoleLayout from '../../components/RoleLayout';
import PinModal from '../../components/PinModal';
import PageHeader from '../../components/PageHeader';
import DataTable, { type TableColumn } from '../../components/DataTable';
import { KAUR_KEUANGAN_MENU } from './menu';
import { toast } from 'react-hot-toast';
import { ShieldAlert, AlertTriangle, Trash2 } from 'lucide-react';
import DocumentPreviewViewer from '../../components/DocumentPreviewViewer';

const COLUMNS: TableColumn[] = [
  { key: 'tanggal', label: 'Tanggal Otorisasi' },
  { key: 'program', label: 'Nama Program' },
  { key: 'nominal', label: 'Nominal' },
  { key: 'kades', label: 'Nama Kades Pengotorisasi' },
  { key: 'aksi', label: 'Aksi' },
];

export default function ExecutionQueuePage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPanicking, setIsPanicking] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicRowId, setPanicRowId] = useState<string | null>(null);
  const [pajakList, setPajakList] = useState<{jenisPajak: string, nominal: string}[]>([]);

  const TAX_OPTIONS = ["PPN", "PPh 21", "PPh 22", "PPh 23", "Pajak Daerah", "Lainnya"];

  const fetchData = () => {
    apiClient.get('/disbursements/execution-queue').then(res => {
      const formatted = res.data.map((item: any) => ({
        id: item.id,
        tanggal: item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString('id-ID') : new Date(item.submittedAt).toLocaleDateString('id-ID'),
        program: item.proposal?.judulUsulan || '-',
        nominal: `Rp ${Number(item.nominal).toLocaleString('id-ID')}`,
        kades: item.kadesApprover?.nama || '-',
        fotoUrl: item.fotoUrl,
        beritaAcaraUrl: item.beritaAcaraUrl,
        lpjTeknisUrl: item.lpjTeknisUrl
      }));
      setData(formatted);
    }).catch(err => {
      console.error(err);
      toast.error('Gagal mengambil antrean eksekusi');
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case 'tanggal':
        return <span className="text-slate-600">{row.tanggal}</span>;
      case 'program':
        return <span className="font-semibold text-slate-900">{row.program}</span>;
      case 'nominal':
        return <span className="font-bold text-slate-900">{row.nominal}</span>;
      case 'kades':
        return <span className="text-slate-600">{row.kades}</span>;
      case 'aksi':
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedTx(row);
                setPajakList([]);
                setShowConfirmModal(true);
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Eksekusi & Catat
            </button>
            <button 
                onClick={() => {
                  setPanicRowId(row.id);
                  setShowPanicModal(true);
                }}
                disabled={isPanicking}
                className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                <ShieldAlert className="w-4 h-4" />
                Panic
              </button>
          </div>
        );
      default:
        return row[columnKey];
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
        title="Antrean Eksekusi Dana" 
        description="Transaksi yang telah diotorisasi Kades, menunggu eksekusi pemindahan dana riil" 
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={COLUMNS}
          data={data}
          renderCell={renderCell}
        />
      </div>

      {/* Konfirmasi Modal */}
      {showConfirmModal && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Eksekusi Dana</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Anda akan mengeksekusi dana sebesar <strong className="text-slate-900">{selectedTx.nominal}</strong> untuk <strong className="text-slate-900">{selectedTx.program}</strong>.
            </p>

            <div className="mb-8 max-h-64 overflow-y-auto text-left rounded-xl border border-slate-100 bg-slate-50/50 p-2">
              <DocumentPreviewViewer
                fotoUrl={selectedTx.fotoUrl}
                beritaAcaraUrl={selectedTx.beritaAcaraUrl}
                lpjTeknisUrl={selectedTx.lpjTeknisUrl}
              />
            </div>

            <div className="text-left mb-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800">Potongan Pajak (Opsional)</h4>
                <button 
                  onClick={() => setPajakList([...pajakList, { jenisPajak: 'PPN', nominal: '' }])}
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  + Tambah Baris Pajak
                </button>
              </div>
              
              {pajakList.map((p, idx) => (
                <div key={idx} className="flex gap-2 mb-3 items-start animate-in fade-in duration-200">
                  <select 
                    value={p.jenisPajak}
                    onChange={(e) => {
                      const newList = [...pajakList];
                      newList[idx].jenisPajak = e.target.value;
                      setPajakList(newList);
                    }}
                    className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    {TAX_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">Rp</span>
                    <input 
                      type="text"
                      value={p.nominal}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const formatted = val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '';
                        const newList = [...pajakList];
                        newList[idx].nominal = formatted;
                        setPajakList(newList);
                      }}
                      placeholder="0"
                      className="w-full border border-slate-300 rounded-lg p-2.5 pl-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <button 
                    onClick={() => setPajakList(pajakList.filter((_, i) => i !== idx))}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {pajakList.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-4 text-xs text-blue-800">
                  <strong className="block mb-1">Informasi:</strong>
                  Kas keluar tetap dicatat penuh sesuai tagihan. Pajak akan dicatat terpisah ke dalam Buku Pajak. Total pajak: <strong>Rp {pajakList.reduce((acc, curr) => acc + (Number(curr.nominal.replace(/\D/g, '')) || 0), 0).toLocaleString('id-ID')}</strong>.
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowModal(true);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-sm"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      <PinModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Otorisasi Eksekusi"
        description="Masukkan 6 digit PIN Anda untuk mengeksekusi dan mencatat transaksi ke Buku Kas Umum."
        onConfirm={async (pin) => {
          if (isSubmitting || !selectedTx) return;
          setIsSubmitting(true);
          try {
            await apiClient.post(`/disbursements/${selectedTx.id}/execute`, {
              pin,
              pajak: pajakList.filter(p => p.jenisPajak && p.nominal).map(p => ({
                jenisPajak: p.jenisPajak,
                nominal: Number(p.nominal.replace(/\./g, ''))
              }))
            });
            setShowModal(false);
            toast.success("Dana berhasil dieksekusi & otomatis tercatat ke Buku Kas Umum");
            fetchData();
          } catch (error: any) {
            toast.error(error.response?.data?.error || "Gagal melakukan eksekusi");
          } finally {
            setIsSubmitting(false);
          }
        }}
        isLoading={isSubmitting}
      />

      {showPanicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Panic Button</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              BAHAYA: Fitur ini akan mencatat transaksi ini lalu membekukannya secara permanen karena adanya indikasi intervensi. Lanjutkan?
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-6">
              <button 
                type="button"
                onClick={() => {
                  setShowPanicModal(false);
                  setPanicRowId(null);
                }}
                disabled={isPanicking}
                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold w-full sm:w-auto"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={async () => {
                  if (!panicRowId) return;
                  setIsPanicking(true);
                  try {
                    await apiClient.post(`/disbursements/${panicRowId}/reject-intervention`, { alasan: "Intervensi saat pencairan (Kaur Keuangan)" });
                    toast.success('Transaksi BERHASIL DIBEKUKAN secara permanen!');
                    fetchData();
                    setShowPanicModal(false);
                    setPanicRowId(null);
                  } catch (error) {
                    toast.error('Gagal membekukan transaksi');
                  } finally {
                    setIsPanicking(false);
                  }
                }}
                disabled={isPanicking}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-sm flex justify-center items-center gap-2 w-full sm:w-auto"
              >
                {isPanicking ? "Membekukan..." : "Ya, Bekukan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}

