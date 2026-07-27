import { LayoutDashboard, Eye, Scale, Archive, Settings, HelpCircle, CalendarDays, FileBarChart } from 'lucide-react';

export const BPD_ADAT_MENU = [
  { label: 'Beranda Pengawasan', path: '/bpd-adat', icon: LayoutDashboard },
  { label: 'Pantauan Transaksi', path: '/bpd-adat/pantauan-transaksi', icon: Eye },
  { label: 'Papan Resolusi Adat', path: '/bpd-adat/resolusi-adat', icon: Scale },
  { label: 'Kalender Musyawarah', path: '/bpd-adat/kalender-musyawarah', icon: CalendarDays },
  { label: 'Arsip Pengawasan & Etik', path: '/bpd-adat/arsip', icon: Archive },
  { label: 'Laporan Tahunan', path: '/bpd-adat/laporan-tahunan', icon: FileBarChart },
  { label: 'Pengaturan Akun', path: '/bpd-adat/pengaturan', icon: Settings },
  { label: 'Bantuan', path: '/bpd-adat/bantuan', icon: HelpCircle },
];
