const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.join(__dirname, '..');
const configPath = path.join(rootDir, 'js', 'subjects_config.js');
const dataDir = path.join(rootDir, 'data');
const outputPath = path.join(rootDir, 'public', 'search_index.json');

// Make sure output folder exists
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

// Read and evaluate the subjects config to get subject/chapter titles
const configContent = fs.readFileSync(configPath, 'utf8');
const scriptCode = configContent.replace('export const subjects =', 'const subjects =') + '\nexports.subjects = subjects;';
const sandbox = { exports: {} };
vm.runInNewContext(scriptCode, sandbox);
const subjects = sandbox.exports.subjects;

const searchIndex = [];

// Traverse subjects and chapters to build the search index
for (const subjectId in subjects) {
  const subject = subjects[subjectId];
  if (!subject.chapters) continue;

  for (const chapter of subject.chapters) {
    const chapterFilePath = path.join(dataDir, subjectId, chapter.file);
    if (!fs.existsSync(chapterFilePath)) {
      console.warn(`File not found: ${chapterFilePath}`);
      continue;
    }

    const fileContent = fs.readFileSync(chapterFilePath, 'utf8').trim();
    let questions = [];

    try {
      if (fileContent.startsWith('[') || fileContent.startsWith('{')) {
        questions = JSON.parse(fileContent);
      } else {
        // Decode base64 payload
        const decoded = Buffer.from(fileContent, 'base64').toString('utf8');
        questions = JSON.parse(decoded);
      }
    } catch (err) {
      console.error(`Error parsing ${chapterFilePath}:`, err.message);
      continue;
    }

    if (Array.isArray(questions)) {
      questions.forEach((q, idx) => {
        searchIndex.push({
          subjectId,
          subjectTitle: subject.title,
          chapterId: chapter.id,
          chapterTitle: chapter.displayName,
          questionIndex: idx,
          questionText: q.question,
          options: q.options || [],
          answer: q.answer
        });
      });
    }
  }
}

fs.writeFileSync(outputPath, JSON.stringify(searchIndex), 'utf8');
console.log(`Successfully built search index containing ${searchIndex.length} questions.`);
