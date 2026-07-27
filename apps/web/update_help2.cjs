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
      
      for (const role of roles) {
        if (content.includes(role.menuVar) && !content.includes(`path: '${role.path}'`)) {
          // Find `];` right after the role menu definition
          const menuStart = content.indexOf(`const ${role.menuVar}`);
          if (menuStart !== -1) {
             const menuEnd = content.indexOf('];', menuStart);
             if (menuEnd !== -1) {
                 const before = content.substring(0, menuEnd);
                 const after = content.substring(menuEnd);
                 
                 let cleanBefore = before.trimEnd();
                 if (cleanBefore.endsWith(',')) {
                     // all good
                 } else {
                     cleanBefore += ',';
                 }
                 content = cleanBefore + `\n  { label: 'Bantuan', path: '${role.path}', icon: HelpCircle },\n` + after;
                 changed = true;
             }
          }
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated Menu in ' + fullPath);
      }
    }
  }
}

processDir(featuresDir);
