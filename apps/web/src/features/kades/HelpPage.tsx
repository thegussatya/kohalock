import React from 'react';
import SharedHelpPage from '../shared/HelpPage';
import { LayoutDashboard, BadgeCheck, ShieldAlert, QrCode, Settings, HelpCircle, History, BarChart3 } from 'lucide-react';
import { KADES_MENU } from './menu';



export default function HelpPage() {
  const faqItems = [
    { question: 'Bagaimana cara menyetujui pencairan dana?', answer: 'Masuk ke menu Persetujuan Pencairan, periksa ringkasan yang telah diverifikasi oleh Sekdes, lalu masukkan PIN/Kredensial otorisasi Anda.' },
    { question: 'Kapan saya harus menggunakan fitur Perisai Integritas?', answer: 'Gunakan Perisai Integritas sebagai tombol darurat (panic button) apabila terdapat tekanan atau intervensi non-prosedural dari pihak luar yang memaksa pencairan dana.' },
    { question: 'Apa fungsi Pusat Klarifikasi Publik?', answer: 'Halaman ini memungkinkan Kades memantau seluruh interaksi warga yang bertanya terkait proyek, serta memberikan pernyataan resmi terhadap isu yang beredar.' },
    { question: 'Bagaimana jika saya lupa kredensial login/PIN saya?', answer: 'Silakan masuk ke halaman Pengaturan & Kredensial jika masih memiliki akses, atau hubungi tim teknis pengembang untuk reset perangkat secara aman.' },
  ];

  return (
    <SharedHelpPage
      menuItems={KADES_MENU}
      userName="Ahmad Fauzi"
      userRole="Kepala Desa"
      settingsPath="/kades/pengaturan"
      faqItems={faqItems}
    />
  );
}
