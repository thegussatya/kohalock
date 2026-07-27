import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { LayoutDashboard, Eye, Scale, Archive, Settings, HelpCircle } from 'lucide-react';
import { BPD_ADAT_MENU } from './menu';



export default function SettingsPage() {
  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Bapak RT/Adat" userRole="BPD / Tokoh Adat" settingsPath="/bpd-adat/pengaturan">
      <div className="mb-8">
        <PageHeader title="Pengaturan Akun" description="Kelola profil pengawas, perbarui tingkat keamanan kata sandi, dan atur email pemulihan untuk akun akses BPD/Tokoh Adat Anda." />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Profil Pengawas
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  readOnly
                  value="Bpk. I Wayan Sudarsana"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jabatan / Peran Pengawas</label>
                <input
                  type="text"
                  readOnly
                  value="Ketua Lembaga Adat Desa"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-grow">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Keamanan & Pemulihan
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Pemulihan</label>
                <input
                  type="email"
                  defaultValue="wayan.sudarsana@desa-adat.id"
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Kata Sandi</label>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi baru"
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
              <button className="w-full p-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors mt-2 shadow-sm">
                Simpan Perubahan
              </button>
            </div>
          </div>

          <button className="w-full p-4 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </div>
    </RoleLayout>
  );
}
