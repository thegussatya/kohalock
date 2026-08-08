import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import Badge from '../../components/Badge';
import { KAUR_KEUANGAN_MENU } from './menu';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [autoLogoffEnabled, setAutoLogoffEnabled] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Berhasil logout dari sistem');
    navigate('/login');
  };

  const handleUpdateCredential = () => {
    toast('Fitur pembaruan kredensial ECDSA dalam pengembangan', { icon: '🔐' });
  };

  const handleUpdatePin = () => {
    toast('Fitur ubah PIN/Kata sandi dalam pengembangan', { icon: '🔒' });
  };

  return (
    <RoleLayout menuItems={KAUR_KEUANGAN_MENU} userName="Hastuti" userRole="Kaur Keuangan" settingsPath="/kaur-keuangan/pengaturan">
      <div className="mb-8">
        <PageHeader title="Pengaturan & Kredensial" description="Kelola profil profil identitas digital, perbarui sertifikat enkripsi, dan amankan akun Anda." />
      </div>

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
                  value="Hastuti"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jabatan</label>
                <input 
                  type="text" 
                  readOnly 
                  value="Kaur Keuangan / Bendahara Desa"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none cursor-not-allowed"
                />
              </div>
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
                <button onClick={handleUpdateCredential} className="w-full p-3.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Perbarui Kredensial
                </button>
                <button onClick={handleUpdatePin} className="w-full p-3.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  Ubah PIN/Kata Sandi
                </button>
              </div>
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
                <div 
                  onClick={() => setNotifEnabled(!notifEnabled)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${notifEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifEnabled ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Auto-Logoff</h4>
                  <p className="text-xs text-slate-500">Keluarkan sesi jika tidak aktif selama 15 menit.</p>
                </div>
                <div 
                  onClick={() => setAutoLogoffEnabled(!autoLogoffEnabled)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${autoLogoffEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoLogoffEnabled ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </div>
          
          <button onClick={handleLogout} className="w-full p-4 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Keluar Sistem (Log Out)
          </button>
        </div>

      </div>
    </RoleLayout>
  );
}
