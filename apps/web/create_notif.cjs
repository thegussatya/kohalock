const fs = require('fs');
const path = require('path');

const roles = [
  {
    name: 'kaur-teknis',
    varName: 'KaurTeknis',
    userName: 'Budi Santoso',
    userRole: 'Kaur Teknis',
    menu: `const KAUR_TEKNIS_MENU = [
  { label: 'Dashboard', path: '/kaur-teknis', icon: LayoutDashboard },
  { label: 'Formulir Musrembang', path: '/kaur-teknis/formulir-musrembang', icon: FilePlus },
  { label: 'Ajukan Pencairan', path: '/kaur-teknis/ajukan-pencairan', icon: Wallet },
  { label: 'Riwayat Penolakan', path: '/kaur-teknis/riwayat-penolakan', icon: History },
];`,
    icons: 'LayoutDashboard, FilePlus, Wallet, History',
    settingsPath: ''
  },
  {
    name: 'sekdes',
    varName: 'Sekdes',
    userName: 'Siti Rahma',
    userRole: 'Sekretaris Desa',
    menu: `const SEKDES_MENU = [
  { label: 'Dashboard', path: '/sekdes', icon: LayoutDashboard },
  { label: 'Verifikasi Pengajuan', path: '/sekdes/verifikasi', icon: FileCheck },
  { label: 'Pantauan Anggaran', path: '/sekdes/pantauan-anggaran', icon: PieChart },
  { label: 'Inbox Klarifikasi Warga', path: '/sekdes/klarifikasi', icon: MessageCircle },
];`,
    icons: 'LayoutDashboard, FileCheck, PieChart, MessageCircle',
    settingsPath: ''
  },
  {
    name: 'kades',
    varName: 'Kades',
    userName: 'Ahmad Fauzi',
    userRole: 'Kepala Desa',
    menu: `const KADES_MENU = [
  { label: 'Dashboard (Executive)', path: '/kades', icon: LayoutDashboard },
  { label: 'Persetujuan Pencairan', path: '/kades/persetujuan-pencairan', icon: BadgeCheck },
  { label: 'Perisai Integritas (Log Intervensi)', path: '/kades/perisai-integritas', icon: ShieldAlert },
  { label: 'Pusat Klarifikasi Publik', path: '/kades/klarifikasi-publik', icon: QrCode },
  { label: 'Pengaturan & Kredensial', path: '/kades/pengaturan', icon: Settings },
];`,
    icons: 'LayoutDashboard, BadgeCheck, ShieldAlert, QrCode, Settings',
    settingsPath: 'settingsPath="/kades/pengaturan"'
  },
  {
    name: 'publik',
    varName: 'Publik',
    userName: 'Warga',
    userRole: 'Masyarakat',
    menu: `const PUBLIK_MENU = [
  { label: 'Beranda', path: '/publik', icon: Home },
  { label: 'Pantau Proyek', path: '/publik/proyek', icon: Building2 },
  { label: 'Klarifikasi', path: '/publik/klarifikasi', icon: MessageCircleQuestion },
  { label: 'Lapor Rahasia', path: '/publik/lapor-rahasia', icon: Lock },
];`,
    icons: 'Home, Building2, MessageCircleQuestion, Lock',
    settingsPath: ''
  },
  {
    name: 'auditor',
    varName: 'Auditor',
    userName: 'Inspektur Andi',
    userRole: 'Auditor / APH',
    menu: `const AUDITOR_MENU = [
  { label: 'Beranda Forensik', path: '/auditor', icon: Search },
  { label: 'Uji Alat Bukti (Integrity Checker)', path: '/auditor/uji-bukti', icon: FileSearch },
  { label: 'Kronologi Transaksi', path: '/auditor/ledger', icon: Workflow },
  { label: 'Kotak Masuk Rahasia', path: '/auditor/kotak-rahasia', icon: LockKeyhole },
  { label: 'Ekspor Laporan Hukum', path: '/auditor/ekspor-laporan', icon: Download },
];`,
    icons: 'Search, FileSearch, Workflow, LockKeyhole, Download',
    settingsPath: ''
  },
  {
    name: 'bpd-adat',
    varName: 'BpdAdat',
    userName: 'Bapak RT/Adat',
    userRole: 'BPD / Tokoh Adat',
    menu: `const BPD_ADAT_MENU = [
  { label: 'Beranda Pengawasan (Dashboard Bersama)', path: '/bpd-adat', icon: LayoutDashboard },
  { label: 'Pantauan Transaksi (Khusus BPD)', path: '/bpd-adat/pantauan-transaksi', icon: Eye },
  { label: 'Papan Resolusi Adat (Khusus Tokoh Adat)', path: '/bpd-adat/resolusi-adat', icon: Scale },
  { label: 'Arsip Pengawasan & Etik', path: '/bpd-adat/arsip', icon: Archive },
  { label: 'Pengaturan Akun', path: '/bpd-adat/pengaturan', icon: Settings },
];`,
    icons: 'LayoutDashboard, Eye, Scale, Archive, Settings',
    settingsPath: 'settingsPath="/bpd-adat/pengaturan"'
  }
];

let routerImports = '';
let routerRoutes = '';

roles.forEach(role => {
  const content = `import SharedNotificationsPage from '../shared/NotificationsPage';
import { ${role.icons} } from 'lucide-react';

${role.menu}

export default function NotificationsPage() {
  return (
    <SharedNotificationsPage 
      menuItems={${role.menu.match(/const ([A-Z_]+_MENU)/)[1]}}
      userName="${role.userName}"
      userRole="${role.userRole}"
      ${role.settingsPath}
    />
  );
}
`;
  const filePath = path.join(process.cwd(), 'src/features', role.name, 'NotificationsPage.tsx');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Created ' + filePath);

  routerImports += `import ${role.varName}Notifications from '../features/${role.name}/NotificationsPage';\n`;
  routerRoutes += `  {\n    path: '/${role.name}/notifikasi',\n    element: <${role.varName}Notifications />,\n  },\n`;
});

// Update router.tsx
const routerPath = path.join(process.cwd(), 'src/app/router.tsx');
let routerContent = fs.readFileSync(routerPath, 'utf8');

// Inject imports after last import
const importMatch = routerContent.match(/import .*;\n(?=export const router)/);
if (importMatch) {
  routerContent = routerContent.replace(importMatch[0], importMatch[0] + routerImports);
}

// Inject routes before closing bracket
routerContent = routerContent.replace(/ {2}\]\n  }\n\]\);/, routerRoutes + '  ]\n  }\n]);');
fs.writeFileSync(routerPath, routerContent, 'utf8');
console.log('Updated router.tsx');
