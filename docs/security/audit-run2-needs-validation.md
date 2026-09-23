# Needs validation — bickojima/my-blog run-2

Two source-grounded leads whose decisive fact this run could not observe. **These are not
findings.** They carry no severity, and neither should be described as a vulnerability until
its blocker is resolved. Each names a boundary and a possible concrete result; each may turn
out to be nothing.

Neither plan below sends audit traffic anywhere. The deployment steps ask the owner to
observe their own configuration and their own responses.

---

## Lead 1 — `public/headers:admin-scope-duplicate-COOP-CORP-append`

**Duplicate-value COOP (and possibly CORP) headers on `/admin/*` rely on an append-safety
assumption that fails for COOP structured-field parsing.**

### Source trace

| Kind | Location | Operation |
|---|---|---|
| entrypoint | `public/_headers:13` | The `/*` block matches every request, including `/admin/index.html`, and sets nine headers including COOP at line 21 and CORP at line 22 |
| propagation | `public/_headers:7` | The file documents that Cloudflare Pages appends rather than overrides same-named headers from both matching blocks, and prescribes identical-value duplication as the mitigation |
| propagation | `public/_headers:29` | The `/admin/*` block repeats only `X-Robots-Tag` (new), `X-Frame-Options`, COOP and CORP, and adds `Cache-Control` and a CSP. It repeats none of the other six `/*` headers |
| sink | `public/_headers:31` | Combined with line 21 this yields `same-origin-allow-popups, same-origin-allow-popups`; the CORP duplicate at line 33 yields `same-site, same-site` |

### Verified evidence

- `public/_headers:6` — the append behaviour is stated explicitly, citing Bug #28.
- `public/_headers:8` — the mitigation assumption under test: identical duplicates are claimed to be handled correctly per RFC. True for `X-Frame-Options`; the record's claim is that it is false for COOP.
- `public/_headers:14` — `nosniff` is set only in `/*` and not repeated under `/admin/*`; one of six headers that would be lost on the CMS path if the platform overrode rather than appended.
- `public/_routes.json:9` — `/admin/*` is excluded from the Function runtime, so no handler can re-add a dropped header. The `_headers` rendering is the complete policy for that path.
- `docs/DOCUMENTATION.md:1739` — Bug #28. Establishes append, but its "browsers adopt the strictest value" note concerns two **differing** values under the earlier override assumption.
- `docs/DOCUMENTATION.md:522` — SEC-23 records the current rationale asserting identical-value duplication is safe, without justifying it against RFC 8941 parsing.
- `docs/DOCUMENTATION.md:1929` — a repository policy against any same-named header duplication, in tension with the current design.

### Affected boundary

Cross-origin pages ↔ the `/admin/` document's browsing-context-group isolation, and
cross-origin embedders ↔ `/admin/*` assets.

### Exact blockers

1. Source-only execution policy: no browser or Cloudflare response can be observed.
2. **Narrowed by Phase 5.** `docs/DOCUMENTATION.md:1739` already answers the append-versus-override question from local source, so that is no longer a blocker. What remains is whether that 2026-02-21 empirical finding still reflects current platform behaviour and extends unchanged to the present three-header, identical-value configuration.
3. **The CORP direction.** Which branch of the Fetch cross-origin resource policy check a present-but-unmatched combined value takes — treated as absent and allowed (a control loss) or treated as invalid and blocked (an availability bug) — could not be re-derived under the no-network policy. This decides what the CORP half even *is*.
4. What a current browser actually computes for COOP and CORP from the served `/admin/` response, and whether the six `/*`-only headers appear on that path at all.

### Bounded local next step

Write a small self-contained script that reproduces HTTP header-value combination (join
same-named field-line values with `", "`) followed by RFC 8941 §4.2 structured-field *item*
parsing, and feed it the two combined values. Confirm whether item parsing fails on the COOP
value and whether the CORP value matches any accepted token. Then add a unit test over
`public/_headers` asserting that no header name appears in both the `/*` and `/admin/*`
blocks unless that header's parser tolerates a comma-joined list, and that `/admin/*`
repeats every `/*` header it does not intentionally override.

### Safe owner-observed check

Request the deployed `/admin/` document and one asset under `/admin/` on both
`staging.reiwa.casa` and `reiwa.casa`, and record the raw response headers: whether COOP and
CORP each appear once or twice on the wire, and whether `X-Content-Type-Options`,
`Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`,
`X-DNS-Prefetch-Control` and `X-Permitted-Cross-Domain-Policies` are present on that path.
Then inspect the loaded `/admin/` document in devtools to confirm the effective COOP, and
attempt a cross-origin `no-cors` fetch of an `/admin/*` asset from a separate origin to
establish whether the effective CORP allows or blocks it.

