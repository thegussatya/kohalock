import PageHeader from '../../components/PageHeader';
import { toast } from 'react-hot-toast';
import RoleLayout from '../../components/RoleLayout';
import { LayoutDashboard, Eye, Scale, Archive, Settings, HelpCircle, X } from 'lucide-react';
import Badge from '../../components/Badge';
import { BPD_ADAT_MENU } from './menu';
import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';

export default function AdatResolutionBoardPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [pihakTerlibat, setPihakTerlibat] = useState('');
  const [kategori, setKategori] = useState('Perselisihan Warga');
  const [keputusanResolusi, setKeputusanResolusi] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/adat-cases');
      setCases(res.data);
    } catch (err) {
      toast.error('Gagal memuat daftar kasus adat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pihakTerlibat || !kategori) {
      toast.error('Lengkapi form terlebih dahulu');
      return;
    }

    try {
      setSubmitting(true);
      // Create new case
      const res = await apiClient.post('/adat-cases', {
        pihakTerlibat: [pihakTerlibat], // Stored as JSON array
        kategori
      });

      const newId = res.data.id;

      // If they immediately provided a resolution, patch it to Selesai
      if (keputusanResolusi.trim() !== '') {
        await apiClient.patch(`/adat-cases/${newId}`, {
          status: 'SELESAI',
          keputusanResolusi
        });
      }

      toast.success('Kasus berhasil ditambahkan!');
      setIsModalOpen(false);
      setPihakTerlibat('');
      setKeputusanResolusi('');
      setKategori('Perselisihan Warga');
      fetchCases(); // refetch list
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan kasus');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Bapak RT/Adat" userRole="BPD / Tokoh Adat" settingsPath="/bpd-adat/pengaturan">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <PageHeader title="Papan Resolusi Adat" description="Wadah penyelesaian perkara dan mediasi damai berbasis kearifan lokal (Khusus Tokoh Adat)." />
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
        >
          + Tambah Kasus Baru
        </button>
      </div>

      {loading ? (
        <div className="text-center p-8 text-slate-500 font-semibold animate-pulse">Memuat kasus...</div>
      ) : cases.length === 0 ? (
        <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">Belum ada kasus adat yang dicatat.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow h-full"
            >
              <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
                <Badge label={item.kategori} variant="neutral" />
                <Badge 
                  label={item.status === 'SELESAI' ? 'Selesai/Mufakat' : 'Sedang Musyawarah'} 
                  variant={item.status === 'SELESAI' ? 'success' : 'warning'} 
                />
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
                {Array.isArray(item.pihakTerlibat) ? item.pihakTerlibat.join(' vs ') : item.pihakTerlibat}
              </h3>
              
              <div className="text-sm text-slate-600 mb-6 flex-grow">
                {item.status === 'SELESAI' ? (
                  <div>
                    <span className="font-semibold text-green-700 block mb-1">Hasil Resolusi:</span>
                    {item.keputusanResolusi || '-'}
                  </div>
                ) : (
                  <p className="italic text-slate-400">Belum ada keputusan resolusi. Masih dalam proses musyawarah.</p>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-100 text-[11px] font-medium text-slate-400 mt-auto flex justify-between items-center">
                <span>Dilaporkan: {new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                <span>Oleh: {item.dicatatOleh?.nama || 'Sistem'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Kasus Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Catat Kasus Adat Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori Kasus</label>
                <select 
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Perselisihan Warga">Perselisihan Warga</option>
                  <option value="Sengketa Batas Tanah">Sengketa Batas Tanah</option>
                  <option value="Pelanggaran Integritas Aparat">Pelanggaran Integritas Aparat</option>
                  <option value="Sengketa Warisan">Sengketa Warisan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pihak Terlibat</label>
                <input 
                  type="text" 
                  value={pihakTerlibat}
                  onChange={(e) => setPihakTerlibat(e.target.value)}
                  placeholder="Contoh: Keluarga Bpk. Subandi vs Keluarga Bpk. Yanto"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Keputusan Resolusi <span className="text-slate-400 font-normal">(Opsional, jika sudah damai)</span>
                </label>
                <textarea 
                  value={keputusanResolusi}
                  onChange={(e) => setKeputusanResolusi(e.target.value)}
                  placeholder="Tuliskan hasil musyawarah jika sudah ada kesepakatan damai..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
                <p className="text-xs text-slate-500 mt-1">Jika dikosongkan, status kasus akan menjadi "Sedang Musyawarah".</p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Catatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
