import React from 'react';
import HelpPage, { type FAQItem } from '../shared/HelpPage';
import { KAUR_KEUANGAN_MENU } from './menu';

const KAUR_KEUANGAN_FAQS: FAQItem[] = [
  {
    question: "Apa beda Transaksi Koreksi dengan mengedit langsung?",
    answer: "Transaksi Koreksi membuat jurnal pembalik tanpa menghapus atau menimpa data transaksi asli. Hal ini memastikan seluruh riwayat perubahan (audit trail) tetap transparan dan memenuhi standar akuntansi keuangan desa yang baku."
  },
  {
    question: "Kenapa buku bulan lalu tidak bisa diedit lagi?",
    answer: "Sistem menggunakan penguncian kriptografi (hash-lock) pada setiap penutupan bulan. Hal ini ditujukan untuk menyegel data secara permanen, guna menjamin integritas dan keabsahan angka realisasi saat pelaporan ke kepala desa maupun inspektorat."
  },
  {
    question: "Bagaimana proses rekonsiliasi bank yang benar?",
    answer: "Pastikan seluruh transaksi mutasi yang tercetak di rekening koran bank telah dicatat di dalam sistem (termasuk potongan administrasi dan bunga). Setelah itu, cocokkan nilai akhir pada Buku Bank di sistem dengan saldo akhir di rekening koran Anda. Jika cocok, klik tombol rekonsiliasi."
  },
  {
    question: "Kapan tenggat pelaporan LPJ?",
    answer: "Tenggat pelaporan mengikuti kalender desa dan instruksi kabupaten, umumnya selambat-lambatnya 1 bulan setelah semester/tahun berakhir. Sistem Kohalock akan memunculkan spanduk peringatan berwarna kuning bila tenggat waktu pelaporan mulai dekat."
  }
];

export default function KaurKeuanganHelpPage() {
  return (
    <HelpPage
      menuItems={KAUR_KEUANGAN_MENU}
      userName="Hastuti"
      userRole="Kaur Keuangan"
      settingsPath="/kaur-keuangan/pengaturan"
      faqItems={KAUR_KEUANGAN_FAQS}
    />
  );
}
