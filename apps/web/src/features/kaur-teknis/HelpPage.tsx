import React from 'react';
import SharedHelpPage from '../shared/HelpPage';
import { LayoutDashboard, FilePlus, Wallet, History, HelpCircle, FolderKanban } from 'lucide-react';
import { KAUR_TEKNIS_MENU } from './menu';



export default function HelpPage() {
  const faqItems = [
    { question: 'Bagaimana cara mengajukan formulir Musrembang?', answer: 'Anda dapat mengisi formulir pada halaman Formulir Musrembang dan melengkapi detail pagu serta dokumen pendukung.' },
    { question: 'Bagaimana cara mengambil foto geotag yang benar?', answer: 'Gunakan kamera aplikasi secara langsung dari halaman Ajukan Pencairan. Pastikan Anda berada di lokasi proyek dan memberikan izin akses lokasi pada browser Anda.' },
    { question: 'Kenapa pengajuan pencairan saya ditolak?', answer: 'Pengajuan dapat ditolak jika berkas tidak lengkap, foto geotag tidak sesuai dengan lokasi proyek, atau terdapat ketidaksesuaian nominal anggaran.' },
    { question: 'Apa yang harus saya lakukan jika pengajuan ditolak?', answer: 'Lihat catatan dari Sekdes atau Kades di halaman Riwayat Penolakan, perbaiki dokumen yang salah, dan ajukan kembali.' },
  ];

  return (
    <SharedHelpPage
      menuItems={KAUR_TEKNIS_MENU}
      userName="Budi Santoso"
      userRole="Kaur Teknis"
      faqItems={faqItems}
    />
  );
}
