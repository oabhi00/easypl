const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

console.log('Starting obfuscation process...');
let count = 0;

walkDir(dataDir, (filePath) => {
  if (path.extname(filePath) === '.json') {
    const content = fs.readFileSync(filePath, 'utf8');
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const encoded = Buffer.from(content).toString('base64');
      fs.writeFileSync(filePath, encoded, 'utf8');
      count++;
    }
  }
});

console.log(`Successfully obfuscated ${count} JSON files.`);
