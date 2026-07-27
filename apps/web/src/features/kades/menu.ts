import { LayoutDashboard, BadgeCheck, History, ShieldAlert, QrCode, BarChart3, Settings, HelpCircle } from 'lucide-react';

export const KADES_MENU = [
  { label: 'Dashboard', path: '/kades', icon: LayoutDashboard },
  { label: 'Persetujuan Pencairan', path: '/kades/persetujuan-pencairan', icon: BadgeCheck },
  { label: 'Riwayat Otorisasi', path: '/kades/riwayat-otorisasi', icon: History },
  { label: 'Perisai Integritas', path: '/kades/perisai-integritas', icon: ShieldAlert },
  { label: 'Pusat Klarifikasi Publik', path: '/kades/klarifikasi-publik', icon: QrCode },
  { label: 'Analitik Klarifikasi', path: '/kades/analitik-klarifikasi', icon: BarChart3 },
  { label: 'Pengaturan & Kredensial', path: '/kades/pengaturan', icon: Settings },
  { label: 'Bantuan', path: '/kades/bantuan', icon: HelpCircle },
];
