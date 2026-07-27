import React from 'react';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';

interface ProfilePageProps {
  menuItems: any[];
  userName: string;
  userRole: string;
  settingsPath?: string;
}

export default function ProfilePage({ menuItems, userName, userRole, settingsPath }: ProfilePageProps) {
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const dummyEmail = userName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@kohalock.desa.id';

  return (
    <RoleLayout menuItems={menuItems} userName={userName} userRole={userRole} settingsPath={settingsPath}>
      <PageHeader 
        title="Profil Saya" 
        description="Kelola informasi pribadi dan keamanan akun Anda"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Kiri: Avatar & Info Singkat */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-3xl font-black mb-4 border-4 border-white shadow-sm">
              {getInitials(userName)}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{userName}</h2>
            <p className="text-slate-500 font-medium mb-1">{userRole}</p>
            <p className="text-sm text-slate-400 mb-6">{dummyEmail}</p>
            
            <div className="w-full h-px bg-slate-100 mb-6"></div>
            
            <div className="w-full text-left space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Status Akun</span>
                <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">Aktif</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Bergabung</span>
                <span className="font-semibold text-slate-700">12 Jan 2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kanan: Form Edit & Keamanan */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Edit Profil */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Informasi Dasar</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  defaultValue={userName}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  defaultValue={dummyEmail}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="pt-2">
                <button className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-sm hover:bg-brand-700 transition-colors">
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>

          {/* Keamanan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Ubah Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password Baru</label>
                <input 
                  type="password" 
                  placeholder="Masukkan password baru"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Konfirmasi Password</label>
                <input 
                  type="password" 
                  placeholder="Ketik ulang password baru"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="pt-2">
                <button className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl shadow-sm hover:bg-slate-900 transition-colors">
                  Perbarui Password
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </RoleLayout>
  );
}
