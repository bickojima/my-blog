import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWED_IDENTITIES = new Set([
  'tbi\u0000noreply@users.noreply.github.com',
  'bickojima\u0000bickojima@users.noreply.github.com',
  'GitHub\u0000noreply@github.com',
  'dependabot[bot]\u000049699333+dependabot[bot]@users.noreply.github.com',
]);
const SHA_PATTERN = /^[0-9a-f]{40}$/i;

export function isAllowedIdentity(name, email) {
  return ALLOWED_IDENTITIES.has(`${name}\u0000${email}`);
}

export function validateIdentityRecords(records) {
  const rejected = [];
  for (const { sha, authorName, authorEmail, committerName, committerEmail } of records) {
    const fields = [];
    if (!isAllowedIdentity(authorName, authorEmail)) fields.push('author');
    if (!isAllowedIdentity(committerName, committerEmail)) fields.push('committer');
    if (fields.length > 0) rejected.push({ sha, fields });
  }
  return rejected;
}

function readCommitIdentities(baseSha, headSha, cwd, forceFullHistory) {
  if (!SHA_PATTERN.test(headSha) || (!SHA_PATTERN.test(baseSha) && !/^0{40}$/.test(baseSha))) {
    throw new Error('Invalid base or head commit SHA.');
  }

  execFileSync('git', ['cat-file', '-e', `${headSha}^{commit}`], {
    cwd,
    stdio: 'ignore',
  });

  let hasBase = !/^0{40}$/.test(baseSha);
  if (hasBase) {
    try {
      execFileSync('git', ['cat-file', '-e', `${baseSha}^{commit}`], {
        cwd,
        stdio: 'ignore',
      });
    } catch {
      hasBase = false;
    }
  }

  const revisionRange = forceFullHistory || !hasBase ? headSha : `${baseSha}..${headSha}`;
  const commits = execFileSync('git', ['rev-list', '--reverse', revisionRange], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim().split('\n').filter(Boolean);

  return commits.map((sha) => {
    const fields = execFileSync('git', ['show', '-s', '--format=%an%x00%ae%x00%cn%x00%ce', sha], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).split('\u0000');
    if (fields.length < 4) throw new Error('Unable to read commit identity metadata.');
    return {
      sha,
      authorName: fields[0],
      authorEmail: fields[1],
      committerName: fields[2],
      committerEmail: fields[3].replace(/[\r\n]+$/, ''),
    };
  });
}

export function checkCommitRange(baseSha, headSha, cwd = process.cwd(), forceFullHistory = false) {
  try {
    const records = readCommitIdentities(baseSha, headSha, cwd, forceFullHistory);
    const rejected = validateIdentityRecords(records);
    return { ok: rejected.length === 0, rejected, checked: records.length };
  } catch {
    return { ok: false, rejected: [], error: true };
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = checkCommitRange(
    process.env.BASE_SHA ?? '',
    process.env.HEAD_SHA ?? '',
    process.cwd(),
    process.env.FULL_HISTORY === 'true',
  );
  if (result.error) {
    process.stderr.write('Commit identity check could not inspect the requested commit range.\n');
    process.exit(2);
  }
  if (!result.ok) {
    for (const item of result.rejected) {
      process.stderr.write(`${item.sha}: disallowed ${item.fields.join(' and ')} identity.\n`);
    }
    process.stderr.write('Commit author and committer identities must use an approved repository identity.\n');
    process.exit(1);
  }
  process.stdout.write(`Commit identity check passed (${result.checked} commits checked).\n`);
}
