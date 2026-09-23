#!/usr/bin/env node
// Issue #128: Cloudflare Pages のビルドコマンド `npm run build` が
// Vitest 失敗時に非0終了し、astro build まで進まない（dist を生成しない）ことをローカルで実証する。
// 使い方: node evidence/2026-09-23/issue128/verify-pages-test-gate.mjs
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = dirname(fileURLToPath(import.meta.url));
const root = join(outDir, '..', '..', '..');
const dist = join(root, 'dist');
const failFile = join(root, 'tests', 'zz-intentional-fail.test.mjs');

const cases = [
  { id: 'C1', name: '通常ビルド（Vitest全PASS）', failTest: false, env: {}, expectExit0: true, expectDist: true },
  { id: 'C2', name: 'Vitest意図的失敗', failTest: true, env: {}, expectExit0: false, expectDist: false },
  { id: 'C3', name: 'Vitest意図的失敗 + CF_PAGES_BRANCH=staging', failTest: true, env: { CF_PAGES_BRANCH: 'staging' }, expectExit0: false, expectDist: false },
];

const results = [];
try {
  for (const c of cases) {
    rmSync(dist, { recursive: true, force: true });
    if (c.failTest) {
      writeFileSync(failFile, "import { it, expect } from 'vitest';\nit('Issue #128 意図的失敗（一時ファイル）', () => { expect(1).toBe(2); });\n");
    }
    const started = Date.now();
    const r = spawnSync('npm', ['run', 'build'], {
      cwd: root,
      env: { ...process.env, ...c.env },
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    const output = `${r.stdout || ''}${r.stderr || ''}`;
    if (c.failTest) rmSync(failFile, { force: true });
    const distExists = existsSync(dist);
    const distIndexHtml = existsSync(join(dist, 'index.html'));
    // astro build の実行ログ（Astroが出力する "building static entrypoints" / "Complete!"）の有無
    const astroBuildLogSeen = /building static entrypoints|\[build\] Complete!/i.test(output);
    const lastLines = output.trim().split('\n').slice(-15);
    // Vitest のサマリー行（Test Files / Tests）
    const vitestSummary = output
      .split('\n')
      .filter((l) => /^\s*(Test Files|Tests)\s+/.test(l))
      .map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trim());
    const pass = (r.status === 0) === c.expectExit0 && distExists === c.expectDist && astroBuildLogSeen === c.expectDist;
    results.push({
      id: c.id,
      name: c.name,
      env: c.env,
      exitCode: r.status,
      distExists,
      distIndexHtml,
      astroBuildLogSeen,
      vitestSummary,
      durationSec: Math.round((Date.now() - started) / 1000),
      expected: { exitZero: c.expectExit0, distExists: c.expectDist },
      pass,
      lastLines,
    });
    console.log(`${c.id} ${c.name}: exit=${r.status} dist=${distExists} astroBuildLog=${astroBuildLogSeen} -> ${pass ? 'PASS' : 'FAIL'}`);
  }
} finally {
  rmSync(failFile, { force: true });
}

writeFileSync(
  join(outDir, 'pages-test-gate-results.json'),
  JSON.stringify({ issue: 128, date: '2026-09-23', command: 'npm run build', tempFileRemoved: !existsSync(failFile), results }, null, 2) + '\n',
);
process.exit(results.every((r) => r.pass) ? 0 : 1);
