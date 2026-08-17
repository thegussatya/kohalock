import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Settings, LogOut, ShieldCheck } from 'lucide-react';

type MenuItem = {
  label: string;
  path: string;
  icon?: React.ElementType;
};

type RoleLayoutProps = {
  menuItems: MenuItem[];
  children: ReactNode;
  settingsPath?: string;
  userName?: string;
  userRole?: string;
};

import { Topbar } from './Topbar';

export default function RoleLayout({ menuItems, settingsPath, userName = "Nama Pengguna", userRole = "Role", children }: RoleLayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const basePath = '/' + location.pathname.split('/')[1];

  const getDummySearchData = (role: string) => {
    switch (role) {
      case 'Operator Desa':
        return [
          { label: 'Formulir Musrembang', path: '/kaur-teknis/formulir-musrembang', category: 'Halaman' },
          { label: 'Ajukan Pencairan', path: '/kaur-teknis/ajukan-pencairan', category: 'Halaman' },
          { label: 'Pembangunan Posyandu', path: '/kaur-teknis/ajukan-pencairan', category: 'Program' },
          { label: 'Pengaspalan Jalan Dusun 1', path: '/kaur-teknis/ajukan-pencairan', category: 'Program' },
          { label: 'Bantuan Bibit Jagung', path: '/kaur-teknis/riwayat-penolakan', category: 'Riwayat' },
        ];
      case 'Sekretaris Desa':
        return [
          { label: 'Verifikasi Pengajuan', path: '/sekdes/verifikasi', category: 'Halaman' },
          { label: 'Pantauan Anggaran', path: '/sekdes/pantauan-anggaran', category: 'Halaman' },
          { label: 'Pengaspalan Jalan Dusun 1', path: '/sekdes/verifikasi/1', category: 'Antrean' },
          { label: 'Pembangunan Posyandu', path: '/sekdes/verifikasi/2', category: 'Antrean' },
          { label: 'Bantuan Bibit Jagung', path: '/sekdes/verifikasi/3', category: 'Antrean' },
          { label: 'Klarifikasi Anggaran', path: '/sekdes/klarifikasi', category: 'Pesan Warga' },
        ];
      case 'Kepala Desa':
        return [
          { label: 'Persetujuan Pencairan', path: '/kades/persetujuan-pencairan', category: 'Halaman' },
          { label: 'Perisai Integritas', path: '/kades/perisai-integritas', category: 'Halaman' },
          { label: 'Pembangunan Posyandu Dusun 3', path: '/kades/persetujuan-pencairan/1', category: 'Persetujuan' },
          { label: 'Pengadaan Lampu Jalan', path: '/kades/persetujuan-pencairan/2', category: 'Persetujuan' },
          { label: 'Klarifikasi Jalan Rusak', path: '/kades/klarifikasi-publik', category: 'Pesan Warga' },
        ];
      case 'Masyarakat':
        return [
          { label: 'Pantau Proyek', path: '/publik/proyek', category: 'Halaman' },
          { label: 'Lapor Rahasia', path: '/publik/lapor-rahasia', category: 'Halaman' },
          { label: 'Proyek Pengaspalan Jalan', path: '/publik/proyek/1', category: 'Proyek' },
          { label: 'Proyek Pembangunan Posyandu', path: '/publik/proyek/2', category: 'Proyek' },
          { label: 'Klarifikasi Anggaran Jalan', path: '/publik/klarifikasi', category: 'Klarifikasi' },
        ];
      case 'Auditor / APH':
        return [
          { label: 'Verifikasi Dokumen & Bukti', path: '/auditor/uji-bukti', category: 'Halaman' },
          { label: 'Kronologi Transaksi', path: '/auditor/ledger', category: 'Halaman' },
          { label: 'TX-001 (Pengaspalan)', path: '/auditor/ledger', category: 'Transaksi' },
          { label: 'TX-002 (Posyandu)', path: '/auditor/ledger', category: 'Transaksi' },
          { label: 'Laporan Rahasia #123', path: '/auditor/kotak-rahasia', category: 'Whistleblower' },
        ];
      case 'BPD / Tokoh Adat':
        return [
          { label: 'Pantauan Transaksi', path: '/bpd-adat/pantauan-transaksi', category: 'Halaman' },
          { label: 'Resolusi Adat', path: '/bpd-adat/resolusi-adat', category: 'Halaman' },
          { label: 'Sengketa Lahan Dusun 2', path: '/bpd-adat/resolusi-adat', category: 'Kasus' },
          { label: 'Transaksi Bantuan Bibit', path: '/bpd-adat/pantauan-transaksi', category: 'Transaksi' },
        ];
      default:
        return [];
    }
  };

  const searchData = getDummySearchData(userRole);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
      
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shrink-0 sticky top-0 z-30">
        <Link to={basePath} className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1.5">
            <img src="/logo.svg" width={28} height={28} alt="KOHALOCK Logo" className="object-contain" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-brand-900 to-brand-600 bg-clip-text text-transparent tracking-wider">
            KOHALOCK
          </span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl focus:outline-none transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Overlay Backdrop (Mobile only) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-[280px] bg-white border-r border-slate-200/80 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to={basePath} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-1 bg-brand-500/20 rounded-xl blur-xs group-hover:bg-brand-500/30 transition-all" />
              <div className="relative w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center p-2">
                <img src="/logo.svg" width={32} height={32} alt="KOHALOCK Logo" className="object-contain" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-brand-900 to-brand-600 bg-clip-text text-transparent tracking-wider block leading-none">
                KOHALOCK
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5 block">
                Blockchain Ledger
              </span>
            </div>
          </Link>
          
          {/* Close button for mobile */}
          <button 
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Menu Utama
          </div>
          <ul className="space-y-1.5">
            {menuItems.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <li key={menu.path}>
                  <Link
                    to={menu.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 transition-all rounded-xl text-sm flex items-center gap-3 whitespace-nowrap overflow-hidden text-ellipsis ${
                      isActive 
                        ? 'bg-gradient-to-r from-brand-50 to-brand-100/40 text-brand-900 font-bold border-l-4 border-brand-500 shadow-xs shadow-brand-500/5' 
                        : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 font-medium'
                    }`}
                  >
                    {menu.icon && (
                      <menu.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    )}
                    <span>{menu.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer Sidebar */}
        <div className="mt-auto border-t border-slate-100 p-4 space-y-2 bg-slate-50/50">
          <div className="px-3 py-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs flex items-center justify-between mb-2">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
              <p className="text-[10px] font-medium text-brand-600 truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                {userRole}
              </p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-100" />
          </div>

          <div className="flex flex-col gap-1">
            {settingsPath && (
              <Link
                to={settingsPath}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200/60 flex items-center gap-2.5"
              >
                <Settings className="w-4 h-4 text-slate-400 shrink-0" /> 
                Pengaturan
              </Link>
            )}
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2.5"
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0" /> 
              Logout
            </Link>
          </div>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="md:ml-[280px] flex-1 flex flex-col h-screen min-w-0 bg-slate-50/60">
        <div className="hidden md:block sticky top-0 z-20">
          <Topbar userName={userName} userRole={userRole} searchData={searchData} />
        </div>
        <main className="flex-1 p-4 py-6 md:p-8 overflow-auto w-full text-left">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

