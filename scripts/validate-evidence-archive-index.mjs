import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexPath = new URL('../evidence/archive-index.json', import.meta.url);
const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const expectedKeys = ['git_blob_sha1', 'path', 'sha256', 'size', 'storage_class'];
const pairs = new Set();
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const driveIdPattern = /(?<![A-Za-z0-9_-])[A-Za-z0-9_-]{33}(?![A-Za-z0-9_-])/;

assert.equal(index.schema, 'evidence-archive-index/v1');
assert.ok(Array.isArray(index.entries) && index.entries.length > 0);

for (const [position, entry] of index.entries.entries()) {
  assert.deepEqual(Object.keys(entry).sort(), expectedKeys, `entry ${position}: unexpected field`);
  assert.ok(typeof entry.path === 'string', `entry ${position}: path must be a string`);
  assert.ok(entry.path.startsWith('evidence/'), `entry ${position}: path outside evidence/`);
  assert.ok(!entry.path.startsWith('/') && !entry.path.includes('://'), `entry ${position}: absolute path or URL`);
  assert.ok(!entry.path.includes('\\') && !entry.path.includes('\0'), `entry ${position}: backslash or NUL in path`);
  const segments = entry.path.split('/');
  assert.ok(segments.length >= 2 && segments.every((segment) => segment && segment !== '.' && segment !== '..'), `entry ${position}: empty or traversing path segment`);
  assert.ok(!emailPattern.test(entry.path), `entry ${position}: email-like path`);
  assert.ok(!driveIdPattern.test(entry.path), `entry ${position}: Drive ID-like path`);
  assert.match(entry.git_blob_sha1, /^[a-f0-9]{40}$/);
  assert.match(entry.sha256, /^[a-f0-9]{64}$/);
  assert.ok(Number.isSafeInteger(entry.size) && entry.size >= 0);
  assert.ok(entry.storage_class === 'git' || entry.storage_class === 'drive');

  const pair = `${entry.path}\0${entry.git_blob_sha1}`;
  assert.ok(!pairs.has(pair), `entry ${position}: duplicate path/blob pair`);
  pairs.add(pair);
}

console.log(`Validated ${index.entries.length} archive index entries.`);
