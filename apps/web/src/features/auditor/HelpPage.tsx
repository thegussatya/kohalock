import React from 'react';
import SharedHelpPage from '../shared/HelpPage';
import { Search, FileSearch, Workflow, LockKeyhole, Download, HelpCircle } from 'lucide-react';
import { AUDITOR_MENU } from './menu';



export default function HelpPage() {
  const faqItems = [
    { question: 'Bagaimana cara kerja Verifikasi Dokumen & Bukti (Integrity Checker)?', answer: 'Anda dapat mengunggah dokumen dari pihak eksternal, dan sistem akan membandingkan hash kriptografinya dengan data yang telah dikunci on-chain untuk mendeteksi rekayasa dokumen.' },
    { question: 'Mengapa saya hanya memiliki akses sementara (time-bound)?', answer: 'Demi keamanan dan privasi desa, akses auditor diberikan dengan batas waktu tertentu. Akses akan otomatis terputus setelah waktu kedaluwarsa untuk mencegah penyalahgunaan data.' },
    { question: 'Siapa yang dapat melihat Kotak Masuk Rahasia?', answer: 'Hanya pihak Inspektorat/Auditor yang memiliki private key spesifik yang dapat mendekripsi isi Kotak Masuk Rahasia. Aparat desa sama sekali tidak memiliki akses ke data ini.' },
    { question: 'Bagaimana cara melihat red flags pada transaksi?', answer: 'Di menu Kronologi Transaksi, Anda bisa melihat indikator bahaya (red flags) yang dihasilkan sistem secara otomatis bila terdapat anomali pada alur pencairan.' },
  ];

  return (
    <SharedHelpPage
      menuItems={AUDITOR_MENU}
      userName="Inspektur Andi"
      userRole="Auditor / APH"
      faqItems={faqItems}
    />
  );
}
