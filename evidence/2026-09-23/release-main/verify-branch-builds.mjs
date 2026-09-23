/** Reproduce production/staging static output from the same merge candidate. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const cases = [
  { branch: 'main', expectedOrigin: 'https://reiwa.casa', production: true },
  { branch: 'staging', expectedOrigin: 'https://staging.reiwa.casa', production: false },
];
const output = [];
for (const item of cases) {
  const run = spawnSync('npm', ['run', 'build:raw'], {
    encoding: 'utf8',
    env: { ...process.env, CF_PAGES_BRANCH: item.branch },
  });
  assert.equal(run.status, 0, `${item.branch} build failed: ${run.stderr}`);
  const robots = readFileSync('dist/robots.txt', 'utf8');
  const index = readFileSync('dist/index.html', 'utf8');
  const sitemap = readFileSync('dist/sitemap-index.xml', 'utf8');
  const expectedRobots = item.production ? /^Allow: \/$/m : /^Disallow: \/$/m;
  assert.match(robots, expectedRobots);
  assert.match(index, new RegExp(`<link rel="canonical" href="${item.expectedOrigin}/"`));
  assert.ok(sitemap.includes(item.expectedOrigin));
  const otherOrigin = item.production ? 'https://staging.reiwa.casa' : 'https://reiwa.casa';
  assert.ok(!sitemap.includes(otherOrigin), `${item.branch} sitemap contains ${otherOrigin}`);
  output.push({
    branch: item.branch,
    status: 'PASS',
    robots: robots.trim(),
    canonical: index.match(/<link rel="canonical" href="([^"]+)/)?.[1],
    sitemapIncludesExpectedOrigin: sitemap.includes(item.expectedOrigin),
    sitemapIncludesOtherOrigin: sitemap.includes(otherOrigin),
  });
}
writeFileSync('evidence/2026-09-23/release-main/branch-build-results.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
