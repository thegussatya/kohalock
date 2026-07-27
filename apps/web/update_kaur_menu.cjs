const fs = require('fs');
const path = require('path');

const dirPath = path.join(process.cwd(), 'src', 'features', 'kaur-teknis');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // 1. Add FolderKanban import if lucide-react exists
      if (content.includes('lucide-react') && !content.includes('FolderKanban')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
          return `import { ${p1.trim()}, FolderKanban } from 'lucide-react';`;
        });
        changed = true;
      }

      // 2. Insert { label: 'Program Saya', path: '/kaur-teknis/program-saya', icon: FolderKanban } 
      // right after { label: 'Formulir Musrembang', path: '/kaur-teknis/formulir-musrembang', icon: FilePlus }
      if (content.includes('KAUR_TEKNIS_MENU') && !content.includes("path: '/kaur-teknis/program-saya'")) {
        const targetStr = "{ label: 'Formulir Musrembang', path: '/kaur-teknis/formulir-musrembang', icon: FilePlus },";
        if (content.includes(targetStr)) {
          content = content.replace(
            targetStr,
            targetStr + "\n  { label: 'Program Saya', path: '/kaur-teknis/program-saya', icon: FolderKanban },"
          );
          changed = true;
        } else {
            // maybe no trailing comma
            const targetStr2 = "{ label: 'Formulir Musrembang', path: '/kaur-teknis/formulir-musrembang', icon: FilePlus }";
            if (content.includes(targetStr2)) {
              content = content.replace(
                targetStr2,
                targetStr2 + ",\n  { label: 'Program Saya', path: '/kaur-teknis/program-saya', icon: FolderKanban },"
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
