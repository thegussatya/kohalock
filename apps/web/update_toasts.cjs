const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'src/features/sekdes/ReviewSubmissionPage.tsx',
    importToast: true,
    rules: [
      {
        search: /onClick=\{\(\) => setShowPinModal\(false\)\}\n\s*className="px-6 py-3 bg-brand-600/g,
        replace: `onClick={() => {\n                  setShowPinModal(false);\n                  toast.success("Berhasil diverifikasi & diteruskan ke Kades");\n                }}\n                className="px-6 py-3 bg-brand-600`
      },
      {
        search: /onClick=\{\(\) => setShowRevisiModal\(false\)\}\n\s*className="px-6 py-3 bg-orange-600/g,
        replace: `onClick={() => {\n                  setShowRevisiModal(false);\n                  toast("Pengajuan dikembalikan untuk revisi", { icon: '↩️' });\n                }}\n                className="px-6 py-3 bg-orange-600`
      }
    ]
  },
  {
    file: 'src/features/kades/DisbursementDetailPage.tsx',
    importToast: true,
    rules: [
      {
        search: /onClick=\{\(\) => setShowModal\(false\)\}\n\s*className="px-6 py-3 bg-brand-600/g,
        replace: `onClick={() => {\n                  setShowModal(false);\n                  toast.success("Dana berhasil dicairkan & tercatat di Blockchain");\n                }}\n                className="px-6 py-3 bg-brand-600`
      }
    ]
  },
  {
    file: 'src/features/kaur-teknis/SubmitDisbursementPage.tsx',
    importToast: true,
    rules: [
      {
        search: /onSubmit=\{\(e\) => e.preventDefault\(\)\}/g,
        replace: `onSubmit={(e) => { e.preventDefault(); toast.success("Pengajuan pencairan berhasil dikirim ke Sekdes"); }}`
      }
    ]
  },
  {
    file: 'src/features/kaur-teknis/MusrembangFormPage.tsx',
    importToast: true,
    rules: [
      {
        search: /onClick=\{\(\) => setShowModal\(false\)\}\n\s*className="px-6 py-3 bg-brand-600/g,
        replace: `onClick={() => {\n                  setShowModal(false);\n                  toast.success("Usulan berhasil dikunci ke Blockchain");\n                }}\n                className="px-6 py-3 bg-brand-600`
      }
    ]
  },
  {
    file: 'src/features/sekdes/ClarificationInboxPage.tsx',
    importToast: true,
    rules: [
      {
        search: /<button\n\s*className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"\n\s*disabled=\{selectedTicket\.status === 'Selesai'\}/g,
        replace: `<button\n                      onClick={() => {\n                        if (selectedTicket?.status !== 'Selesai') {\n                          toast.success("Balasan berhasil dikirim & dipublikasikan");\n                        }\n                      }}\n                      className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"\n                      disabled={selectedTicket.status === 'Selesai'}`
      }
    ]
  },
  {
    file: 'src/features/publik/ClarificationPage.tsx',
    importToast: true,
    rules: [
      {
        search: /onClick=\{handleSend\}\n\s*className="w-full bg-brand-600/g,
        replace: `onClick={() => {\n                    handleSend();\n                    toast.success("Pertanyaan Anda berhasil dikirim");\n                  }}\n                  className="w-full bg-brand-600`
      }
    ]
  },
  {
    file: 'src/features/publik/WhistleblowerReportPage.tsx',
    importToast: true,
    rules: [
      {
        search: /onClick=\{handleKirimLaporan\}\n\s*className="w-full bg-slate-900/g,
        replace: `onClick={() => {\n                    handleKirimLaporan();\n                    toast.success("Laporan terenkripsi berhasil dikirim");\n                  }}\n                  className="w-full bg-slate-900`
      }
    ]
  },
  {
    file: 'src/features/auditor/WhistleblowerInboxPage.tsx',
    importToast: true,
    rules: [
      {
        search: /setErrorMsg\(null\);/g,
        replace: `setErrorMsg(null);\n      toast.success("Laporan berhasil didekripsi");`
      },
      {
        search: /setErrorMsg\('Gagal membuka - private key salah atau data rusak'\);/g,
        replace: `setErrorMsg('Gagal membuka - private key salah atau data rusak');\n      toast.error("Private key salah atau data rusak");`
      }
    ]
  },
  {
    file: 'src/features/bpd-adat/TransactionMonitoringPage.tsx',
    importToast: true,
    rules: [
      {
        search: /<button\n\s*className="px-6 py-2.5 bg-brand-600/g,
        replace: `<button\n                onClick={() => toast.success("Catatan berhasil dikirim sebagai notifikasi ke Kades & Sekdes")}\n                className="px-6 py-2.5 bg-brand-600`
      }
    ]
  },
  {
    file: 'src/features/bpd-adat/AdatResolutionBoardPage.tsx',
    importToast: true,
    rules: [
      {
        search: /<button\n\s*className="px-6 py-2.5 bg-brand-600/g,
        replace: `<button\n                onClick={() => toast.success("Keputusan adat berhasil disimpan")}\n                className="px-6 py-2.5 bg-brand-600`
      }
    ]
  }
];

replacements.forEach(r => {
  const p = path.join(process.cwd(), r.file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // add import if not exists
    if (r.importToast && !content.includes("import { toast } from 'react-hot-toast'")) {
      content = content.replace(/(import .*;\n)/, `$1import { toast } from 'react-hot-toast';\n`);
    }
    
    // apply rules
    r.rules.forEach(rule => {
      content = content.replace(rule.search, rule.replace);
    });
    
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${r.file}`);
  }
});
