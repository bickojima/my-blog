import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// 対象は固定ページのfrontmatterから決める（URL・タイトルをテストへ書かない）
const pagesDir = path.join(process.cwd(), 'src/content/pages');
const noindexPages = readdirSync(pagesDir)
  .filter(file => file.endsWith('.md'))
  .map(file => matter(readFileSync(path.join(pagesDir, file), 'utf8')).data)
  .filter(data => data.noindex === true && data.draft !== true);

for (const data of noindexPages) {
  const route = `/${data.slug}/`;
  test(`FR-29: 検索除外ページの表示・実リンク操作・アクセシビリティ ${route}`, async ({ page }, testInfo) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(data.title);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(data.title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    // 検索結果には出さない。sitemap除外はビルドテスト側で検証する。
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    expect(await page.locator('form').count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);

    // 赤枠は証跡用の注釈のみ。合格判定は元の画面と実クリック／Enter操作で行う。
    await page.locator('article .page-content').evaluate(element => {
      (element as HTMLElement).style.outline = '2px solid #dc2626';
    });
    // 証跡の保存先はプロジェクトのoutputDir。日付をテストへ埋め込まない。
    const shot = path.join(testInfo.project.outputDir, `app-info_${data.slug}_${testInfo.project.name}.png`);
    await page.screenshot({ path: shot, fullPage: true });

    // 本文の相互リンクを実操作で確認する
    const bodyLink = page.locator('.page-content a[href^="/"]').first();
    const href = await bodyLink.getAttribute('href');
    await bodyLink.click();
    await expect(page).toHaveURL(new RegExp(`${href!.replace(/\/$/, '')}/?$`));
  });
}

test('FR-29: noindex固定ページをメニューから除外し通常ページへ遷移できる', async ({ page }, testInfo) => {
  const visiblePages = readdirSync(pagesDir)
    .filter(file => file.endsWith('.md'))
    .map(file => matter(readFileSync(path.join(pagesDir, file), 'utf8')).data)
    .filter(data => !data.draft && !data.noindex)
    .sort((a, b) => a.order - b.order);
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'メイン', exact: true });
  const toggle = nav.getByRole('button', { name: 'ページメニュー' });
  if (visiblePages.length > 1) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.locator('.nav-dropdown-menu')).toBeVisible();
    await expect(nav.locator('.nav-dropdown-menu a')).toHaveCount(visiblePages.length);
  } else {
    await expect(toggle).toHaveCount(0);
  }
  for (const data of noindexPages) {
    await expect(nav.locator(`a[href="/${data.slug}"], a[href="/${data.slug}/"]`)).toHaveCount(0);
  }
  for (const data of visiblePages) {
    await expect(nav.locator(`a[href="/${data.slug}"]`).last()).toBeVisible();
  }
  // 実クリック後の表示を注釈付きで記録。DOM操作は注釈のみに限定する。
  await nav.evaluate(element => {
    (element as HTMLElement).style.outline = '2px solid #dc2626';
    const label = document.createElement('span');
    label.textContent = 'FR-29: noindex pages excluded';
    label.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:9999;color:#dc2626;background:white;font-size:11px;pointer-events:none';
    element.appendChild(label);
  });
  await page.screenshot({ path: path.join(testInfo.project.outputDir, `noindex-nav_${testInfo.project.name}.png`) });
  if (visiblePages.length > 0) {
    await nav.locator(`a[href="/${visiblePages[0].slug}"]`).last().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(visiblePages[0].title);
  }
});
