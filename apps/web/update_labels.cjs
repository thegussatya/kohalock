const fs = require('fs');
const path = require('path');

const kadesDir = 'src/features/kades';
const auditorDir = 'src/features/auditor';
const bpdAdatDir = 'src/features/bpd-adat';

const replacements = [
  // Menus
  { find: /label: 'Dashboard \\(Executive\\)'/g, replace: "label: 'Dashboard'" },
  { find: /label: 'Perisai Integritas \\(Log Intervensi\\)'/g, replace: "label: 'Perisai Integritas'" },
  
  { find: /label: 'Beranda Forensik \\(Audit Dashboard\\)'/g, replace: "label: 'Beranda Forensik'" },
  { find: /label: 'Uji Alat Bukti \\(Integrity Checker\\)'/g, replace: "label: 'Uji Alat Bukti'" },
  { find: /label: 'Kronologi Transaksi \\(Ledger Explorer\\)'/g, replace: "label: 'Kronologi Transaksi'" },
  { find: /label: 'Kotak Masuk Rahasia \\(Whistleblower Inbox\\)'/g, replace: "label: 'Kotak Masuk Rahasia'" },
  { find: /label: 'Ekspor Laporan Hukum \\(Legal Export\\)'/g, replace: "label: 'Ekspor Laporan Hukum'" },
  
  { find: /label: 'Beranda Pengawasan \\(Dashboard Bersama\\)'/g, replace: "label: 'Beranda Pengawasan'" },
  { find: /label: 'Pantauan Transaksi \\(Khusus BPD\\)'/g, replace: "label: 'Pantauan Transaksi'" },
  { find: /label: 'Papan Resolusi Adat \\(Khusus Tokoh Adat\\)'/g, replace: "label: 'Papan Resolusi Adat'" },

  // PageHeaders descriptions updates
  { 
    find: /description="Fitur darurat \\(Panic Button\\) eksklusif/g, 
    replace: 'description="Log Intervensi - Fitur darurat (Panic Button) eksklusif'
  },
  {
    find: /description="Wadah penyelesaian perkara dan mediasi damai berbasis kearifan lokal \\(Khusus Tokoh Adat\\)\\."/g,
    replace: 'description="Khusus Tokoh Adat: Wadah penyelesaian perkara dan mediasi damai berbasis kearifan lokal."'
  },
  {
    find: /description="Verifikasi keaslian dokumen digital atau foto lapangan/g,
    replace: 'description="Integrity Checker: Verifikasi keaslian dokumen digital atau foto lapangan'
  },
  {
    find: /description="Fasilitas dekripsi untuk membuka laporan Whistleblower/g,
    replace: 'description="Whistleblower Inbox: Fasilitas dekripsi untuk membuka laporan Whistleblower'
  },
  {
    find: /description="Unduh dokumen fisik berkekuatan hukum/g,
    replace: 'description="Legal Export: Unduh dokumen fisik berkekuatan hukum'
  },
  {
    find: /description="Pusat komando pengawasan terpadu/g,
    replace: 'description="Dashboard Bersama: Pusat komando pengawasan terpadu'
  }
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      let modified = false;
      for (const rule of replacements) {
        if (rule.find.test(content)) {
          content = content.replace(rule.find, rule.replace);
          modified = true;
        }
      }
      
      if (full.includes('TransactionMonitoringPage') && !content.includes('Khusus BPD') && content.includes('<PageHeader')) {
        content = content.replace(/description="([^"]+)"/, 'description="Khusus BPD: $1"');
        modified = true;
      }
      
      if (modified) fs.writeFileSync(full, content, 'utf8');
    }
  }
}

[kadesDir, auditorDir, bpdAdatDir].forEach(d => {
  if (fs.existsSync(d)) walk(d);
});

console.log('Update complete!');
