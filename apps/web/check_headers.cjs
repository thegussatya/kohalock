const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const folders = ['src/features/kades', 'src/features/auditor', 'src/features/bpd-adat'];
const allFiles = [];
folders.forEach(folder => {
  const fullPath = path.join(process.cwd(), folder);
  if(fs.existsSync(fullPath)) getFiles(fullPath, allFiles);
});

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const headerMatch = content.match(/<PageHeader[^>]*description="([^"]*)"[^>]*>/);
  if (headerMatch) {
    console.log(`[${path.basename(file)}] ${headerMatch[1]}`);
  }
});
