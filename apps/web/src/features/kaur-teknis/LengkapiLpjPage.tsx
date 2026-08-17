import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoleLayout from '../../components/RoleLayout';
import PageHeader from '../../components/PageHeader';
import { KAUR_TEKNIS_MENU } from './menu';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Save, ArrowLeft, Upload, FileSpreadsheet, Lock, CheckCircle2, Download } from 'lucide-react';
import PinModal from '../../components/PinModal';

interface LpjItemForm {
  id: string; // temp id for key
  uraian: string;
  volume: string;
  satuan: string;
  hargaSatuan: string;
}

export default function LengkapiLpjPage() {
  const { disbursementId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<LpjItemForm[]>([
    { id: Date.now().toString(), uraian: '', volume: '', satuan: '', hargaSatuan: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [disbursement, setDisbursement] = useState<any>(null);
  const [lpjStatus, setLpjStatus] = useState<string>('DRAFT');
  const [lpjTxHash, setLpjTxHash] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (disbursementId) {
      // Fetch disbursement detail to get nominal pencairan
      apiClient.get(`/disbursements/${disbursementId}`)
        .then(res => {
          setDisbursement(res.data);
          // fetch existing LPJ items if any
          return apiClient.get(`/lpj/${disbursementId}`);
        })
        .then(res => {
          const data = res.data;
          if (data && data.items && data.items.length > 0) {
            setItems(data.items.map((item: any) => ({
              id: item.id || Math.random().toString(),
              uraian: item.uraian,
              volume: item.volume.toString(),
              satuan: item.satuan,
              hargaSatuan: item.hargaSatuan.toString(),
            })));
          } else if (Array.isArray(data) && data.length > 0) {
            // fallback for old response structure
            setItems(data.map((item: any) => ({
              id: item.id || Math.random().toString(),
              uraian: item.uraian,
              volume: item.volume.toString(),
              satuan: item.satuan,
              hargaSatuan: item.hargaSatuan.toString(),
            })));
          }
          if (data.status) setLpjStatus(data.status);
          if (data.txHash) setLpjTxHash(data.txHash);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          toast.error('Gagal mengambil data');
          setLoading(false);
        });
    }
  }, [disbursementId]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), uraian: '', volume: '', satuan: '', hargaSatuan: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    if (newItems.length === 0) {
      newItems.push({ id: Date.now().toString(), uraian: '', volume: '', satuan: '', hargaSatuan: '' });
    }
    setItems(newItems);
  };

  const handleChange = (index: number, field: keyof LpjItemForm, value: string) => {
    if (lpjStatus === 'LOCKED_ONCHAIN') return;
    const newItems = [...items];
    if (field === 'hargaSatuan') {
        value = value.replace(/\D/g, ''); // Hapus semua titik/koma, hanya simpan angka mentah
    } else if (field === 'volume') {
        value = value.replace(/[^0-9.]/g, '');
    }
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      const vol = parseFloat(item.volume) || 0;
      const harga = parseInt(item.hargaSatuan) || 0;
      return acc + (vol * harga);
    }, 0);
  };

  const totalLpj = calculateTotal();
  const maxNominal = disbursement ? Number(disbursement.nominal) : 0;
  const isExceeding = totalLpj > maxNominal;

  const handleSave = async () => {
    if (isExceeding) {
      toast.error('Total belanja melebihi uang yang dicairkan!');
      return;
    }
    
    // validasi form kosong
    const hasEmpty = items.some(item => !item.uraian || !item.volume || !item.satuan || !item.hargaSatuan);
    if (hasEmpty) {
      toast.error('Mohon lengkapi semua baris rincian belanja');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('items', JSON.stringify(items));
      if (file) {
        formData.append('file', file);
      }

      await apiClient.post(`/lpj/${disbursementId}`, formData);
      toast.success('Draft LPJ berhasil disimpan');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Gagal menyimpan LPJ');
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async () => {
    if (isExceeding) {
      toast.error('Total belanja melebihi uang yang dicairkan!');
      return;
    }
    const hasEmpty = items.some(item => !item.uraian || !item.volume || !item.satuan || !item.hargaSatuan);
    if (hasEmpty) {
      toast.error('Mohon lengkapi semua baris rincian belanja sebelum mengunci');
      return;
    }

    if (!file && !disbursement?.lpjTeknisUrl) {
      toast.error('Dokumen LPJ Fisik (PDF) wajib diunggah sebelum mengunci ke Blockchain!');
      return;
    }

    setShowConfirmModal(true);
  };

  const submitWithPin = async (pin: string) => {
    setLocking(true);
    try {
      const formData = new FormData();
      formData.append('items', JSON.stringify(items));
      if (file) formData.append('file', file);
      formData.append('pin', pin);

      const res = await apiClient.post(`/disbursements/${disbursementId}/lpj`, formData);
      
      toast.success('LPJ Permanen Terkunci di Blockchain!');
      setLpjStatus('LOCKED_ONCHAIN');
      setLpjTxHash(res.data.txHash);
      setShowPinModal(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Gagal mengunci LPJ ke Blockchain');
    } finally {
      setLocking(false);
    }
  };

  const exportToExcel = () => {
    const headers = ['No', 'Uraian / Nama Barang', 'Volume', 'Satuan', 'Harga Satuan (Rp)', 'Total (Rp)'];
    const rows = items.map((item, index) => {
      const harga = Number(item.hargaSatuan || 0);
      const vol = Number(item.volume || 1);
      return [
        index + 1,
        `"${item.uraian || ''}"`,
        item.volume || '',
        `"${item.satuan || ''}"`,
        harga,
        harga * vol
      ];
    });
    
    // Add Total Row
    rows.push(['', '"TOTAL REALISASI LPJ"', '', '', '', Number(totalLpj)]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // Format filename safe
    const safeTitle = (disbursement?.proposal?.judulUsulan || 'Program').replace(/[^a-z0-9]/gi, '_');
    link.setAttribute('download', `LPJ_${safeTitle}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Memuat data...</div>;

  return (
    <RoleLayout menuItems={KAUR_TEKNIS_MENU} userName="Budi Santoso" userRole="Operator Desa">
      <div className="mb-6 print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
        <PageHeader 
          title="Lengkapi Rincian LPJ" 
          description="Masukkan rincian item belanja sesuai dengan nota atau kwitansi pengeluaran yang sah."
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="/templates/Template Laporan Pertanggungjawaban.docx" 
            download 
            className="inline-flex items-center justify-center text-sm font-bold text-blue-700 bg-white border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Template LPJ (Word)
          </a>
          <button 
            onClick={exportToExcel}
            className="inline-flex items-center justify-center text-sm font-bold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export ke Excel (CSV)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Daftar Rincian Belanja</h3>
            {lpjStatus !== 'LOCKED_ONCHAIN' && (
              <button 
                onClick={handleAddItem}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Baris
              </button>
            )}
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 font-semibold">Uraian / Nama Barang</th>
                <th className="pb-3 font-semibold w-24">Volume</th>
                <th className="pb-3 font-semibold w-24">Satuan</th>
                <th className="pb-3 font-semibold w-40">Harga Satuan (Rp)</th>
                <th className="pb-3 font-semibold w-40">Total (Rp)</th>
                <th className="pb-3 font-semibold w-12 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const vol = parseFloat(item.volume) || 0;
                const harga = parseInt(item.hargaSatuan) || 0;
                const total = vol * harga;
                
                return (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 pr-2">
                      <input 
                        type="text" 
                        value={item.uraian} 
                        onChange={(e) => handleChange(index, 'uraian', e.target.value)}
                        placeholder="Contoh: Beli Semen"
                        disabled={lpjStatus === 'LOCKED_ONCHAIN'}
                        className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </td>
                    <td className="py-3 pr-2">
                      <input 
                        type="text" 
                        value={item.volume} 
                        onChange={(e) => handleChange(index, 'volume', e.target.value)}
                        placeholder="0"
                        disabled={lpjStatus === 'LOCKED_ONCHAIN'}
                        className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-brand-500 text-center disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </td>
                    <td className="py-3 pr-2">
                      <input 
                        type="text" 
                        value={item.satuan} 
                        onChange={(e) => handleChange(index, 'satuan', e.target.value)}
                        placeholder="Sak, Hari..."
                        disabled={lpjStatus === 'LOCKED_ONCHAIN'}
                        className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-brand-500 text-center disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </td>
                    <td className="py-3 pr-2">
                      <input 
                        type="text" 
                        value={item.hargaSatuan ? Number(item.hargaSatuan).toLocaleString('id-ID') : ''} 
                        onChange={(e) => handleChange(index, 'hargaSatuan', e.target.value)}
                        placeholder="0"
                        disabled={lpjStatus === 'LOCKED_ONCHAIN'}
                        className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-brand-500 text-right disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </td>
                    <td className="py-3 pr-2">
                      <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-right font-semibold text-slate-700">
                        {total.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      {lpjStatus !== 'LOCKED_ONCHAIN' ? (
                        <button 
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="bg-amber-50 p-6 rounded-b-xl border-t border-amber-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Dokumen LPJ Fisik (PDF) - Wajib untuk Audit
            </label>
            <input 
              type="file" 
              accept=".pdf"
              disabled={lpjStatus === 'LOCKED_ONCHAIN'}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 disabled:opacity-50"
            />
            {disbursement?.lpjTeknisUrl && !file && (
              <p className="text-xs text-blue-600 font-medium mt-1">Dokumen LPJ sudah pernah diunggah.</p>
            )}
          </div>
          
          <div className="flex flex-col items-end w-full md:w-auto">
            <div className="text-sm text-amber-800 font-semibold mb-1">Total Rincian:</div>
            <div className={`text-2xl font-black ${isExceeding ? 'text-red-600' : 'text-amber-700'}`}>
              Rp {totalLpj.toLocaleString('id-ID')}
            </div>
            {isExceeding && (
              <div className="text-xs text-red-600 font-bold bg-red-100 px-2 py-1 rounded mt-1">
                Melebihi anggaran (Rp {maxNominal.toLocaleString('id-ID')})
              </div>
            )}
          </div>
        </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Ringkasan Pencairan</h3>
            
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-1">Total Dana Dicairkan</p>
              <p className="text-lg font-bold text-blue-700">Rp {maxNominal.toLocaleString('id-ID')}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-xs text-slate-500 mb-1">Status LPJ</p>
              {isExceeding ? (
                <p className="text-sm font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  Melebihi Pencairan! (-Rp {(totalLpj - maxNominal).toLocaleString('id-ID')})
                </p>
              ) : (
                <p className="text-sm font-bold text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                  Sisa Saldo: Rp {(maxNominal - totalLpj).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {lpjStatus === 'LOCKED_ONCHAIN' ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-bold text-green-700 mb-1">Terkunci Permanen</h4>
                <p className="text-xs text-green-600 break-all">{lpjTxHash}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || locking || isExceeding}
                  className="w-full py-3 bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-lg shadow-sm hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Sementara (Draft)'}
                </button>
                <button
                  onClick={handleLock}
                  disabled={saving || locking || isExceeding}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {locking ? 'Memproses...' : 'Kunci ke Blockchain'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT ONLY LAYOUT */}
      <div className="hidden print:block bg-white text-black p-4 w-full h-full absolute top-0 left-0 z-50">
        <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
          <h2 className="text-xl font-bold uppercase">Pemerintah Desa KOHALOCK</h2>
          <h1 className="text-2xl font-black uppercase mt-1">Laporan Pertanggungjawaban (LPJ)</h1>
          <p className="text-slate-600 font-medium mt-1">
            Program: {disbursement?.proposal?.judulUsulan} (Termin {disbursement?.term})
          </p>
        </div>

        <table className="w-full border-collapse border border-slate-400 text-sm mb-8">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 py-2 px-3">No</th>
              <th className="border border-slate-400 py-2 px-3 text-left">Uraian / Nama Barang</th>
              <th className="border border-slate-400 py-2 px-3">Volume</th>
              <th className="border border-slate-400 py-2 px-3">Satuan</th>
              <th className="border border-slate-400 py-2 px-3 text-right">Harga Satuan (Rp)</th>
              <th className="border border-slate-400 py-2 px-3 text-right">Total (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const harga = Number(item.hargaSatuan || 0);
              const vol = Number(item.volume || 1);
              const total = harga * vol;
              return (
                <tr key={item.id}>
                  <td className="border border-slate-400 py-2 px-3 text-center">{idx + 1}</td>
                  <td className="border border-slate-400 py-2 px-3">{item.uraian || '-'}</td>
                  <td className="border border-slate-400 py-2 px-3 text-center">{item.volume || '-'}</td>
                  <td className="border border-slate-400 py-2 px-3 text-center">{item.satuan || '-'}</td>
                  <td className="border border-slate-400 py-2 px-3 text-right">{harga.toLocaleString('id-ID')}</td>
                  <td className="border border-slate-400 py-2 px-3 text-right">{total.toLocaleString('id-ID')}</td>
                </tr>
              );
            })}
            <tr className="bg-slate-100 font-bold">
              <td colSpan={5} className="border border-slate-400 py-2 px-3 text-right">TOTAL REALISASI LPJ</td>
              <td className="border border-slate-400 py-2 px-3 text-right">{totalLpj.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end pr-12">
          <div className="text-center">
            <p className="mb-16">KOHALOCK, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Operator Desa</p>
            <p className="font-bold underline">Budi Santoso</p>
          </div>
        </div>
      </div>
      
      <PinModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onConfirm={submitWithPin} 
        isLoading={locking}
      />

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Penguncian</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              PERHATIAN! Jika dikunci ke Blockchain, data rincian belanja ini TIDAK BISA DIUBAH LAGI selamanya. Anda yakin data sudah benar?
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-6">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold w-full sm:w-auto"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowPinModal(true);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm flex justify-center items-center gap-2 w-full sm:w-auto"
              >
                Ya, Kunci Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
