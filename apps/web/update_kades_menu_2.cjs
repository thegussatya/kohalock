const fs = require('fs');
const path = require('path');

const dirPath = path.join(process.cwd(), 'src', 'features', 'kades');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // 1. Add BarChart3 import if lucide-react exists
      if (content.includes('lucide-react') && !content.includes('BarChart3')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
          return `import { ${p1.trim()}, BarChart3 } from 'lucide-react';`;
        });
        changed = true;
      }

      // 2. Insert { label: 'Analitik Klarifikasi', path: '/kades/analitik-klarifikasi', icon: BarChart3 } 
      // right after { label: 'Pusat Klarifikasi Publik', path: '/kades/klarifikasi-publik', icon: QrCode }
      if (content.includes('KADES_MENU') && !content.includes("path: '/kades/analitik-klarifikasi'")) {
        const targetStr = "{ label: 'Pusat Klarifikasi Publik', path: '/kades/klarifikasi-publik', icon: QrCode },";
        if (content.includes(targetStr)) {
          content = content.replace(
            targetStr,
            targetStr + "\n  { label: 'Analitik Klarifikasi', path: '/kades/analitik-klarifikasi', icon: BarChart3 },"
          );
          changed = true;
        } else {
            const targetStr2 = "{ label: 'Pusat Klarifikasi Publik', path: '/kades/klarifikasi-publik', icon: QrCode }";
            if (content.includes(targetStr2)) {
              content = content.replace(
                targetStr2,
                targetStr2 + ",\n  { label: 'Analitik Klarifikasi', path: '/kades/analitik-klarifikasi', icon: BarChart3 },"
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
