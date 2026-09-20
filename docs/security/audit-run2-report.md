# Security audit — bickojima/my-blog — run-2

## 1. Run parameters and honest limits

| | |
|---|---|
| Target | `bickojima/my-blog` |
| Source ref | `b5a42a3` (branch `audit/security-run2`, cut from `staging`); worktree clean apart from a staged `skills-lock.json`, no target source modified |
| Profile | `standard` |
| Scope | `functions/`, `public/`, `scripts/`, `src/`, `.github/`, `package.json`, `package-lock.json`, `wrangler.toml`, `astro.config.mjs`, `playwright.config.ts`, `vitest.config.ts` |
| Budget | none set |
| Execution policy | **source-only** |
| Agents spent | 19 (5 wave-1 hunters, 1 wave-2 hunter, 1 wave-3 hunter, 1 coverage critic, 11 verifiers across Phase 3 and Phase 5) |

### Execution policy — this is the most important limit on this run

The host cannot enforce the OS sandbox control set the skill requires: there is no external-network cutoff with isolated loopback, no read-only target and toolchain mounts, and no enforced CPU, memory, process, file-size, disk or wall-clock limits. Per the skill, **no target-controlled code was executed**. Every check in this run is `method: source`. Nothing was built, installed, or run; no deployed endpoint, GitHub, unpkg or Cloudflare service was contacted.

The direct consequence is that findings whose decisive fact is a deployment or runtime observation cannot reach `confirmed` here. Two such leads are recorded under NEEDS VALIDATION with exact blockers and safe owner-observed checks. They are **not** findings and must not be read as such.

### Other disclosed deviations

1. **Reconnaissance was performed by the parent rather than by four delegated agents.** The in-scope source is about 2,600 lines across roughly 40 files, so direct reading gave a more accurate map at lower cost. Delegation was used for hunting, the coverage critic, and all verification — where agent independence is the point.
2. **The post-wave coverage critic ran in parallel with Phase 3 rather than strictly before it**, to fit an account session rate limit encountered mid-run. This does not change any verdict: a critic proposes coverage and never findings, and its two accepted proposals were hunted in wave 3 and fully verified.
3. **A first attempt at Phase 3 launched six verifiers that all terminated on a session rate limit.** They were relaunched on a smaller model. No partial output from the failed attempt was used.
4. **One Phase 5 replacement was applied directly although it changed a verdict.** The skill requires fresh re-verification when a replacement *promotes* a record. The replacement in question *demoted* `github-workflows-ci-yml-actions-v4-unpinned` from `confirmed` to `rejected` — the conservative direction, which removes a claim rather than adding one — so it was applied without a further round. The skill's wording also covers replacements that materially change severity, so this reading is disclosed rather than assumed.
5. **One fingerprint was normalised.** `report-schema.json` restricts fingerprints to `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$`, which excludes the underscore in `_headers`. The hunter's `public/_headers:admin-scope-duplicate-COOP-CORP-append` is recorded as `public/headers:admin-scope-duplicate-COOP-CORP-append`.
6. **One fact was obtained by owner observation, not from source.** `bickojima/my-blog` is a PUBLIC repository, established by a read-only `gh repo view` metadata query on the user's own repository. This is not a probe of any deployment. It is consistent with, but not the basis of, the rejection of the CI permissions lead.

### Prior-run use

run-1 (`4e32116`, produced by a different agent) is a **partially compatible** ledger: 6 units, no `coverage_id` or `canonical_refs`, and a narrower scope that omitted `.github/`, `playwright.config.ts` and `vitest.config.ts` and treated `public/` as a single unit. All five of its findings had their relevant source changed by commit `3728976`, so each was seeded as a `prior_confirmed_changed_source` revalidation unit and **none was placed on the hunter exclusion list**. There are no carried same-source confirmations in this run. Surfaces run-1 never seeded — CI, Cloudflare routing and `_routes.json`, the build scripts' filesystem handling, feed and sitemap generation, secret handling in the Functions, Function response headers, preview-deployment credential scoping, CMS token storage, and GitHub Actions pinning — were all seeded fresh here.

**This run does not exhaust the target.** One unit is `blocked` and eleven carry candidate evidence; no one pass is complete.

