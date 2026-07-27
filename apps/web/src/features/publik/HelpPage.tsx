import React from 'react';
import SharedHelpPage from '../shared/HelpPage';
import { Home, Building2, MessageCircleQuestion, Lock, HelpCircle } from 'lucide-react';
import { PUBLIK_MENU } from './menu';



export default function HelpPage() {
  const faqItems = [
    { question: 'Apa itu Pagu Anggaran?', answer: 'Pagu Anggaran adalah batas maksimal dana yang dialokasikan atau disetujui untuk suatu kegiatan/proyek desa dalam periode tertentu.' },
    { question: 'Bagaimana cara melihat progres proyek desa?', answer: 'Anda dapat masuk ke menu Pantau Proyek untuk melihat daftar proyek yang sedang berjalan beserta persentase realisasi dana dan foto lapangan.' },
    { question: 'Apakah identitas saya aman saat memakai fitur Lapor Rahasia?', answer: 'Sangat aman. Laporan Anda dienkripsi secara end-to-end langsung di perangkat Anda, dan hanya Auditor/Inspektorat yang memiliki kunci untuk membacanya. Aparat desa tidak dapat melihat pelapor maupun isi laporannya.' },
    { question: 'Bagaimana cara mengajukan klarifikasi?', answer: 'Gunakan halaman Klarifikasi untuk mengajukan pertanyaan publik terkait anggaran. Pertanyaan Anda akan dijawab secara resmi oleh Sekdes atau Kades.' },
  ];

  return (
    <SharedHelpPage
      menuItems={PUBLIK_MENU}
      userName="Warga"
      userRole="Masyarakat"
      faqItems={faqItems}
    />
  );
}
