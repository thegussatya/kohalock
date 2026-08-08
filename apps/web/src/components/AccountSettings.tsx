import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { toast } from 'react-hot-toast';
import Badge from './Badge';

export default function AccountSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Ubah PIN State
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setProfile(res.data);
    } catch (error) {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      return toast.error('Konfirmasi PIN baru tidak cocok');
    }
    if (newPin.length < 6) {
      return toast.error('PIN baru minimal 6 karakter');
    }
    
    setPinLoading(true);
    try {
      await apiClient.put('/auth/change-pin', { oldPin, newPin });
      toast.success('PIN berhasil diperbarui');
      setIsChangePinOpen(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengubah PIN');
    } finally {
      setPinLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div><div className="h-2 bg-slate-200 rounded"></div></div></div></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
      
      {/* Kolom Kiri: Profil & Kredensial */}
      <div className="flex flex-col gap-6">
        
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Profil Pengguna
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
              <input 
                type="text" 
                readOnly 
                value={profile?.nama || ''}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jabatan</label>
              <input 
                type="text" 
                readOnly 
                value={profile?.jabatan || profile?.role || ''}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none cursor-not-allowed uppercase"
              />
            </div>
            {profile?.email && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" 
                  readOnly 
                  value={profile.email}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Status Kredensial Sistem
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
              <div>
                <span className="text-sm font-bold text-green-900 block">Kunci Privat / Sertifikat</span>
                <span className="text-xs font-medium text-green-700">Digital Signature (ECDSA)</span>
              </div>
              <Badge label="Aktif" variant="success" />
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsChangePinOpen(!isChangePinOpen)}
                className="w-full p-3.5 bg-blue-50 text-blue-700 border border-blue-200 font-bold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                Ubah PIN / Kata Sandi
              </button>
            </div>

            {/* Form Ubah PIN */}
            {isChangePinOpen && (
              <form onSubmit={handleChangePin} className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Lama</label>
                  <input 
                    type="password" 
                    required
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Masukkan PIN lama..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Baru</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Minimal 6 karakter..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi PIN Baru</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ulangi PIN baru..."
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsChangePinOpen(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={pinLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                  >
                    {pinLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Simpan PIN"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>

      {/* Kolom Kanan: Preferensi & Akses */}
      <div className="flex flex-col gap-6">
        
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-grow">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Preferensi Sistem
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Notifikasi Transaksi Baru</h4>
                <p className="text-xs text-slate-500">Terima pemberitahuan jika ada transaksi yang perlu dieksekusi.</p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Auto-Logoff</h4>
                <p className="text-xs text-slate-500">Keluarkan sesi jika tidak aktif selama 15 menit.</p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full p-4 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Keluar Sistem (Log Out)
        </button>
      </div>

    </div>
  );
}
