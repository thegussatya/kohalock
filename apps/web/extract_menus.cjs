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
      const match = content.match(/const [A-Z_]+_MENU = \[\s*\{[\s\S]*?\}\s*\];/);
      if (match) {
        console.log(`\n=== ROLE: ${role} (from ${file}) ===`);
        console.log(match[0]);
        
        // Also extract imports to know which lucide-react icons to import
        const importMatch = content.match(/import \{[^}]+\} from 'lucide-react';/);
        if (importMatch) {
            console.log("Imports:", importMatch[0]);
        }
        break; // Only need one per role
      }
    }
  }
}
