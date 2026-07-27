import { LayoutDashboard, FileCheck, History, PieChart, MessageCircle, HelpCircle } from 'lucide-react';

export const SEKDES_MENU = [
  { label: 'Dashboard', path: '/sekdes', icon: LayoutDashboard },
  { label: 'Verifikasi Pengajuan', path: '/sekdes/verifikasi', icon: FileCheck },
  { label: 'Riwayat Verifikasi', path: '/sekdes/riwayat-verifikasi', icon: History },
  { label: 'Pantauan Anggaran', path: '/sekdes/pantauan-anggaran', icon: PieChart },
  { label: 'Inbox Klarifikasi Warga', path: '/sekdes/klarifikasi', icon: MessageCircle },
  { label: 'Bantuan', path: '/sekdes/bantuan', icon: HelpCircle },
];
