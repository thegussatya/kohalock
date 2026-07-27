const fs = require('fs');
const path = require('path');

const roles = ['kades', 'sekdes', 'kaur-teknis', 'publik', 'auditor', 'bpd-adat'];
const srcPath = path.join(process.cwd(), 'src', 'features');

for (const role of roles) {
  const rolePath = path.join(srcPath, role);
  const files = fs.readdirSync(rolePath);
  
  for (const file of files) {
    if (file.endsWith('Page.tsx') || file.endsWith('ProfilePage.tsx')) {
      const content = fs.readFileSync(path.join(rolePath, file), 'utf8');
      
      // Match the menu array exactly by finding the brackets
      const startIdx = content.indexOf(`const ${role.toUpperCase().replace('-', '_')}_MENU = [`);
      if (startIdx === -1) {
          const startIdx2 = content.indexOf(`const ${role.replace('-', '').toUpperCase()}_MENU = [`);
          if (startIdx2 !== -1) {
              const endIdx = content.indexOf('];', startIdx2) + 2;
              console.log(`\n=== ROLE: ${role} ===`);
              console.log(content.substring(startIdx2, endIdx));
              break;
          }
          continue;
      }
      const endIdx = content.indexOf('];', startIdx) + 2;
      
      console.log(`\n=== ROLE: ${role} ===`);
      console.log(content.substring(startIdx, endIdx));
      
      break;
    }
  }
}
