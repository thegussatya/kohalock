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
      
      // 1. Add History import if lucide-react exists
      if (content.includes('lucide-react') && !content.includes('History')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
          return `import { ${p1.trim()}, History } from 'lucide-react';`;
        });
        changed = true;
      }

      // 2. Insert { label: 'Riwayat Otorisasi', path: '/kades/riwayat-otorisasi', icon: History } 
      // right after { label: 'Persetujuan Pencairan', path: '/kades/persetujuan-pencairan', icon: BadgeCheck }
      if (content.includes('KADES_MENU') && !content.includes("path: '/kades/riwayat-otorisasi'")) {
        const targetStr = "{ label: 'Persetujuan Pencairan', path: '/kades/persetujuan-pencairan', icon: BadgeCheck },";
        if (content.includes(targetStr)) {
          content = content.replace(
            targetStr,
            targetStr + "\n  { label: 'Riwayat Otorisasi', path: '/kades/riwayat-otorisasi', icon: History },"
          );
          changed = true;
        } else {
            const targetStr2 = "{ label: 'Persetujuan Pencairan', path: '/kades/persetujuan-pencairan', icon: BadgeCheck }";
            if (content.includes(targetStr2)) {
              content = content.replace(
                targetStr2,
                targetStr2 + ",\n  { label: 'Riwayat Otorisasi', path: '/kades/riwayat-otorisasi', icon: History },"
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
