import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { checkCommitRange, isAllowedIdentity } from '../scripts/check-commit-identities.mjs';

const temporaryDirectories = [];

function createRepository() {
  const directory = mkdtempSync(join(tmpdir(), 'commit-identity-'));
  temporaryDirectories.push(directory);
  const git = (args) => execFileSync('git', args, { cwd: directory, stdio: 'pipe', encoding: 'utf8' }).trim();
  git(['init']);
  git(['config', 'user.name', 'Fixture Author']);
  git(['config', 'user.email', 'fixture@example.invalid']);
  writeFileSync(join(directory, 'fixture.txt'), 'base\n');
  git(['add', 'fixture.txt']);
  git(['-c', 'user.name=Legacy Fixture', '-c', 'user.email=legacy@example.invalid', 'commit', '-m', 'fixture base']);
  const base = git(['rev-parse', 'HEAD']);
  return { directory, git, base };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('incoming commit identity gate', () => {
  it('allows canonical tbi, historical bickojima noreply, and GitHub identities only', () => {
    expect(isAllowedIdentity('tbi', 'noreply@users.noreply.github.com')).toBe(true);
    expect(isAllowedIdentity('bickojima', 'bickojima@users.noreply.github.com')).toBe(true);
    expect(isAllowedIdentity('GitHub', 'noreply@github.com')).toBe(true);
    expect(isAllowedIdentity('dependabot[bot]', '49699333+dependabot[bot]@users.noreply.github.com')).toBe(true);
    expect(isAllowedIdentity('tbi', 'fixture@example.invalid')).toBe(false);
    expect(isAllowedIdentity('Unapproved Fixture', 'noreply@users.noreply.github.com')).toBe(false);
  });

  it('checks only commits introduced after the base and inspects author and committer', () => {
    const { directory, git, base } = createRepository();
    writeFileSync(join(directory, 'fixture.txt'), 'approved\n');
    git(['add', 'fixture.txt']);
    git(['-c', 'user.name=tbi', '-c', 'user.email=noreply@users.noreply.github.com', 'commit', '-m', 'approved fixture']);
    const approved = git(['rev-parse', 'HEAD']);

    expect(checkCommitRange(base, approved, directory)).toMatchObject({ ok: true, checked: 1, rejected: [] });

    writeFileSync(join(directory, 'fixture.txt'), 'rejected\n');
    git(['add', 'fixture.txt']);
    git(['-c', 'user.name=Unapproved Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'rejected fixture']);
    const rejected = git(['rev-parse', 'HEAD']);
    expect(checkCommitRange(approved, rejected, directory)).toMatchObject({
      ok: false,
      checked: 1,
      rejected: [{ sha: rejected, fields: ['author', 'committer'] }],
    });
  });

  it('does not disclose rejected identity values in the CI error output', () => {
    const { directory, git, base } = createRepository();
    writeFileSync(join(directory, 'fixture.txt'), 'rejected\n');
    git(['add', 'fixture.txt']);
    git(['-c', 'user.name=Unapproved Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'rejected fixture']);
    const head = git(['rev-parse', 'HEAD']);
    const result = spawnSync(process.execPath, [resolve('scripts/check-commit-identities.mjs')], {
      cwd: process.cwd(),
      env: { ...process.env, BASE_SHA: base, HEAD_SHA: head, GIT_DIR: join(directory, '.git'), GIT_WORK_TREE: directory },
      encoding: 'utf8',
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`${head}: disallowed author and committer identity.`);
    expect(result.stderr).not.toContain('fixture@example.invalid');
  });

  it('fails closed when the requested range cannot be inspected', () => {
    expect(checkCommitRange('not-a-sha', 'also-not-a-sha')).toMatchObject({ ok: false, error: true });
  });

  it('audits the full new history when the previous push SHA is unavailable', () => {
    const { directory, git, base } = createRepository();
    writeFileSync(join(directory, 'fixture.txt'), 'approved\n');
    git(['add', 'fixture.txt']);
    git(['-c', 'user.name=tbi', '-c', 'user.email=noreply@users.noreply.github.com', 'commit', '-m', 'approved fixture']);
    const head = git(['rev-parse', 'HEAD']);

    expect(checkCommitRange('f'.repeat(40), head, directory)).toMatchObject({
      ok: false,
      rejected: [{ sha: base, fields: ['author', 'committer'] }],
    });
  });

  it('audits the full new history for a forced push even when its old SHA is available', () => {
    const { directory, git, base } = createRepository();
    writeFileSync(join(directory, 'fixture.txt'), 'approved\n');
    git(['add', 'fixture.txt']);
    git(['-c', 'user.name=tbi', '-c', 'user.email=noreply@users.noreply.github.com', 'commit', '-m', 'approved fixture']);
    const head = git(['rev-parse', 'HEAD']);

    expect(checkCommitRange(base, head, directory, true)).toMatchObject({
      ok: false,
      rejected: [{ sha: base, fields: ['author', 'committer'] }],
    });
  });

  it('can inspect the PR head commit available as a merge-ref parent', () => {
    const { directory, git, base } = createRepository();
    writeFileSync(join(directory, 'fixture.txt'), 'approved head\n');
    git(['add', 'fixture.txt']);
    git(['-c', 'user.name=tbi', '-c', 'user.email=noreply@users.noreply.github.com', 'commit', '-m', 'approved head']);
    const head = git(['rev-parse', 'HEAD']);
    const tree = git(['rev-parse', 'HEAD^{tree}']);
    const mergeRef = git(['commit-tree', tree, '-p', base, '-p', head, '-m', 'synthetic PR merge ref']);

    expect(git(['cat-file', '-e', `${head}^{commit}`])).toBe('');
    expect(git(['rev-parse', `${mergeRef}^2`])).toBe(head);
    expect(checkCommitRange(base, head, directory)).toMatchObject({ ok: true, checked: 1, rejected: [] });
  });

  it('uses full history for forced pushes and base/head deltas for ordinary events', () => {
    const workflow = readFileSync(resolve('.github/workflows/ci.yml'), 'utf8');
    expect(workflow.indexOf('Setup Node.js')).toBeLessThan(workflow.indexOf('Check identities on incoming commits'));
    expect(workflow.indexOf('Check identities on incoming commits')).toBeLessThan(workflow.indexOf('Install dependencies'));
    expect(workflow).toContain('fetch-depth: 0');
    expect(workflow).toContain('github.event.pull_request.base.sha');
    expect(workflow).toContain('github.event.pull_request.head.sha');
    expect(workflow).toContain('github.event.before');
    expect(workflow).toContain('github.event.forced');
  });
});
