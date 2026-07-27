const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'src', 'features');

const menus = {
  'KAUR_TEKNIS_MENU': {
    import: "import { LayoutDashboard, FilePlus, Wallet, History } from 'lucide-react';",
    content: `const KAUR_TEKNIS_MENU = [
  { label: 'Dashboard', path: '/kaur-teknis', icon: LayoutDashboard },
  { label: 'Formulir Musrembang', path: '/kaur-teknis/musrembang', icon: FilePlus },
  { label: 'Ajukan Pencairan', path: '/kaur-teknis/pencairan', icon: Wallet },
  { label: 'Riwayat Penolakan', path: '/kaur-teknis/penolakan', icon: History },
];`
  },
  'SEKDES_MENU': {
    import: "import { LayoutDashboard, FileCheck, PieChart, MessageCircle } from 'lucide-react';",
    content: `const SEKDES_MENU = [
  { label: 'Dashboard', path: '/sekdes', icon: LayoutDashboard },
  { label: 'Verifikasi Pengajuan', path: '/sekdes/verifikasi', icon: FileCheck },
  { label: 'Pantauan Anggaran', path: '/sekdes/pantauan-anggaran', icon: PieChart },
  { label: 'Inbox Klarifikasi Warga', path: '/sekdes/klarifikasi', icon: MessageCircle },
];`
  },
  'KADES_MENU': {
    import: "import { LayoutDashboard, BadgeCheck, ShieldAlert, QrCode, Settings } from 'lucide-react';",
    content: `const KADES_MENU = [
  { label: 'Dashboard (Executive)', path: '/kades', icon: LayoutDashboard },
  { label: 'Persetujuan Pencairan', path: '/kades/persetujuan-pencairan', icon: BadgeCheck },
  { label: 'Perisai Integritas (Log Intervensi)', path: '/kades/perisai-integritas', icon: ShieldAlert },
  { label: 'Pusat Klarifikasi Publik', path: '/kades/klarifikasi-publik', icon: QrCode },
  { label: 'Pengaturan & Kredensial', path: '/kades/pengaturan', icon: Settings },
];`
  },
  'PUBLIK_MENU': {
    import: "import { Home, Building2, MessageCircleQuestion, Lock } from 'lucide-react';",
    content: `const PUBLIK_MENU = [
  { label: 'Beranda', path: '/publik', icon: Home },
  { label: 'Pantau Proyek', path: '/publik/proyek', icon: Building2 },
  { label: 'Klarifikasi', path: '/publik/klarifikasi', icon: MessageCircleQuestion },
  { label: 'Lapor Rahasia', path: '/publik/lapor-rahasia', icon: Lock },
];`
  },
  'AUDITOR_MENU': {
    import: "import { Search, FileSearch, Workflow, MailLock, Download } from 'lucide-react';",
    content: `const AUDITOR_MENU = [
  { label: 'Beranda Forensik', path: '/auditor', icon: Search },
  { label: 'Uji Alat Bukti (Integrity Checker)', path: '/auditor/uji-bukti', icon: FileSearch },
  { label: 'Kronologi Transaksi', path: '/auditor/ledger', icon: Workflow },
  { label: 'Kotak Masuk Rahasia', path: '/auditor/inbox-rahasia', icon: MailLock },
  { label: 'Ekspor Laporan Hukum', path: '/auditor/ekspor-laporan', icon: Download },
];`
  },
  'BPD_ADAT_MENU': {
    import: "import { LayoutDashboard, Eye, Scale, Archive, Settings } from 'lucide-react';",
    content: `const BPD_ADAT_MENU = [
  { label: 'Beranda Pengawasan (Dashboard Bersama)', path: '/bpd-adat', icon: LayoutDashboard },
  { label: 'Pantauan Transaksi (Khusus BPD)', path: '/bpd-adat/pantauan-transaksi', icon: Eye },
  { label: 'Papan Resolusi Adat (Khusus Tokoh Adat)', path: '/bpd-adat/resolusi-adat', icon: Scale },
  { label: 'Arsip Pengawasan & Etik', path: '/bpd-adat/arsip', icon: Archive },
  { label: 'Pengaturan Akun', path: '/bpd-adat/pengaturan', icon: Settings },
];`
  }
};

let updatedFiles = [];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      for (const [menuName, menuData] of Object.entries(menus)) {
        const menuRegex = new RegExp(\`const \\\\s*\` + menuName + \`\\\\s*=\\\\s*\\\\[[\\\\s\\\\S]*?\\\\];\`, 'm');
        if (menuRegex.test(content)) {
          // Replace menu definition
          content = content.replace(menuRegex, menuData.content);
          
          // Inject import if not exists
          if (!content.includes('lucide-react')) {
            // Find first import statement
            const importRegex = /import.*?;/m;
            content = content.replace(importRegex, (match) => {
              return match + '\\n' + menuData.import;
            });
          }
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        updatedFiles.push(fullPath);
      }
    }
  }
}

processDir(featuresDir);
console.log('Updated ' + updatedFiles.length + ' files:');
console.log(updatedFiles.join('\\n'));
