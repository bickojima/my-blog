import fs from 'fs';
import path from 'path';

const POSTS_DIR = 'src/content/posts';

function findMdFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
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

function extractFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const dateMatch = content.match(/^date:\s*(\d{4})-(\d{2})-(\d{2})/m);
  const titleMatch = content.match(/^title:\s*(.+)/m);
  if (dateMatch && titleMatch) {
    return {
      year: dateMatch[1],
      month: dateMatch[2],
      day: dateMatch[3],
      date: `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`,
      title: titleMatch[1].trim().replace(/^["']|["']$/g, ''),
    };
  }
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

// --- 1. ファイル整理 ---
const files = findMdFiles(POSTS_DIR);
let moved = 0;

for (const filePath of files) {
  const fm = extractFrontmatter(filePath);
  if (!fm) continue;

  const expectedDir = path.join(POSTS_DIR, fm.year, fm.month);
  const expectedPath = path.join(expectedDir, path.basename(filePath));

  if (path.resolve(filePath) !== path.resolve(expectedPath)) {
    fs.mkdirSync(expectedDir, { recursive: true });
    fs.renameSync(filePath, expectedPath);
    console.log(`[organize-posts] ${path.basename(filePath)}: ${path.relative(POSTS_DIR, filePath)} → ${fm.year}/${fm.month}/`);
    moved++;
  }
}

removeEmptyDirs(POSTS_DIR);

if (moved > 0) {
  console.log(`[organize-posts] ${moved} file(s) moved.`);
}

// --- 2. URLマッピングJSON生成 ---
// ファイル名 = URLスラグ（posts.ts と同じロジック）
const allFiles = findMdFiles(POSTS_DIR);
const urlMap = {};
for (const filePath of allFiles) {
  const fm = extractFrontmatter(filePath);
  if (!fm) continue;
  const relPath = path.relative(POSTS_DIR, filePath).replace(/\.md$/, '');
  const fileSlug = path.basename(filePath, '.md');
  urlMap[relPath] = `/posts/${fm.year}/${fm.month}/${fileSlug}`;
}

const urlMapPath = path.join('public', 'admin', 'url-map.json');
fs.mkdirSync(path.dirname(urlMapPath), { recursive: true });
fs.writeFileSync(urlMapPath, JSON.stringify(urlMap, null, 2));
console.log(`[organize-posts] url-map.json generated (${Object.keys(urlMap).length} entries).`);
