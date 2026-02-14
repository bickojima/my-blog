import fs from 'fs';
import path from 'path';

const POSTS_DIR = 'src/content/posts';

function findMdFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractYearMonth(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^date:\s*(\d{4})-(\d{2})/m);
  if (match) return { year: match[1], month: match[2] };
  return null;
}

function removeEmptyDirs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      removeEmptyDirs(fullPath);
      try { fs.rmdirSync(fullPath); } catch {}
    }
  }
}

const files = findMdFiles(POSTS_DIR);
let moved = 0;

for (const filePath of files) {
  const date = extractYearMonth(filePath);
  if (!date) continue;

  const expectedDir = path.join(POSTS_DIR, date.year, date.month);
  const expectedPath = path.join(expectedDir, path.basename(filePath));

  if (path.resolve(filePath) !== path.resolve(expectedPath)) {
    fs.mkdirSync(expectedDir, { recursive: true });
    fs.renameSync(filePath, expectedPath);
    console.log(`[organize-posts] ${path.basename(filePath)}: ${path.relative(POSTS_DIR, filePath)} → ${date.year}/${date.month}/`);
    moved++;
  }
}

removeEmptyDirs(POSTS_DIR);

if (moved > 0) {
  console.log(`[organize-posts] ${moved} file(s) moved.`);
}
