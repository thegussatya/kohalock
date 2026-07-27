const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('\\nimport {')) {
        content = content.replace(/\\nimport \{/g, '\nimport {');
        fs.writeFileSync(fullPath, content);
        console.log('Fixed ' + fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src', 'features'));
console.log('Done fixing literal newlines.');
