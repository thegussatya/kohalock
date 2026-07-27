const fs = require('fs');
const path = require('path');

const dirPath = path.join(process.cwd(), 'src', 'features', 'sekdes');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // 1. Add History import if lucide-react exists
      if (content.includes('lucide-react') && !content.includes('History')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
          return `import { ${p1.trim()}, History } from 'lucide-react';`;
        });
        changed = true;
      }

      // 2. Insert { label: 'Riwayat Verifikasi', path: '/sekdes/riwayat-verifikasi', icon: History } 
      // right after { label: 'Verifikasi Pengajuan', path: '/sekdes/verifikasi', icon: FileCheck }
      if (content.includes('SEKDES_MENU') && !content.includes("path: '/sekdes/riwayat-verifikasi'")) {
        const targetStr = "{ label: 'Verifikasi Pengajuan', path: '/sekdes/verifikasi', icon: FileCheck },";
        if (content.includes(targetStr)) {
          content = content.replace(
            targetStr,
            targetStr + "\n  { label: 'Riwayat Verifikasi', path: '/sekdes/riwayat-verifikasi', icon: History },"
          );
          changed = true;
        } else {
            const targetStr2 = "{ label: 'Verifikasi Pengajuan', path: '/sekdes/verifikasi', icon: FileCheck }";
            if (content.includes(targetStr2)) {
              content = content.replace(
                targetStr2,
                targetStr2 + ",\n  { label: 'Riwayat Verifikasi', path: '/sekdes/riwayat-verifikasi', icon: History },"
              );
              changed = true;
            }
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

processDir(dirPath);
