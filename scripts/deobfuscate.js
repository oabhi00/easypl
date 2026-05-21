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

console.log('Starting deobfuscation process...');
let count = 0;

walkDir(dataDir, (filePath) => {
  if (path.extname(filePath) === '.json') {
    const content = fs.readFileSync(filePath, 'utf8');
    const trimmed = content.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      try {
        const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
        // Validate JSON structure
        JSON.parse(decoded);
        fs.writeFileSync(filePath, decoded, 'utf8');
        count++;
      } catch (err) {
        console.error(`Failed to deobfuscate ${filePath}:`, err.message);
      }
    }
  }
});

console.log(`Successfully deobfuscated ${count} files.`);
