import PageHeader from '../../components/PageHeader';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { LayoutDashboard, FilePlus, Wallet, History, HelpCircle, FolderKanban } from 'lucide-react';
import RoleLayout from '../../components/RoleLayout';
import { KAUR_TEKNIS_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function MusrembangFormPage() {
  const [dusun, setDusun] = useState('');
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('');
  const [volume, setVolume] = useState('');
  const [satuan, setSatuan] = useState('Meter');
  const [pagu, setPagu] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pin, setPin] = useState('');

  const formatCurrency = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw) return '';
    return 'Rp ' + parseInt(raw, 10).toLocaleString('id-ID');
  };

  const handlePaguChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPagu(formatCurrency(e.target.value));
  };

  return (
    <RoleLayout menuItems={KAUR_TEKNIS_MENU} userName="Budi Santoso" userRole="Kaur Teknis">
      <div className="mb-8">
        <PageHeader title="Formulir Musrembang (Usulan Baru)" description="Catat dan abadikan usulan pembangunan dari hasil musyawarah warga langsung ke dalam Blockchain untuk menjamin transparansi anggaran." />

      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-4xl mb-8">
        <form className="flex flex-col gap-8" onSubmit={e => e.preventDefault()}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nama Dusun/Wilayah</label>
              <select 
                value={dusun}
                onChange={e => setDusun(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="" disabled>-- Pilih Dusun --</option>
                <option value="Dusun 1">Dusun 1</option>
                <option value="Dusun 2">Dusun 2</option>
                <option value="Dusun 3">Dusun 3</option>
                <option value="Dusun 4">Dusun 4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Penanggung Jawab Usulan</label>
              <input 
                type="text" 
                readOnly
                value="Bpk. Budi Santoso (Kaur Teknis)"
                className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Unggah Daftar Hadir Warga (PDF)</label>
              <input 
                type="file" 
                accept=".pdf"
                className="w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-xl cursor-pointer bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Unggah Notulensi Rapat (PDF)</label>
              <input 
                type="file" 
                accept=".pdf"
                className="w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-xl cursor-pointer bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Unggah RAB & Desain (PDF)</label>
              <input 
                type="file" 
                accept=".pdf"
                className="w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-xl cursor-pointer bg-white transition-colors"
              />
            </div>
          </div>

          <hr className="border-slate-200" />

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Usulan Proyek</label>
            <input 
              type="text" 
              value={judul}
              onChange={e => setJudul(e.target.value)}
              placeholder="Contoh: Pembangunan Saluran Irigasi Tersier"
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-base font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kategori Program</label>
              <select 
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="" disabled>Pilih Kategori</option>
                <option value="Infrastruktur">Infrastruktur</option>
                <option value="Pemberdayaan Masyarakat">Pemberdayaan Masyarakat</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Bencana & Keadaan Darurat">Bencana & Keadaan Darurat</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Volume Pekerjaan</label>
              <div className="flex">
                <input 
                  type="number"
                  min="0"
                  onWheel={(e) => e.currentTarget.blur()}
                  value={volume}
                  onChange={e => setVolume(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 border border-r-0 border-slate-300 rounded-l-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-base font-bold"
                />
                <select
                  value={satuan}
                  onChange={e => setSatuan(e.target.value)}
                  className="p-4 border border-slate-300 rounded-r-xl bg-slate-50 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="Meter">Meter</option>
                  <option value="Unit">Unit</option>
                  <option value="Paket">Paket</option>
                  <option value="Titik">Titik</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Pagu Anggaran Maksimal</label>
              <input 
                type="text"
                value={pagu}
                onChange={handlePaguChange}
                placeholder="Rp 0"
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-base font-bold text-blue-800 bg-blue-50/50"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-wide text-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Simpan & Kunci ke Blockchain
            </button>
          </div>
        </form>
      </div>

      {/* PIN Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tanda Tangan Digital</h3>
            <p className="text-slate-600 text-sm mb-6">
              Masukkan 6 digit PIN kredensial Anda untuk menyetujui dan mengunci usulan ini.
            </p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-10 h-12 border-2 border-slate-300 rounded-lg flex items-center justify-center text-xl font-bold text-slate-900 bg-slate-50">
                  •
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setShowModal(false);
                  try {
                    const cleanPagu = Number(pagu.replace(/[^0-9]/g, ''));
                    const numVolume = Number(volume);

                    const response = await apiClient.post('/proposals', {
                      dusun,
                      judulUsulan: judul,
                      kategori,
                      volume: numVolume,
                      satuan,
                      paguMaksimal: cleanPagu
                    });
                    
                    if (response.status === 201) {
                      toast.success("Usulan berhasil disimpan ke database");
                      setDusun('');
                      setJudul('');
                      setKategori('');
                      setVolume('');
                      setSatuan('Meter');
                      setPagu('');
                    } else {
                      toast.error("Gagal menyimpan usulan");
                    }
                  } catch (error: any) {
                    const msg = error.response?.data?.error || error.response?.data?.message || "Gagal menyimpan usulan";
                    toast.error(msg);
                  }
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-sm"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
