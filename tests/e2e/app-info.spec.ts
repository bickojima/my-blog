import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const pagesRoot = path.join(process.cwd(), 'src/pages');
function findAppPages(dir: string): { route: string; data: Record<string, any> }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return findAppPages(file);
    if (!entry.name.endsWith('.md')) return [];
    const { data } = matter(readFileSync(file, 'utf8'));
    if (!String(data.layout).endsWith('/AppInfo.astro')) return [];
    const route = '/' + path.relative(pagesRoot, file).replaceAll(path.sep, '/')
      .replace(/index\.md$/, '').replace(/\.md$/, '/');
    return [{ route, data }];
  });
}

for (const { route, data } of findAppPages(pagesRoot)) {
  test(`FR-29: アプリ案内の表示・実リンク操作・アクセシビリティ ${route}`, async ({ page }, testInfo) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(data.title);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(data.title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    expect(await page.locator('form').count()).toBe(0);
    // 検索結果には出さない。sitemap除外はビルドテスト側で検証する。
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);

    // 赤枠は証跡用の注釈のみ。合格判定は元の画面と実クリック／Enter操作で行う。
    await page.locator('article.app-info nav').evaluate(element => {
      (element as HTMLElement).style.outline = '2px solid #dc2626';
    });
    // 証跡の保存先はプロジェクトのoutputDir。日付をテストへ埋め込まない。
    const slug = route.replace(/\//g, '-').replace(/^-|-$/g, '') || 'root';
    const shot = path.join(testInfo.project.outputDir, `app-info_${slug}_${testInfo.project.name}.png`);
    await page.screenshot({ path: shot, fullPage: true });

    const nav = page.getByRole('navigation', { name: 'アプリの案内' });
    await nav.getByRole('link', { name: 'プライバシーポリシー', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(data.privacy.replace(/\/$/, '') + '/?$'));
    await page.getByRole('navigation', { name: 'アプリの案内' })
      .getByRole('link', { name: 'アプリ紹介', exact: true }).press('Enter');
    await expect(page).toHaveURL(new RegExp(data.appHome.replace(/\/$/, '') + '/?$'));
  });
}
