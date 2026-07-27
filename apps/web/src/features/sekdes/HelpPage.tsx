import React from 'react';
import SharedHelpPage from '../shared/HelpPage';
import { LayoutDashboard, FileCheck, PieChart, MessageCircle, HelpCircle, History } from 'lucide-react';
import { SEKDES_MENU } from './menu';



export default function HelpPage() {
  const faqItems = [
    { question: 'Bagaimana cara memverifikasi hash dokumen?', answer: 'Pada halaman Verifikasi Pengajuan, sistem secara otomatis akan mencocokkan hash SHA-256 dokumen PDF yang diunggah dengan data asli. Anda hanya perlu memastikan indikator keamanan berwarna hijau.' },
    { question: 'Apa yang harus diperhatikan di Split-View Reviewer?', answer: 'Pastikan kesesuaian antara dokumen PDF berita acara di sebelah kiri, dan lokasi koordinat foto geotag pada peta di sebelah kanan.' },
    { question: 'Kapan saya harus meneruskan pengajuan ke Kades?', answer: 'Setelah seluruh persyaratan dokumen, validitas foto geotag, dan ketersediaan anggaran telah dipastikan sesuai dengan RAPBDes.' },
    { question: 'Bagaimana cara merespon klarifikasi dari warga?', answer: 'Buka menu Inbox Klarifikasi Warga, pilih tiket yang belum terjawab, dan tuliskan penjelasan administratif yang transparan.' },
  ];

  return (
    <SharedHelpPage
      menuItems={SEKDES_MENU}
      userName="Siti Rahma"
      userRole="Sekretaris Desa"
      faqItems={faqItems}
    />
  );
}
