import { LayoutDashboard, FilePlus, FolderKanban, Wallet, History, HelpCircle } from 'lucide-react';

export const KAUR_TEKNIS_MENU = [
  { label: 'Dashboard', path: '/kaur-teknis', icon: LayoutDashboard },
  { label: 'Formulir Musrembang', path: '/kaur-teknis/formulir-musrembang', icon: FilePlus },
  { label: 'Program Saya', path: '/kaur-teknis/program-saya', icon: FolderKanban },
  { label: 'Ajukan Pencairan', path: '/kaur-teknis/ajukan-pencairan', icon: Wallet },
  { label: 'Riwayat Penolakan', path: '/kaur-teknis/riwayat-penolakan', icon: History },
  { label: 'Bantuan', path: '/kaur-teknis/bantuan', icon: HelpCircle },
];