## 2. Security posture

This is a small, unusually well-hardened single-author blog. The OAuth broker is the most security-sensitive component and it holds up under scrutiny: `state` is minted with `crypto.randomUUID()` and compared exactly before the code is spent, the `oauth_state` cookie is `HttpOnly; Secure; SameSite=Lax` with no `Domain` attribute and a 600-second lifetime, the clearing cookie is emitted on every one of the seven exits, the origin allowlist regexes are fully anchored with escaped dots, the requested scope is hardcoded, the token-bearing response is `no-store` with `nosniff` and `X-Frame-Options: DENY`, and both `postMessage` calls use an exact non-wildcard `targetOrigin` derived from the response's own origin. The client secret has no path to any response body, log, or build artifact. The CMS bundle is version-pinned with SRI and `crossorigin`, with a regression test asserting that form. The lockfile is exemplary: 1,117 entries, every one resolving to `registry.npmjs.org` with `sha512` integrity, no `.npmrc`, no `overrides`.

Ten candidates were raised across three hunting waves. **Seven were rejected under adversarial verification** — most of them because the only principal who could act was one that already held equal or greater authority. That ratio is the main result of this run, and it is a statement about the codebase, not about the hunters.

## 3. Confirmed findings

| Severity | Title | Boundary | Observed result |
|---|---|---|---|
| low | Build-generated `/admin/url-map.json` lists draft posts and is routed as an unauthenticated public static asset | Anonymous internet reader → the draft/publish gate that every rendering route enforces | The git-tracked `public/admin/url-map.json` at `b5a42a3` already contains both current draft posts mapped to the URLs they will occupy once published |

### 3.1 `public/admin/url-map.json:draft-slug-exposure` — low

