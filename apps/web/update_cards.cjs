const fs = require('fs');
const path = require('path');

const mappings = {
  'kaur-teknis': {
    'Total Pagu Musrembang Tahun Ini': '/kaur-teknis/formulir-musrembang',
    'Pengajuan Pencairan Dipending': '/kaur-teknis/ajukan-pencairan',
    'Usulan/Pencairan Ditolak': '/kaur-teknis/riwayat-penolakan'
  },
  'sekdes': {
    'Total Pengajuan Menunggu': '/sekdes/verifikasi',
    'Tiket Warga Belum Dijawab': '/sekdes/klarifikasi'
  },
  'kades': {
    'Menunggu Otorisasi Final': '/kades/persetujuan-pencairan'
  },
  'publik': {
    'Total Realisasi Dana': '/publik/proyek',
    'Proyek Sedang Berjalan': '/publik/proyek'
  },
  'auditor': {
    'Transaksi Anomali (Red Flags)': '/auditor/ledger'
  },
  'bpd-adat': {
    'Potensi Pelanggaran (Red Flags)': '/bpd-adat/pantauan-transaksi'
  }
};

for (const [role, cardsMap] of Object.entries(mappings)) {
  const filePath = path.join(__dirname, 'src/features', role, 'DashboardPage.tsx');
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let isModified = false;

  if (!content.includes("import { useNavigate }")) {
    const importMatch = content.match(/import .*?;\\n/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + "import { useNavigate } from 'react-router-dom';\\n");
      isModified = true;
    }
  }

  if (!content.includes("const navigate = useNavigate();")) {
    content = content.replace(/export default function DashboardPage\(\) \{\n/, "export default function DashboardPage() {\\n  const navigate = useNavigate();\\n");
    isModified = true;
  }

  for (const [cardTitle, route] of Object.entries(cardsMap)) {
    const cardRegex = new RegExp('<MetricCard\\\\s+title="' + cardTitle + '"[\\\\s\\\\S]*?\\\\/>', 'g');
    
    content = content.replace(cardRegex, (match) => {
      if (match.includes('onClick=')) return match;
      return '<div onClick={() => navigate(\\'' + route + '\\')} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">\\n          ' + match + '\\n        </div>';
    });
    isModified = true;
  }

  if (isModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}
