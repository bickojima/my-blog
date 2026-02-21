import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * アクセシビリティ E2Eテスト
 *
 * axe-coreエンジンを使用してWCAG 2.1 Level AA準拠を検証する。
 * critical/seriousレベルの違反がないことを確認する。
 *
 * テストID: E-25〜E-27
 */

test.describe('E-25: トップページ・記事ページのアクセシビリティ', () => {
  test('トップページにcritical/seriousなa11y違反がない', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(
      critical,
      `Critical/serious a11y violations: ${critical.map((v) => `${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('; ')}`,
    ).toHaveLength(0);
  });

  test('記事詳細ページにcritical/seriousなa11y違反がない', async ({ page }) => {
    await page.goto('/');
    const firstPostLink = page.locator('a.post-title').first();
    await firstPostLink.click();
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(
      critical,
      `Critical/serious a11y violations: ${critical.map((v) => `${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('; ')}`,
    ).toHaveLength(0);
  });
});

test.describe('E-26: 固定ページ・ナビゲーションのアクセシビリティ', () => {
  test('固定ページにcritical/seriousなa11y違反がない', async ({ page }) => {
    await page.goto('/');
    const navLink = page.locator('.nav-dropdown-link');
    const href = await navLink.getAttribute('href');
    if (href) {
      await page.goto(href);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );
      expect(
        critical,
        `Critical/serious a11y violations: ${critical.map((v) => `${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('; ')}`,
      ).toHaveLength(0);
    }
  });

  test('画像にalt属性がある', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Image ${i} missing alt attribute`).not.toBeNull();
    }
  });

  test('見出し階層が正しい（h1から始まりスキップしない）', async ({ page }) => {
    await page.goto('/');

    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) =>
        parseInt(h.tagName[1]),
      );
    });

    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toBe(1);

    for (let i = 1; i < headings.length; i++) {
      // 見出しレベルが2以上スキップしないこと（h1→h3 は不可、h2→h1 は許容）
      expect(headings[i] - headings[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('E-27: CMS管理画面のアクセシビリティ', () => {
  test('CMS管理画面にcriticalなa11y違反がない', async ({ page }) => {
    await page.goto('/admin/');
    await page.waitForTimeout(3000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // CMSはサードパーティ（Decap CMS）なのでcriticalのみチェック
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(
      critical,
      `Critical a11y violations: ${critical.map((v) => `${v.id}: ${v.description} (${v.nodes.length} nodes)`).join('; ')}`,
    ).toHaveLength(0);
  });
});