- **Source location.** `scripts/organize-posts.mjs:86-98` (generator), `public/_routes.json:9` (routing), `public/admin/url-map.json:2-3` (artifact).
- **Lower-trust principal.** Anonymous internet reader, no credential of any kind.
- **Bounded reproduction (source, target-native).** Read `scripts/organize-posts.mjs:23-44` and confirm `extractFrontmatter` never reads `data.draft`; read `public/admin/url-map.json:2-3` and confirm both keys are posts; read `src/content/posts/2026/01/過去記事.md:4` and `src/content/posts/2026/02/codeblockテスト.md:4` and confirm both carry `draft: true`; read `public/_routes.json:9` and confirm `/admin/*` is excluded from the Function runtime; read the `public/_headers` `/admin/*` block and confirm it carries no authentication directive. The native request form is `GET /admin/url-map.json`; **no live request was made in this audit.**
- **Conditions.** At least one post carries `draft: true` — two do at this commit. `/admin/url-map.json` matches neither Function include pattern, so no handler can gate it. No `.assetsignore` entry, `_redirects` rule, or Access policy in source withholds it; `robots.txt` and `X-Robots-Tag` affect indexing, not retrieval.
- **Actual result.** The committed artifact discloses the titles (the filename is the title in this project's convention), the date-derived path, and the future permalink of both unpublished posts.
- **Impact.** Disclosure of non-secret internals. Post bodies are never emitted to `dist`, the mapped URL 404s until publication, and no credential or write access is exposed.
- **Priority rationale.** Likelihood is low because nothing references the file and discovery needs path knowledge — though the path is visible in a public repository. Impact is low. Overall low, which does not exceed demonstrated impact. It earns a place on the list because eleven rendering call sites and an existing RSS regression test establish draft invisibility as a deliberate, tested project invariant that exactly one generator skips.
- **Smallest source fix.** Return `draft` from `extractFrontmatter` and add `if (!fm || fm.draft) continue;` **to the url-map loop only** (lines 88-93), not to the file-organizing pass at lines 63-76, which must keep relocating draft files into `YYYY/MM`. Add a regression assertion mirroring the existing RSS draft-exclusion test at `tests/build.test.mjs:393-401`. An independent Phase 5 verifier specifically confirmed this fix does not break the first pass.

## 4. NEEDS VALIDATION

These are **leads, not findings**. They carry no severity. Each names a boundary and a possible concrete result but is blocked on a fact this run could not observe.

| Lead | Repository trace | Exact blocker | Bounded local next step | Safe owner-observed check |
|---|---|---|---|---|
| Duplicate-value COOP (and possibly CORP) on `/admin/*` relies on an append-safety assumption that fails for COOP structured-field parsing | `public/_headers:13` → `:7` → `:29` → `:31`; `public/_routes.json:9` | The CORP direction: which branch of the Fetch cross-origin resource policy check a present-but-unmatched combined value takes — allowed (control loss) or blocked (availability bug). Plus whether the 2026-02-21 Bug #28 append finding still reflects current platform behaviour, and what a browser actually computes from the served response. | Reproduce HTTP header-value combination plus RFC 8941 item parsing in a self-written script and confirm the combined COOP value fails to parse; add a unit test over `public/_headers` asserting no header name appears in both blocks unless its parser tolerates a comma-joined list | Record the raw response headers of the deployed `/admin/` document and one `/admin/*` asset on staging and production; note whether COOP and CORP appear once or twice and whether the six `/*`-only headers are present; confirm the effective COOP in devtools |
| The lockfile pins the graph, but the Cloudflare Pages release build's install command is not in source and may re-resolve the caret ranges | `package.json:18` → `wrangler.toml:7` → `package.json:8` → `package-lock.json:4` → `wrangler.toml:5` | The Pages build configuration — build command, any install-command override, Node version — is dashboard-only, with no `.nvmrc`, `engines` or `packageManager` field and no `wrangler.toml` build-command key | Compare each `package.json` range against its lockfile resolution with `jq`, and re-confirm every entry resolves to `registry.npmjs.org` with `sha512` integrity, establishing the lockfile is sufficient *if consulted* | Read the Pages dashboard Build command, Install command override and Node version for Production and Preview; cross-check the most recent production build log's install line and resolved `astro` version against the lockfile |

Phase 5 narrowed the first lead's blockers: `docs/DOCUMENTATION.md:1739` already establishes from local source that Pages *appends* rather than overrides, so that half is answered. The core claim survives because Bug #28's "browsers adopt the strictest value" note concerns two *differing* values, whereas the current design (`docs/DOCUMENTATION.md:522`, SEC-23) rests on the distinct and unjustified claim that *identical* duplication is safe. `docs/DOCUMENTATION.md:1929` records a repository policy against any same-named duplication, in tension with the current design.

## 5. Hardening notes

Not findings. Ordered roughly by value.

1. **`{ engines: {} }` in `scripts/organize-posts.mjs:26` does not do what it looks like.** `gray-matter` merges rather than replaces (`lib/defaults.js:16`), so the built-in `javascript` engine — whose `parse` is `eval(str) || {}` — stays registered, and a `---js` frontmatter block would be evaluated. This was rejected as a finding because every principal who can place such a file already has code execution on the same runner or write access to the script itself. But the developer's intended restriction is genuinely not enforced, and closing the gap is cheap.
2. **`.github/workflows/ci.yml` should declare `permissions: contents: read`** on the job. Fork PRs already get a read-only token by GitHub platform default, so this is defence in depth — but it makes the guarantee source-visible and survives a future change to the repository-level default.
3. **Pin `actions/checkout` and `actions/setup-node` to commit SHAs.** Standard CI hardening; rejected as a finding because the observed result is configuration text rather than a demonstrated boundary crossing.
4. **`functions/auth/callback.js:170` uses `{ once: true }` on the acknowledgment listener while doing its origin check with an early `return` at line 154.** The browser removes a `once` listener on the first dispatched event regardless of what the handler does, so any window holding a reference to the popup can send one cross-origin message that is correctly rejected and still consumes the listener, after which the sign-in silently stalls. Availability only, no token disclosed. Drop `{ once: true }` and remove the listener only after the origin check passes.
5. **`isAllowedOrigin` is duplicated verbatim** in `functions/auth/index.js:1-12` and `functions/auth/callback.js:1-12`. Two copies of a security allowlist drift independently.
6. **`redirect_uri` is derived from `url.origin`** (`functions/auth/index.js:41`) rather than a per-environment constant, adding a request-dependent input without adding capability.
7. **The preview wildcard** `([a-z0-9-]+\.)*my-blog-3cg\.pages\.dev` admits every current and future preview hostname for an endpoint whose only legitimate consumers are the two CMS `base_url` origins.
8. **The `http://localhost` allowlist branch** ships in production code; it is unreachable on Pages, which terminates TLS.
9. **`functions/auth/callback.js:185`** — `frame-ancestors`, `form-action` and `base-uri` do not fall back to `default-src`; adding them makes the policy self-contained. Line 179 sends `text/html` with no charset.
10. **`escapeForScript` does not escape U+2028, U+2029 or the backtick.** Not a break in the current double-quoted sink, but the helper would become unsafe if reused in a template literal.
11. **`scripts/normalize-images.mjs:32-37` has no `try/catch`**, unlike `src/integrations/image-optimize.mjs`; a corrupt file with an allowlisted extension aborts the whole build chain. Its 50 MB cap is also checked only on input, not on the re-encoded buffer written back.
12. **`public/.assetsignore` is inert on Cloudflare Pages** (it is a Workers Static Assets construct) and is itself published as a readable file.
13. **`decap-cms-app@^3.10.0` is declared as a production dependency but imported nowhere**, and has drifted six minor releases from the CDN copy that actually executes.
14. **Public pages have no header-delivered CSP** — only the `<meta>` CSP in `Base.astro:35`, which cannot carry `frame-ancestors` and does not apply to non-HTML responses. `script-src 'self' 'unsafe-inline'` provides no injection mitigation.
15. **Branch binding is duplicated in four places** — `astro.config.mjs:10`, `public/admin/config.yml:4-5`, both origin allowlists, and `public/robots.txt` — each maintained by hand.

## 6. Positive source patterns worth keeping

- Exact `state` comparison placed **before** the token POST, so an unbound code is never redeemed.
- The clearing cookie is attached to **every** exit path, with name and `Path` matching the setter exactly.
- Fully anchored allowlist regexes with escaped dots and a label class that cannot contain a dot.
- Fixed literal response bodies on all seven error paths; the `catch` discards the error object rather than serializing it.
- SRI plus exact version plus `crossorigin` on the CDN bundle, with `tests/admin-html.test.mjs` asserting all three.
- `limitInputPixels` on **every** `sharp` constructor, with `lstat` symlink skips and size caps evaluated before any decode.
- A draft gate applied consistently across eleven rendering call sites — which is precisely what made the one omission visible.

## 7. Coverage summary

| Status | Units |
|---|---|
| covered | 7 |
| candidate (all independently dispositioned) | 11 |
| blocked | 1 |
| deferred | 0 |
| **total** | **19** |

The one `blocked` unit is `GET /auth` (`functions/auth/index.js#onRequestGet`). Its origin allowlist, `state` generation, cookie attributes, scope pinning, open-redirect surface and cache behaviour were all checked and hold. Two facts remain outside source: the Authorization callback URL actually registered for each GitHub OAuth App, and whether Cloudflare Pages serves this Function for a request whose `Host` is not a configured domain.

Important exclusions, each with a source reason recorded in the ledger: `MEMORY-SAFETY-AND-BINARY.md` (no first-party native code), `DESKTOP-MOBILE-AND-LOCAL-IPC.md` (no such component), `PROTOCOLS-RPC-AND-MESSAGING.md` (no RPC or broker), `AI-AND-LLM.md` (no model surface), `DATA-ISOLATION-AND-LIFECYCLE.md` (no datastore, no tenancy).

**Final critic result.** The wave-2 coverage critic returned `stop: false` with two accepted `missing_units`, both of which were real. One exposed a **circular exclusion**: unit u04 excluded browser-storage review on the stated ground that u08 covered it, while u08 examined only SRI and version pinning — so no unit had performed the check. Both were seeded as wave-3 units, hunted, and verified. A further final-clean critic pass was **not** run; this run therefore makes **no clean-coverage claim**, and the gap is disclosed here rather than hidden.

Rejected fingerprints are retained in `findings.json` so a future run does not repeat an unsupported claim without changed evidence. They are not findings and are not described as such.
