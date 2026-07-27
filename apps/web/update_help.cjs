const fs = require('fs');
const path = require('path');

const featuresDir = path.join(process.cwd(), 'src', 'features');
const roles = [
  { dir: 'kaur-teknis', menuVar: 'KAUR_TEKNIS_MENU', path: '/kaur-teknis/bantuan' },
  { dir: 'sekdes', menuVar: 'SEKDES_MENU', path: '/sekdes/bantuan' },
  { dir: 'kades', menuVar: 'KADES_MENU', path: '/kades/bantuan' },
  { dir: 'publik', menuVar: 'PUBLIK_MENU', path: '/publik/bantuan' },
  { dir: 'auditor', menuVar: 'AUDITOR_MENU', path: '/auditor/bantuan' },
  { dir: 'bpd-adat', menuVar: 'BPD_ADAT_MENU', path: '/bpd-adat/bantuan' }
];

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Update lucide-react import
      if (content.includes('lucide-react') && !content.includes('HelpCircle')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
          return `import { ${p1.trim()}, HelpCircle } from 'lucide-react';`;
        });
        changed = true;
      }
      
      for (const role of roles) {
        if (content.includes(role.menuVar) && !content.includes(`path: '${role.path}'`)) {
          const menuRegex = new RegExp(`(const \\s+${role.menuVar}\\s*=\\s*\\[[\\s\\S]*?)\\];`);
          content = content.replace(menuRegex, (match, p1) => {
             let cleanP1 = p1.trim();
             if (!cleanP1.endsWith(',')) {
                 cleanP1 += ',';
             }
             return cleanP1 + `\n  { label: 'Bantuan', path: '${role.path}', icon: HelpCircle },\n];`;
          });
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

processDir(featuresDir);
