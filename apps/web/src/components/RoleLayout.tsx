import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Settings, LogOut } from 'lucide-react';

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
      case 'Kaur Teknis':
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
          { label: 'Uji Alat Bukti', path: '/auditor/uji-bukti', category: 'Halaman' },
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
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 text-slate-900">
      
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 shrink-0">
        <Link to={basePath} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/logo.svg" width={32} height={32} alt="KohaLock Logo" className="object-contain" />
          <span className="text-xl font-black text-brand-600 uppercase tracking-wide">KohaLock</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Overlay Backdrop (Mobile only) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-[280px] bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 text-xl font-bold text-brand-900 border-b border-slate-100 flex items-center justify-between">
          <Link to={basePath} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo.svg" width={32} height={32} alt="KohaLock Logo" className="object-contain" />
            <span className="font-black text-brand-600 uppercase tracking-wide">KohaLock</span>
          </Link>
          {/* Close button for mobile */}
          <button 
            className="md:hidden p-1 text-slate-500 hover:text-slate-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <li key={menu.path}>
                  <Link
                    to={menu.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 transition-colors rounded-lg text-sm flex items-center gap-3 whitespace-nowrap overflow-hidden text-ellipsis ${
                      isActive 
                        ? 'bg-brand-50 text-brand-600 font-bold border-l-4 border-brand-500' 
                        : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    {menu.icon && <menu.icon className="w-5 h-5 shrink-0" />}
                    {menu.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer Sidebar */}
        <div className="mt-auto border-t border-slate-200 p-4 flex flex-col gap-1">
          {settingsPath && (
            <Link
              to={settingsPath}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-5 h-5 shrink-0" /> Pengaturan
            </Link>
          )}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut className="w-5 h-5 shrink-0" /> Logout
          </Link>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="md:ml-[280px] flex-1 flex flex-col h-screen min-w-0 bg-slate-50">
        <div className="hidden md:block">
          <Topbar userName={userName} userRole={userRole} searchData={searchData} />
        </div>
        <main className="flex-1 p-4 py-6 md:p-10 overflow-auto w-full text-left">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
