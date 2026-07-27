import { Search, FileSearch, Workflow, LockKeyhole, Download, HelpCircle, Kanban, FileStack } from 'lucide-react';

export const AUDITOR_MENU = [
  { label: 'Beranda Forensik', path: '/auditor', icon: Search },
  { label: 'Manajemen Kasus', path: '/auditor/kasus', icon: Kanban },
  { label: 'Uji Alat Bukti', path: '/auditor/uji-bukti', icon: FileSearch },
  { label: 'Kronologi Transaksi', path: '/auditor/ledger', icon: Workflow },
  { label: 'Kotak Masuk Rahasia', path: '/auditor/kotak-rahasia', icon: LockKeyhole },
  { label: 'Ekspor Laporan Hukum', path: '/auditor/ekspor-laporan', icon: Download },
  { label: 'Template Laporan', path: '/auditor/template-laporan', icon: FileStack },
  { label: 'Bantuan', path: '/auditor/bantuan', icon: HelpCircle },
];
