const fs = require('fs');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = dir + '/' + f;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && !dirPath.includes('node_modules') && !dirPath.includes('.git') && !dirPath.includes('.next')) {
            walk(dirPath, callback);
        } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')) {
            callback(dirPath);
        }
    });
}

walk('./apps', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('lpjUrl')) {
        content = content.replace(/lpjUrl/g, 'lpjTeknisUrl');
        fs.writeFileSync(filePath, content);
        console.log('Replaced in ' + filePath);
    }
});
