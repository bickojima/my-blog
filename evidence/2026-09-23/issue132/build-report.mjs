// Issue #132 / SEC-40: 3 つの実行結果 JSON（network / fixture-alert / fixture-unreachable）から report.html を生成する。
// 使い方: node evidence/2026-09-23/issue132/build-report.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const esc = (v) => String(v ?? '-').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const runs = [
  { key: 'network', title: '実照会（ネットワーク）', note: 'npm registry / npm advisory / unpkg 実体 / GitHub API / endoflife.date に実際に照会した結果' },
  { key: 'fixture-alert', title: 'alert 経路（フィクスチャ dry-run）', note: '`--remote-fixture tests/fixtures/dependency-freshness/remote-alert.json --now 2027-04-10T00:00:00Z`。値は架空（not real）' },
  { key: 'fixture-unreachable', title: 'error 経路（フィクスチャ dry-run）', note: '`--remote-fixture tests/fixtures/dependency-freshness/remote-unreachable.json`。全リモート照会失敗を再現' },
];
const color = { ok: '#dcfce7', manual: '#dcfce7', warning: '#fef9c3', unknown: '#fef9c3', alert: '#fee2e2', error: '#fecaca' };

const sections = runs.map(({ key, title, note }) => {
  const r = JSON.parse(readFileSync(path.join(dir, key, 'latest.json'), 'utf8'));
  const rows = r.items.map((i) => `<tr style="background:${color[i.status] || '#fff'}"><td>${esc(i.status)}</td><td>${esc(i.category)}</td><td>${esc(i.name)}</td><td>${esc(i.current)}</td><td>${esc(i.latest)}</td><td>${esc(i.pinning)}</td><td>${esc(i.source)}</td><td><ul>${i.findings.map((f) => `<li><code>${esc(f.status)}:${esc(f.code)}</code> ${esc(f.message)}</li>`).join('')}</ul></td></tr>`).join('\n');
  return `<h2>${esc(title)}</h2>
<p>${esc(note)}</p>
<table><tr><th>総合</th><th>終了コード</th><th>判定時刻</th><th>リモート</th><th>件数</th></tr>
<tr style="background:${color[r.status]}"><td><strong>${esc(r.status.toUpperCase())}</strong></td><td>${esc(r.exitCode)}</td><td>${esc(r.generatedAt)}</td><td>${esc(r.remoteSource)}</td><td>${esc(Object.entries(r.counts).map(([k, v]) => `${k} ${v}`).join(' / '))}</td></tr></table>
<table><tr><th>状態</th><th>分類</th><th>名称</th><th>現在</th><th>最新</th><th>固定方法</th><th>箇所</th><th>判定内容</th></tr>
${rows}</table>
<p>原本: <code>${esc(key)}/latest.json</code>・<code>${esc(key)}/latest.md</code>・<code>${esc(key)}/stdout.txt</code></p>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>Issue #132 npm管理外依存 鮮度・EOL チェック エビデンス</title>
<style>
body{font-family:sans-serif;margin:16px;line-height:1.6;max-width:1200px}
table{border-collapse:collapse;width:100%;margin:8px 0 16px}
th,td{border:1px solid #ccc;padding:6px;vertical-align:top;text-align:left;font-size:14px}
th{background:#f3f4f6}
code{background:#f3f4f6;padding:0 4px}
ul{margin:0;padding-left:18px}
</style>
</head>
<body>
<h1>Issue #132 npm管理外依存 鮮度・EOL チェック エビデンス（2026-09-23, SEC-40）</h1>
<p>対象システム変更: <code>scripts/check-dependency-freshness.mjs</code> と週次ワークフロー <code>.github/workflows/dependency-freshness.yml</code> の追加。UI・CMS の変更はないためスクリーンショットは取得せず、結果 JSON を要約する。</p>
${sections}
<h2>Issue 起票手順の dry-run</h2>
<p><code>notify-dry-run.sh</code> で通知ジョブと同じ手順を実行（<code>gh issue list</code> のみ実 API、create/comment は表示のみ）。結果は <code>notify-dry-run.log</code>: 既存 Issue なし → <code>gh issue create</code> を実行する分岐になることを確認。</p>
</body>
</html>
`;
writeFileSync(path.join(dir, 'report.html'), html);
console.log('wrote report.html');
