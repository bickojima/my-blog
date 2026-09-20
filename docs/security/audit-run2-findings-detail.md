# Findings detail — bickojima/my-blog run-2

The skill requires this file to carry the complete source path and target-neutral local
reproduction for each confirmed record of `medium`, `high` or `critical` severity.

**This run produced no confirmed record at `medium` or above.** The single confirmed
record is `low`, and its full trace, reproduction, conditions, impact and remediation are
already given in section 3.1 of `REPORT.md` and in `findings.json`. It is repeated here in
full so this file stands alone, but its inclusion is for completeness rather than because
its severity requires it.

---

## `public/admin/url-map.json:draft-slug-exposure` — confirmed, low

### Ordered repository-relative trace

| # | Kind | Location | Operation |
|---|---|---|---|
| 1 | entrypoint | `public/_routes.json:9` | `/admin/*` is listed under `exclude`, so every file under `public/admin` is served directly to any anonymous requester with no handler able to authorize, filter or reject the request |
| 2 | propagation | `scripts/organize-posts.mjs:88` | `for (const filePath of allFiles)` iterates every Markdown file returned by `findMdFiles(POSTS_DIR)`; the only skip is `if (!fm) continue` for unparseable frontmatter, and no draft check exists anywhere in the file |
| 3 | propagation | `scripts/organize-posts.mjs:93` | `urlMap[relPath] = \`/posts/${fm.year}/${fm.month}/${fileSlug}\`` assigns every file, draft or not, its future public permalink |
| 4 | sink | `public/admin/url-map.json:2` | The git-tracked artifact contains `"2026/01/過去記事"` and, at line 3, `"2026/02/codeblockテスト"` — both `draft: true` and excluded from every rendered page, the feed and the archives |

### Evidence

| File | Line | What it shows |
|---|---|---|
| `scripts/organize-posts.mjs` | 86 | `const allFiles = findMdFiles(POSTS_DIR);` — collects every post file with no publication-state filter |
| `scripts/organize-posts.mjs` | 98 | `fs.writeFileSync(urlMapPath, ...)` — writes the unfiltered map into the directory Astro copies verbatim into `dist/` |
| `public/admin/url-map.json` | 2 | Committed output contains the first draft post and its future public URL |
| `public/admin/url-map.json` | 3 | Committed output contains the second draft post and its future public URL |
| `src/content/posts/2026/01/過去記事.md` | 4 | `draft: true` |
| `src/pages/rss.xml.js` | 7 | `.filter((post) => !post.data.draft)` — one of eleven verified draft-gate call sites |
| `tests/build.test.mjs` | 393 | The RSS suite asserts draft titles are absent from `rss.xml` (393-401), while the url-map suite (710-748) validates only shape and key format |
| `public/_headers` | 29 | The `/admin/*` block sets only `X-Robots-Tag`, COOP, `X-Frame-Options`, CORP, `Cache-Control` and a CSP — no authentication directive |
| `wrangler.toml` | 5 | `pages_build_output_dir = "dist"` |

### Dummy attacker and affected resource

- **Principal:** anonymous internet reader, no session, cookie or credential — the architecture's "Anonymous internet reader".
- **Affected resource:** the titles, date-derived paths and future permalinks of unpublished posts, which every rendering route deliberately withholds.

### Native input and bounded instructions

The target's native interface for this surface is an HTTP GET of a static asset. **No live
request was made in this audit** — the execution policy is source-only. The bounded
reproduction is a source read:

1. Read `scripts/organize-posts.mjs:23-44` and confirm `extractFrontmatter` never reads or returns a `draft` field, so the url-map loop cannot skip drafts.
2. Read `public/admin/url-map.json:2-3` and confirm both listed keys correspond to posts.
3. Read `src/content/posts/2026/01/過去記事.md:4` and `src/content/posts/2026/02/codeblockテスト.md:4` and confirm both carry `draft: true`.
4. Read `public/_routes.json:9` and confirm `/admin/*` is in the `exclude` list.
5. Read the `public/_headers` `/admin/*` block and confirm no authentication directive.
6. `grep` the repository for `url-map` in client code and confirm no reference exists.

Native request form, for the owner's own later check only: `GET /admin/url-map.json`.

### Observed output and the invariant it proves

`public/admin/url-map.json` is git-tracked at `b5a42a3` and its lines 2-3 already list both
current draft posts mapped to the URLs they will occupy after publication. `scripts/organize-posts.mjs`
is the sole generator and applies no draft filter. `public/_routes.json:9` removes the path
from Function routing, so nothing in `functions/auth/` can gate it, and the `_headers`
`/admin/*` block contains no authentication mechanism. No `.assetsignore` entry, `_redirects`
rule or Access policy in source withholds the file.

The invariant this breaks: **a post marked `draft: true` must not have its existence, title
or future URL disclosed to an anonymous reader.** Eleven rendering call sites enforce it and
`tests/build.test.mjs:393-401` already encodes it as a tested requirement for the RSS feed.

### Conditions and containment

- At least one post carries `draft: true` (two do at this commit).
- `/admin/url-map.json` matches neither Function `include` pattern, so no handler sees it.
- Containment that *does* hold: post bodies never reach `dist`, the mapped URL returns the
  static 404 until publication, and no credential, token or write access is exposed.
- `robots.txt` and `X-Robots-Tag: noindex` affect crawler indexing only, not retrieval.

### Source-level remediation and regression case

Return `draft` from `extractFrontmatter`, then skip drafts **in the url-map loop only**:

```js
// in extractFrontmatter's return object:
draft: data.draft === true,

// in the url-map loop (scripts/organize-posts.mjs:88-93):
if (!fm || fm.draft) continue;
```

Do **not** apply the skip to the first file-organizing pass at lines 63-76: that pass must
keep relocating draft files into their `YYYY/MM` directories. An independent Phase 5
verifier specifically checked this and confirmed the scoped fix leaves the mover intact,
because the mover never inspects `fm.draft`.

**Regression case.** Mirror the existing RSS draft-exclusion test: parse
`public/admin/url-map.json` and every file under `src/content/posts`, and assert that no map
key corresponds to a post whose frontmatter has `draft: true`. Against the current tree this
fails on both draft posts; after the fix it passes with the five published entries intact.
