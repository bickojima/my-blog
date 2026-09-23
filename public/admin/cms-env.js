// Issue #127 / Bug #51: Decap CMS の書き込み先ブランチと base_url を実行時に導出する。
//
// 以前は public/admin/config.yml に backend.branch / base_url を main・staging で別の値として
// 書いていたため、どちら向きのマージでも相手の値が持ち込まれた（Bug #51: staging の CMS が
// 本番 main へ直接コミットする状態が約21分間発生）。config.yml からこの2項目を削除し、
// admin/index.html が CMS_MANUAL_INIT + CMS.init({ config: { backend: ... } }) で渡す。
// Decap は config.yml の上に init の config を deepmerge し、init 側が優先される
// （3.16.2 の配布物で `deepmerge(loadedYaml, manualConfig)` を確認済み）。
//
// 判定方針（安全側の既定）:
// - 書き込み先が main になるのは、ホスト名が本番ホスト名と「完全一致」したときだけ。
// - それ以外（staging.reiwa.casa、*.pages.dev のプレビュー、localhost、未知のホスト）は staging。
//   未知のホストを main に倒さないため、対応表は「本番1件だけ」の許可リストにしている。
// - base_url は常に window.location.origin（OAuth の /auth は配信中の同一オリジンで動く。
//   オリジン許可は functions/_shared/allowed-origin.js 側で行う）。
//
// CLAUDE.md の「admin/index.html に URL をハードコードしない」方針との関係:
// ここで持つのは URL ではなくホスト名→ブランチの対応（比較用の定数）1件だけで、
// 画面や通信に使う URL はすべて location.origin から作る。admin/index.html 本体には書かない。
(function (root) {
  'use strict';

  // ホスト名 → 書き込み先ブランチ。ここに無いホストはすべて FALLBACK_BRANCH。
  const HOSTNAME_TO_BRANCH = new Map([
    ['reiwa.casa', 'main'],
  ]);
  const FALLBACK_BRANCH = 'staging';

  function resolveCmsBackend(loc) {
    const hostname = loc && typeof loc.hostname === 'string' ? loc.hostname : '';
    const branch = HOSTNAME_TO_BRANCH.has(hostname) ? HOSTNAME_TO_BRANCH.get(hostname) : FALLBACK_BRANCH;
    return Object.freeze({ branch: branch, base_url: loc.origin });
  }

  root.resolveCmsBackend = resolveCmsBackend;
})(window);
