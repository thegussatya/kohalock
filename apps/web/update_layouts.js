import fs from 'fs';
import path from 'path';

const featuresDir = path.join(process.cwd(), 'src', 'features');

const roles = {
  'kaur-teknis': { userName: 'Budi Santoso', userRole: 'Kaur Teknis' },
  'sekdes': { userName: 'Siti Rahma', userRole: 'Sekretaris Desa' },
  'kades': { userName: 'Ahmad Fauzi', userRole: 'Kepala Desa' },
  'publik': { userName: 'Warga', userRole: 'Masyarakat' },
  'auditor': { userName: 'Inspektur Andi', userRole: 'Auditor / APH' },
  'bpd-adat': { userName: 'Bapak RT/Adat', userRole: 'BPD / Tokoh Adat' }
};

function processDirectory(dirPath, roleName) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath, roleName);
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const { userName, userRole } = roles[roleName] || {};
      
      if (userName && userRole) {
        // Find <RoleLayout ...> and inject props
        const regex = /(<RoleLayout\s+menuItems=\{[^}]+\})/g;
        content = content.replace(regex, `$1 userName="${userName}" userRole="${userRole}"`);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

for (const roleDir of Object.keys(roles)) {
  const dirPath = path.join(featuresDir, roleDir);
  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath, roleDir);
  }
}

console.log('Done!');
