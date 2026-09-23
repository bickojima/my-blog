import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import {
  PRODUCTION_BRANCH,
  PRODUCTION_SITE_URL,
  STAGING_SITE_URL,
  isProductionBranch,
  resolveSiteUrl,
  buildRobotsTxt,
} from '../src/lib/site-env.mjs';
import { loadResolveCmsBackend, locationOf, effectiveBackend, CMS_ENV_PATH } from './lib/cms-env-loader.mjs';

/**
 * Issue #127（SEC-35 改訂 / SEC-4x 仮ID: 環境固有値の自動導出）
 *
 * 環境固有の4項目（SITE_URL・robots.txt・CMS の branch・base_url）を、ファイルに書かず
 * ビルド時（CF_PAGES_BRANCH）／実行時（location.hostname / origin）に導出する。
 * このファイルは (1) 導出関数の単体テスト と (2) main / staging のファイル差分を生まないための静的ガード を持つ。
 * 生成物（dist）の検証は build.test.mjs（ビルドを伴うため同一ファイル内で直列実行する）。
 *
 * テスト件数はチェックアウト中のブランチに依存しない（旧 SEC-35 のブランチ別登録は廃止）。
 */

const ROOT = process.cwd();
const read = (p) => readFileSync(join(ROOT, p), 'utf-8');
const resolveCmsBackend = loadResolveCmsBackend();