### Note on consequence, if it resolves against the code

Losing COOP `same-origin-allow-popups` would **not** break the OAuth popup handshake — the
`unsafe-none` fallback is strictly more permissive for the opener relationship. The cost
would be loss of browsing-context-group isolation on the admin document.

---

## Lead 2 — `cloudflare-pages-build-unpinned-npm-install-semver-ranges`

**The lockfile pins the dependency graph, but the Cloudflare Pages release build's install
command is not in source and may re-resolve the caret ranges.**

### Source trace

| Kind | Location | Operation |
|---|---|---|
| entrypoint | `package.json:18` | `"astro": "^5.17.1"` — representative of all 6 direct dependencies (16-21) and 7 devDependencies (24-30), every one a caret range |
| propagation | `wrangler.toml:7` | `# Build command is defined in Cloudflare Pages dashboard or can be:` — the release build's command, including its install step, is recorded as living outside source review |
| propagation | `package.json:8` | The `build` script runs vitest, the prebuild scripts and `astro build`; it contains no `npm ci` or `npm install` |
| propagation | `package-lock.json:4` | `"lockfileVersion": 3`, with sha512 integrity across all entries — the pinning `npm ci` enforces and `npm install` may rewrite |
| sink | `wrangler.toml:5` | `pages_build_output_dir = "dist"` — whatever that build produces is published as the live site |

### Verified evidence

- `package.json:16` — start of `dependencies`; no exact pin, no `overrides`, `resolutions`, `packageManager` or `engines` key anywhere, and no `.nvmrc` in the repository.
- `wrangler.toml:8` — `#   npm run build`, naming a script that performs no dependency installation.
- `.github/workflows/ci.yml:24` — `npm ci`, the only lockfile-honouring install in source, belonging to the job that uploads no artifact and performs no deployment.
- `package-lock.json:7` — the root package entry recording the caret ranges verbatim.
- Independently re-confirmed during verification: 1,117/1,117 resolved URLs point to `registry.npmjs.org`, 1,116/1,117 non-root entries carry sha512 integrity, and no `.npmrc` exists. Five entries carry `hasInstallScript` (esbuild ×2, sharp, fsevents ×2).
- `README.md:135` documents `npm install` as local contributor setup only; it does not bind the Pages release build.

### Affected boundary

Upstream npm maintainers → the build process that writes `dist/` and therefore the published
site HTML.

### Exact blockers

1. Source-only execution policy: no Pages build can be triggered or inspected.
2. The Pages build configuration — build command, any install-command override, and Node version for Production and Preview — is dashboard-only, with no repository record.
3. Whether the Pages build context includes `package-lock.json` at all, and whether the platform's Astro framework preset selects `npm ci` or `npm install` when a v3 lockfile is present.

### Bounded local next step

Offline and without installing anything, extract every `dependencies` and `devDependencies`
range from `package.json` with `jq` and compare each against the version recorded in
`package-lock.json`, showing how much room each caret range leaves above the pinned version
— i.e. the exact set of packages whose resolution could move if the release build does not
consult the lockfile. This establishes that the lockfile is a sufficient control *if
consulted*, reducing the whole question to whether the release build consults it.

### Safe owner-observed check

Open the Cloudflare Pages dashboard for `my-blog` → Settings → Builds & deployments and
record the exact **Build command**, any **Install command** override, and the **Node
version**, separately for Production and Preview.

- If the install resolves to `npm ci`, **the lead is refuted** and the pinning holds end to end. Close it.
- If it resolves to `npm install`, a package-manager default, or a framework-preset default that does not consult the lockfile, the lead is substantiated and the fix is to set the build command explicitly to `npm ci && npm run build:raw`.
  - **Correction (2026-09-23, Issue #128):** do not use `build:raw` here. The Pages build command is `npm run build` (confirmed in the dashboard on 2026-09-23). Its leading `vitest run` step is the test gate that stops a deploy when tests fail, and `build:raw` skips that step. If this fix is needed, use `npm ci && npm run build` (see DOCUMENTATION.md 2.5.1).

As a cross-check, open the most recent production build log, read the install line it printed
and the resolved `astro` version, and compare that version against `package-lock.json`. A
mismatch demonstrates the divergence directly.
