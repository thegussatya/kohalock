import { Home, Building2, MessageCircleQuestion, Lock, HelpCircle } from 'lucide-react';

export const PUBLIK_MENU = [
  { label: 'Beranda', path: '/publik', icon: Home },
  { label: 'Pantau Proyek', path: '/publik/proyek', icon: Building2 },
  { label: 'Klarifikasi', path: '/publik/klarifikasi', icon: MessageCircleQuestion },
  { label: 'Lapor Rahasia', path: '/publik/lapor-rahasia', icon: Lock },
  { label: 'Bantuan', path: '/publik/bantuan', icon: HelpCircle },
];