describe('ビルド時の環境値導出（src/lib/site-env.mjs, Issue #127）', () => {
  it('本番ブランチ名は main、本番/非本番のサイトURLは reiwa.casa の本番・staging ホスト', () => {
    expect(PRODUCTION_BRANCH).toBe('main');
    expect(new URL(PRODUCTION_SITE_URL).hostname).toBe('reiwa.casa');
    expect(new URL(STAGING_SITE_URL).hostname).toBe('staging.reiwa.casa');
  });

  it('CF_PAGES_BRANCH が文字列 "main" と完全一致したときだけ本番と判定する', () => {
    expect(isProductionBranch('main')).toBe(true);
  });

  const NON_PRODUCTION = [
    ['staging', 'staging'],
    ['未設定（undefined）', undefined],
    ['null', null],
    ['空文字', ''],
    ['大文字違い Main', 'Main'],
    ['前後空白 " main"', ' main'],
    ['前後空白 "main "', 'main '],
    ['refs/heads/main', 'refs/heads/main'],
    ['feature ブランチ', 'feat/issue-127-derive-env-values'],
    ['GitHub PR の merge ref', '123/merge'],
    ['非文字列', 1],
  ];
  for (const [label, value] of NON_PRODUCTION) {
    it(`${label} は本番と判定しない（サイトURLは staging、robots は Disallow）`, () => {
      expect(isProductionBranch(value)).toBe(false);
      expect(resolveSiteUrl(value)).toBe(STAGING_SITE_URL);
      expect(buildRobotsTxt(value)).toBe('User-agent: *\nDisallow: /\n');
    });
  }

  it('main のサイトURLは本番URL', () => {
    expect(resolveSiteUrl('main')).toBe(PRODUCTION_SITE_URL);
  });

  it('main の robots.txt は Allow: / と本番 Sitemap 行のみ（Disallow なし）', () => {
    const robots = buildRobotsTxt('main');
    expect(robots).toBe(`User-agent: *\nAllow: /\nSitemap: ${PRODUCTION_SITE_URL}/sitemap-index.xml\n`);
    expect(robots).not.toMatch(/Disallow/);
  });

  it('本番以外の robots.txt に Sitemap 行を出さない（staging URL の露出防止。Bug #41）', () => {
    expect(buildRobotsTxt('staging')).not.toMatch(/Sitemap:/);
    expect(buildRobotsTxt(undefined)).not.toMatch(/Allow:\s*\//);
  });
});

describe('CMS の書き込み先ブランチ・base_url の実行時導出（public/admin/cms-env.js, Issue #127）', () => {
  const CASES = [
    // [説明, location の URL, 期待ブランチ]
    ['本番ホスト', 'https://reiwa.casa/admin/', 'main'],
    ['staging ホスト', 'https://staging.reiwa.casa/admin/', 'staging'],
    ['Pages 本番エイリアス（*.pages.dev）', 'https://my-blog-3cg.pages.dev/admin/', 'staging'],
    ['Pages プレビュー（*.my-blog-3cg.pages.dev）', 'https://abc123.my-blog-3cg.pages.dev/admin/', 'staging'],
    ['localhost（ポート付き）', 'http://localhost:4173/admin/', 'staging'],
    ['127.0.0.1', 'http://127.0.0.1:4321/admin/', 'staging'],
    ['本番ホスト名を前方に含む別ドメイン', 'https://reiwa.casa.example.com/admin/', 'staging'],
    ['本番ホスト名を後方に含む別ドメイン', 'https://evilreiwa.casa/admin/', 'staging'],
    ['本番のサブドメイン（www）', 'https://www.reiwa.casa/admin/', 'staging'],
  ];
  for (const [label, url, expected] of CASES) {
    it(`${label} → branch: ${expected}、base_url は location.origin`, () => {
      const loc = locationOf(url);
      expect(resolveCmsBackend(loc)).toEqual({ branch: expected, base_url: loc.origin });
    });
  }

  it('末尾ドット付き FQDN・大文字・プロトタイプのキー名など完全一致しないホスト名は staging', () => {
    for (const hostname of ['reiwa.casa.', 'REIWA.CASA', 'constructor', '__proto__', 'toString', '']) {
      expect(resolveCmsBackend({ hostname, origin: 'https://x.invalid' }).branch).toBe('staging');
    }
  });

  it('location を渡せない場合は例外にする（CMS.init が走らず、誤ったブランチへ書き込まない）', () => {
    expect(() => resolveCmsBackend(undefined)).toThrow();
  });

  it('戻り値は凍結されている（後続スクリプトから書き換えられない）', () => {
    expect(Object.isFrozen(resolveCmsBackend(locationOf('https://reiwa.casa/')))).toBe(true);
  });

  it('config.yml と deepmerge した実効設定は、ホストごとに name/repo/auth_endpoint を保ったまま branch/base_url が決まる', () => {
    const cfg = yaml.load(read('public/admin/config.yml'));
    for (const [url, branch] of [['https://reiwa.casa/admin/', 'main'], ['https://staging.reiwa.casa/admin/', 'staging'], ['http://localhost:4173/admin/', 'staging']]) {
      const loc = locationOf(url);
      expect(effectiveBackend(cfg, resolveCmsBackend(loc))).toEqual({
        name: 'github', repo: 'bickojima/my-blog', auth_endpoint: '/auth', branch, base_url: loc.origin,
      });
    }
  });

  it('ビルド側の本番URLと CMS 側の本番ホスト名が一致している（片方だけ変わらない）', () => {
    const cmsEnv = readFileSync(CMS_ENV_PATH, 'utf-8');
    const mapping = cmsEnv.match(/HOSTNAME_TO_BRANCH = new Map\(\[([\s\S]*?)\]\);/);
    expect(mapping, 'HOSTNAME_TO_BRANCH が見つからない').not.toBeNull();
    const entries = [...mapping[1].matchAll(/\['([^']+)',\s*'([^']+)'\]/g)].map((m) => [m[1], m[2]]);
    expect(entries).toEqual([[new URL(PRODUCTION_SITE_URL).hostname, PRODUCTION_BRANCH]]);
  });
});

describe('main / staging で環境固有ファイルに差分を置かない静的ガード（SEC-35 改訂, Bug #51・Issue #127）', () => {
  const config = yaml.load(read('public/admin/config.yml'));
  const configRaw = read('public/admin/config.yml');
  const astroConfig = read('astro.config.mjs');
  const adminHtml = read('public/admin/index.html');
  const cmsEnv = readFileSync(CMS_ENV_PATH, 'utf-8');

  it('config.yml に backend.branch / backend.base_url を書かない', () => {
    expect(config.backend).not.toHaveProperty('branch');
    expect(config.backend).not.toHaveProperty('base_url');
    expect(configRaw).not.toMatch(/^\s*(branch|base_url)\s*:/m);
  });

  it('config.yml に環境URL（https://…reiwa.casa）を書かない', () => {
    expect(configRaw).not.toMatch(/https?:\/\/[^\s'"]*reiwa\.casa/);
  });

  it('public/robots.txt を置かず、src/pages/robots.txt.ts が buildRobotsTxt(CF_PAGES_BRANCH) で生成する', () => {
    expect(existsSync(join(ROOT, 'public/robots.txt'))).toBe(false);
    const endpoint = read('src/pages/robots.txt.ts');
    expect(endpoint).toMatch(/buildRobotsTxt\(import\.meta\.env\.CF_PAGES_BRANCH\)/);
    // 本文リテラル（User-agent/Allow/Disallow）や URL をエンドポイント側に直書きしない（導出は site-env.mjs の1か所）
    expect(endpoint).not.toMatch(/['"`](User-agent|Allow|Disallow)/);
    expect(endpoint).not.toMatch(/https?:\/\//);
  });

  it('astro.config.mjs の SITE_URL はリテラルではなく resolveSiteUrl(process.env.CF_PAGES_BRANCH) で導出する', () => {
    expect(astroConfig).toMatch(/const SITE_URL = resolveSiteUrl\(process\.env\.CF_PAGES_BRANCH\);/);
    expect(astroConfig).not.toMatch(/const SITE_URL = ['"`]/);
    expect(astroConfig).not.toMatch(/https?:\/\/[^\s'"]*reiwa\.casa/);
  });

  it('admin/index.html は Decap 読み込み前に CMS_MANUAL_INIT と /admin/cms-env.js を読み込む', () => {
    const manual = adminHtml.indexOf('window.CMS_MANUAL_INIT = true');
    const envTag = adminHtml.indexOf('<script src="/admin/cms-env.js"></script>');
    const decap = adminHtml.search(/<script\s+src="https:\/\/unpkg\.com\/decap-cms@/);
    expect(manual).toBeGreaterThan(-1);
    expect(envTag).toBeGreaterThan(-1);
    expect(decap).toBeGreaterThan(-1);
    expect(manual).toBeLessThan(decap);
    expect(envTag).toBeLessThan(decap);
  });

  it('admin/index.html は registerPreviewStyle の後に CMS.init({ config: { backend: resolveCmsBackend(location) } }) を1回だけ呼ぶ', () => {
    const inits = adminHtml.match(/CMS\.init\(/g) || [];
    expect(inits).toHaveLength(1);
    expect(adminHtml).toContain('CMS.init({ config: { backend: window.resolveCmsBackend(window.location) } });');
    expect(adminHtml.indexOf('CMS.init(')).toBeGreaterThan(adminHtml.indexOf('CMS.registerPreviewStyle('));
  });

  it('cms-env.js は URL を持たず、use strict・const/let のみで innerHTML を使わない', () => {
    expect(cmsEnv).toMatch(/'use strict';/);
    expect(cmsEnv).not.toMatch(/https?:\/\//);
    expect(cmsEnv).not.toMatch(/\bvar\s/);
    expect(cmsEnv).not.toMatch(/innerHTML|outerHTML/);
    expect(cmsEnv).toMatch(/base_url: loc\.origin/);
  });
});
