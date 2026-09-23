// Issue #127: public/admin/cms-env.js（ブラウザ用の classic script）を Node の vm で評価し、
// resolveCmsBackend() を純関数として単体テストできるようにする。
// テストファイル名パターン（*.test.mjs）に一致しないので Vitest のテスト対象にはならない。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

export const CMS_ENV_PATH = join(process.cwd(), 'public/admin/cms-env.js');

export function loadResolveCmsBackend() {
  const src = readFileSync(CMS_ENV_PATH, 'utf-8');
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox, { filename: 'cms-env.js' });
  if (typeof sandbox.window.resolveCmsBackend !== 'function') {
    throw new Error('cms-env.js が window.resolveCmsBackend を定義していない');
  }
  return sandbox.window.resolveCmsBackend;
}

/** URL 文字列から location 相当（hostname / origin）を作る */
export function locationOf(url) {
  const u = new URL(url);
  return { hostname: u.hostname, origin: u.origin };
}

/**
 * Decap CMS が行う「config.yml の上に CMS.init の config を deepmerge（init 側優先）」を
 * backend について再現する（3.16.2 の配布物で deepmerge(loadedYaml, manualConfig) を確認）。
 */
export function effectiveBackend(yamlConfig, manualBackend) {
  return { ...(yamlConfig.backend || {}), ...manualBackend };
}
