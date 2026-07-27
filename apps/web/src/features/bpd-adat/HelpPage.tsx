import React from 'react';
import SharedHelpPage from '../shared/HelpPage';
import { LayoutDashboard, Eye, Scale, Archive, Settings, HelpCircle } from 'lucide-react';
import { BPD_ADAT_MENU } from './menu';



export default function HelpPage() {
  const faqItems = [
    { question: 'Apa fungsi dari Papan Resolusi Adat?', answer: 'Papan ini digunakan untuk mencatat dan melacak penyelesaian sengketa atau permasalahan non-keuangan yang ditangani menggunakan pendekatan kearifan lokal secara off-chain.' },
    { question: 'Apakah saya bisa membatalkan transaksi yang mencurigakan?', answer: 'Tidak. Peran BPD bersifat pengawasan (read-only) dan preventif. Anda dapat memberikan catatan peringatan atau \'red flags\' yang akan menahan sementara atau menjadi notifikasi bagi Kades/Sekdes.' },
    { question: 'Kapan saya harus memberikan catatan pengawasan?', answer: 'Anda dapat memberikan catatan saat menemukan indikasi kejanggalan dalam alur pengajuan di menu Pantauan Transaksi.' },
    { question: 'Siapa yang bisa melihat Arsip Pengawasan & Etik?', answer: 'Arsip ini digunakan untuk bahan evaluasi tahunan kinerja Kades dan aparat, dan dapat diakses oleh pihak yang memiliki wewenang dalam BPD & Tokoh Adat.' },
  ];

  return (
    <SharedHelpPage
      menuItems={BPD_ADAT_MENU}
      userName="Bapak RT/Adat"
      userRole="BPD / Tokoh Adat"
      settingsPath="/bpd-adat/pengaturan"
      faqItems={faqItems}
    />
  );
}
