const fs = require('fs');
const path = require('path');

const rolesData = {
  'kades': "export const KADES_MENU = [\n  { label: 'Dashboard', path: '/kades', icon: LayoutDashboard },\n  { label: 'Persetujuan Pencairan', path: '/kades/persetujuan-pencairan', icon: BadgeCheck },\n  { label: 'Riwayat Otorisasi', path: '/kades/riwayat-otorisasi', icon: History },\n  { label: 'Perisai Integritas', path: '/kades/perisai-integritas', icon: ShieldAlert },\n  { label: 'Pusat Klarifikasi Publik', path: '/kades/klarifikasi-publik', icon: QrCode },\n  { label: 'Analitik Klarifikasi', path: '/kades/analitik-klarifikasi', icon: BarChart3 },\n  { label: 'Pengaturan & Kredensial', path: '/kades/pengaturan', icon: Settings },\n  { label: 'Bantuan', path: '/kades/bantuan', icon: HelpCircle },\n];",
  'sekdes': "export const SEKDES_MENU = [\n  { label: 'Dashboard', path: '/sekdes', icon: LayoutDashboard },\n  { label: 'Verifikasi Pengajuan', path: '/sekdes/verifikasi', icon: FileCheck },\n  { label: 'Riwayat Verifikasi', path: '/sekdes/riwayat-verifikasi', icon: History },\n  { label: 'Pantauan Anggaran', path: '/sekdes/pantauan-anggaran', icon: PieChart },\n  { label: 'Inbox Klarifikasi Warga', path: '/sekdes/klarifikasi', icon: MessageCircle },\n  { label: 'Bantuan', path: '/sekdes/bantuan', icon: HelpCircle },\n];",
  'kaur-teknis': "export const KAUR_TEKNIS_MENU = [\n  { label: 'Dashboard', path: '/kaur-teknis', icon: LayoutDashboard },\n  { label: 'Formulir Musrembang', path: '/kaur-teknis/formulir-musrembang', icon: FilePlus },\n  { label: 'Program Saya', path: '/kaur-teknis/program-saya', icon: FolderKanban },\n  { label: 'Ajukan Pencairan', path: '/kaur-teknis/ajukan-pencairan', icon: Wallet },\n  { label: 'Riwayat Penolakan', path: '/kaur-teknis/riwayat-penolakan', icon: History },\n  { label: 'Bantuan', path: '/kaur-teknis/bantuan', icon: HelpCircle },\n];",
  'publik': "export const PUBLIK_MENU = [\n  { label: 'Beranda', path: '/publik', icon: Home },\n  { label: 'Pantau Proyek', path: '/publik/proyek', icon: Building2 },\n  { label: 'Klarifikasi', path: '/publik/klarifikasi', icon: MessageCircleQuestion },\n  { label: 'Lapor Rahasia', path: '/publik/lapor-rahasia', icon: Lock },\n  { label: 'Bantuan', path: '/publik/bantuan', icon: HelpCircle },\n];",
  'auditor': "export const AUDITOR_MENU = [\n  { label: 'Beranda Forensik', path: '/auditor', icon: Search },\n  { label: 'Uji Alat Bukti', path: '/auditor/uji-bukti', icon: FileSearch },\n  { label: 'Kronologi Transaksi', path: '/auditor/ledger', icon: Workflow },\n  { label: 'Kotak Masuk Rahasia', path: '/auditor/kotak-rahasia', icon: LockKeyhole },\n  { label: 'Ekspor Laporan Hukum', path: '/auditor/ekspor-laporan', icon: Download },\n  { label: 'Bantuan', path: '/auditor/bantuan', icon: HelpCircle },\n];",
  'bpd-adat': "export const BPD_ADAT_MENU = [\n  { label: 'Beranda Pengawasan (Dashboard Bersama)', path: '/bpd-adat', icon: LayoutDashboard },\n  { label: 'Pantauan Transaksi (Khusus BPD)', path: '/bpd-adat/pantauan-transaksi', icon: Eye },\n  { label: 'Papan Resolusi Adat (Khusus Tokoh Adat)', path: '/bpd-adat/resolusi-adat', icon: Scale },\n  { label: 'Arsip Pengawasan & Etik', path: '/bpd-adat/arsip', icon: Archive },\n  { label: 'Pengaturan Akun', path: '/bpd-adat/pengaturan', icon: Settings },\n  { label: 'Bantuan', path: '/bpd-adat/bantuan', icon: HelpCircle },\n];"
};

const srcPath = path.join(process.cwd(), 'src', 'features');
let menuFilesCreated = [];
let filesModified = 0;

for (const [role, menuStr] of Object.entries(rolesData)) {
  const rolePath = path.join(srcPath, role);
  
  // 1. Generate menu.ts
  const icons = [];
  const regex = /icon: ([A-Za-z0-9_]+)/g;
  let match;
  while ((match = regex.exec(menuStr)) !== null) {
    if (!icons.includes(match[1])) icons.push(match[1]);
  }
  
  const menuTsContent = "import { " + icons.join(', ') + " } from 'lucide-react';\n\n" + menuStr + "\n";

  const menuTsPath = path.join(rolePath, 'menu.ts');
  fs.writeFileSync(menuTsPath, menuTsContent);
  menuFilesCreated.push(menuTsPath);
  
  const roleMenuVar = role.replace('-', '_').toUpperCase() + '_MENU';
  const roleMenuVarAlt = role.replace('-', '').toUpperCase() + '_MENU';
  
  // 2. Refactor .tsx files
  const files = fs.readdirSync(rolePath);
  for (const file of files) {
    if (file.endsWith('.tsx')) {
      const fullPath = path.join(rolePath, file);
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      
      // Attempt to remove KADES_MENU block
      const startIdx = content.indexOf("const " + roleMenuVar + " = [");
      const altStartIdx = content.indexOf("const " + roleMenuVarAlt + " = [");
      let actualVar = '';
      let blockStart = -1;
      
      if (startIdx !== -1) {
          blockStart = startIdx;
          actualVar = roleMenuVar;
      } else if (altStartIdx !== -1) {
          blockStart = altStartIdx;
          actualVar = roleMenuVarAlt;
      }
      
      if (blockStart !== -1) {
          const blockEnd = content.indexOf('];', blockStart) + 2;
          // Delete the block
          content = content.substring(0, blockStart) + content.substring(blockEnd);
          
          // Add the import statement
          const importStmt = "import { " + actualVar + " } from './menu';";
          
          // Insert it after the last import
          const importsRegex = /import [^;]+;/g;
          let lastMatch = null;
          let m;
          while ((m = importsRegex.exec(content)) !== null) {
              lastMatch = m;
          }
          if (lastMatch) {
              const insertPos = lastMatch.index + lastMatch[0].length;
              content = content.substring(0, insertPos) + '\n' + importStmt + content.substring(insertPos);
          } else {
              content = importStmt + '\n\n' + content;
          }
          
          fs.writeFileSync(fullPath, content);
          filesModified++;
          modified = true;
      }
    }
  }
}

console.log('MENU_FILES_CREATED:', menuFilesCreated);
console.log('FILES_MODIFIED:', filesModified);
