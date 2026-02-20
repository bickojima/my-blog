# tbiのブログ テスト計画書・テストケース一覧

## 改訂履歴

| 版数 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-02-15 | 初版作成 |
| 1.1 | 2026-02-15 | JTCテスト計画書体系に再構成、テスト手法を追加 |
| 1.2 | 2026-02-15 | テスト手法の実装詳細を追記、E2Eテスト提案を追加、テスト実行結果を追記 |
| 1.3 | 2026-02-15 | Playwright E2Eテスト実装（PC/iPad/iPhone 3デバイス×30テスト=90テスト）、テスト実行結果を更新 |
| 1.4 | 2026-02-15 | admin-htmlテスト更新（ドロップダウンボトムシート化・EXIF修正に対応）、テスト実行結果を更新（237テスト全PASS） |
| 1.5 | 2026-02-15 | admin-htmlテストに本番サイトリンク検証を追加（CMS-11対応） |
| 1.6 | 2026-02-15 | Slate codeblockクラッシュ対策テスト追加（void node CSS、エラーハンドラ、デバウンス、touchmove除外）、172テスト全PASS |

## テスト基盤の変更履歴

| 時期 | 主な変更 | 関連PR |
| :--- | :--- | :--- |
| 2026-02-14 | **自動テスト基盤構築**: Vitest導入、設定検証・コンテンツ検証・機能テスト・統合テスト計151テストケースを実装 | #40 |
| 2026-02-15 | **テスト拡充・ドキュメント改訂**: サムネイル画像実在チェック追加、Netlify Identity非含有検証追加、リグレッションテスト実施。テスト計画書をJTC体系に全面書き直し。計227テストケース | #80 |
| 2026-02-15 | **テスト更新**: admin-htmlテストをドロップダウンボトムシート化・EXIF fixPreviewImageOrientation削除に対応、ドロップダウンオーバーレイ管理テスト追加。計237テスト | - |

---

## 目次

### 第1部 テスト計画書

1. [テスト目的](#1-テスト目的)
2. [テスト対象・範囲](#2-テスト対象範囲)
3. [テスト環境](#3-テスト環境)
4. [テスト手法](#4-テスト手法)
5. [テスト分類と戦略](#5-テスト分類と戦略)
6. [開始基準・終了基準](#6-開始基準終了基準)

### 第2部 テストケース一覧

7. [コンテンツ検証](#7-コンテンツ検証)
8. [rehype-image-caption プラグイン](#8-rehype-image-caption-プラグイン)
9. [OAuth認証関数](#9-oauth認証関数)
10. [CMS設定検証](#10-cms設定検証)
11. [ビルド検証](#11-ビルド検証)
12. [管理画面HTML検証](#12-管理画面html検証)

### 第3部 要件トレーサビリティ

13. [要件トレーサビリティマトリクス](#13-要件トレーサビリティマトリクス)

### 第4部 テスト実行

14. [動的操作テスト（E2E）の検討](#14-動的操作テストe2eの検討)
15. [実行手順](#15-実行手順)
16. [テスト実行結果](#16-テスト実行結果)

---

# 第1部 テスト計画書

---

## 1. テスト目的

### 1.1 目的

本テストは、「CMS で記事を編集 → ビルド → 閲覧」のフロー全体が正常に動作することを保証するものである。具体的には以下の品質特性を検証する。

| 品質特性 | 検証内容 |
| :--- | :--- |
| 機能適合性 | 記事管理、URL生成、タグ分類、画像処理等の機能が仕様通りに動作する |
| 信頼性 | ビルド成果物に必要なファイルがすべて生成される |
| 保守性 | 廃止済み機能（カテゴリ、Netlify Identity）の残存がない |
| 互換性 | CMS設定とコンテンツスキーマの整合性が保たれている |
| セキュリティ | OAuth認証のエラーハンドリングが適切である |

### 1.2 前提条件

- 要件定義は `DOCUMENTATION.md` 第1部（第2章〜第4章）に定義された FR/CMS/NFR 要件に基づく
- テスト対象は自動テストで検証可能な範囲に限定する（CMS管理画面の操作テストは対象外）

---

## 2. テスト対象・範囲

### 2.1 テスト対象

| 対象 | ファイル | テスト種別 |
| :--- | :--- | :--- |
| コンテンツ（記事Markdown） | `src/content/posts/**/*.md` | コンテンツ検証 |
| CMS設定 | `public/admin/config.yml` | 設定検証 |
| 管理画面HTML | `public/admin/index.html` | 設定検証 |
| 画像キャプションプラグイン | `src/plugins/rehype-image-caption.mjs` | 単体テスト |
| OAuth認証関数 | `functions/auth/index.js`, `callback.js` | 単体テスト |
| ビルド成果物 | `dist/` | 統合テスト |
| 画像処理スクリプト | `src/integrations/image-optimize.mjs` | コード検証 |
| 画像正規化スクリプト | `scripts/normalize-images.mjs` | コード検証（間接） |
| 共通レイアウト | `src/layouts/Base.astro` | コード検証 |

### 2.2 テスト対象外

| 対象 | 対象外理由 |
| :--- | :--- |
| CMS管理画面の操作（ブラウザ操作） | E2Eテスト環境が未導入であるため |
| Cloudflare Pages デプロイ | クラウド環境への自動テストが不可であるため |
| GitHub OAuth連携（実際のGitHub API呼び出し） | モック関数で代替しているため |
| url-map.json生成（FR-10） | CMSランタイムでのみ使用される動的機能であるため |

---

## 3. テスト環境

### 3.1 実行環境

| 項目 | 内容 |
| :--- | :--- |
| テストフレームワーク | Vitest v4.0.18 |
| テストランナー | `vitest run`（CI）/ `vitest`（ウォッチ） |
| Node.js | v18以上 |
| OS | macOS / Linux（Cloudflare Pages ビルド環境） |

### 3.2 テストファイル構成

```
tests/
├── content-validation.test.mjs   # コンテンツ検証（動的展開: 記事数×項目数）
├── rehype-image-caption.test.mjs # プラグイン単体テスト
├── auth-functions.test.mjs       # 認証関数単体テスト
├── cms-config.test.mjs           # CMS設定検証
├── build.test.mjs                # 統合テスト（ビルド実行後）
└── admin-html.test.mjs           # 管理画面HTML検証
```

---

## 4. テスト手法

本プロジェクトで採用するテスト手法を以下に定義する。各テストケースには適用するテスト手法を明記する。

### 4.1 テスト手法一覧

| ID | テスト手法 | 概要 | 適用場面 |
| :--- | :--- | :--- | :--- |
| M-01 | ファイル構造検証 | ファイル・ディレクトリの存在、配置パス、拡張子を検証する | ビルド成果物、記事ファイル配置 |
| M-02 | 文字列パターンマッチング | ファイル内容に対して正規表現または部分文字列の含有・非含有を検証する | HTML品質、CSS/JS存在確認 |
| M-03 | YAML/Frontmatterパース検証 | YAML形式のファイルをパースし、キー・値・型の正当性を検証する | CMS設定、記事frontmatter |
| M-04 | スキーマ検証 | フィールドの型（string, boolean, array等）、必須/任意、デフォルト値を検証する | frontmatter、CMS設定フィールド |
| M-05 | AST（抽象構文木）変換テスト | rehype/remarkプラグインにHTML ASTを入力し、変換結果のノード構造を検証する | rehype-image-caption |
| M-06 | HTTPレスポンス検証 | 関数にリクエストオブジェクトを入力し、ステータスコード・ヘッダー・ボディを検証する | OAuth認証関数 |
| M-07 | モック置換テスト | 外部API呼び出し（fetch等）をモック関数に置換し、内部ロジックの正当性を検証する | OAuth callback（GitHub API） |
| M-08 | ネガティブテスト | 異常系入力（パラメータ欠損、認証情報未設定等）に対するエラーハンドリングを検証する | OAuth認証関数 |
| M-09 | 回帰テスト（廃止機能確認） | 廃止済み機能（カテゴリ、Netlify Identity等）の残存がないことを検証する | ビルド成果物、記事frontmatter |
| M-10 | バイナリファイル検証 | 画像ファイルのEXIFメタデータ（orientation）やピクセルサイズを検証する | アップロード画像、ビルド後画像 |
| M-11 | ソースコード静的検証 | ソースコードの文字列を読み取り、特定のAPI呼び出しや設定値の存在を検証する | image-optimize.mjs, Base.astro |
| M-12 | エンドツーエンドビルド検証 | `npm run build`を実行し、パイプライン全体（前処理→ビルド→後処理）の出力を検証する | ビルド統合テスト |

### 4.2 テスト手法の実装詳細

各テスト手法が実際にどのように実装されているかを、使用ライブラリとコード例で示す。

#### M-01 ファイル構造検証

ファイルシステムAPI（`fs`）を使用し、ファイル・ディレクトリの存在と配置パスを検証する。

```javascript
// 使用ライブラリ: fs, path
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

// ファイル存在確認
expect(existsSync(join('dist', 'index.html'))).toBe(true);

// ディレクトリ走査による記事ファイル配置確認
const files = readdirSync(postsDir, { recursive: true });
const mdFiles = files.filter(f => f.endsWith('.md'));
expect(mdFiles.length).toBeGreaterThan(0);

// パスパターンの検証（yyyy/mm/ 形式）
const relativePath = path.relative(postsDir, filePath);
expect(relativePath).toMatch(/^\d{4}\/\d{2}\//);
```

#### M-02 文字列パターンマッチング

ファイル内容を文字列として読み込み、`toContain()` または `toMatch()` で特定パターンの含有・非含有を検証する。

```javascript
// 使用ライブラリ: fs
const html = readFileSync('dist/index.html', 'utf-8');

// 部分文字列の含有確認
expect(html).toContain('lang="ja"');
expect(html).toContain('<meta name="viewport"');

// 正規表現マッチング
expect(html).toMatch(/<!doctype html>/i);

// 廃止機能の非含有確認（ネガティブ）
expect(html).not.toContain('identity.netlify.com');
expect(html).not.toContain('netlifyIdentity');
```

#### M-03 YAML/Frontmatterパース検証

`gray-matter`ライブラリでMarkdownのfrontmatterをパースし、`js-yaml`でYAMLファイルをパースして構造を検証する。

```javascript
// 使用ライブラリ: gray-matter (frontmatter), js-yaml (YAML設定)
import matter from 'gray-matter';
import yaml from 'js-yaml';

// frontmatterパース
const raw = readFileSync(mdFilePath, 'utf-8');
const { data, content } = matter(raw);
expect(data.title).toBeDefined();
expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

// YAML設定パース
const configRaw = readFileSync('public/admin/config.yml', 'utf-8');
const config = yaml.load(configRaw);
expect(config.backend.name).toBe('github');
```

#### M-04 スキーマ検証

パース済みデータの各フィールドに対して、JavaScriptの`typeof`演算子や`Array.isArray()`でデータ型を検証する。

```javascript
// 型検証
expect(typeof data.title).toBe('string');
expect(typeof data.draft).toBe('boolean');
expect(Array.isArray(data.tags)).toBe(true);

// 各要素の検証（配列内の全要素が非空文字列であること）
data.tags.forEach(tag => {
  expect(typeof tag).toBe('string');
  expect(tag.length).toBeGreaterThan(0);
});
```

#### M-05 AST（抽象構文木）変換テスト

テスト用のHAST（HTML Abstract Syntax Tree）ノードをヘルパー関数で構築し、プラグインを適用して変換結果を検証する。

```javascript
// HAST（HTML AST）ノードの構築
function makeImgNode(props) {
  return { type: 'element', tagName: 'img', properties: props, children: [] };
}
function makeTree(bodyChildren) {
  return {
    type: 'root',
    children: [{ type: 'element', tagName: 'body', children: bodyChildren }]
  };
}

// プラグイン適用・検証
const img = makeImgNode({ src: '/test.jpg', title: '説明文' });
const tree = makeTree([{ type: 'element', tagName: 'p', children: [img] }]);
plugin()(tree);  // プラグイン実行

// 変換後のノード構造を検証
const figure = tree.children[0].children[0];
expect(figure.tagName).toBe('figure');
expect(figure.children[1].tagName).toBe('figcaption');
expect(figure.children[1].children[0].value).toBe('説明文');
```

#### M-06 / M-07 / M-08 HTTPレスポンス検証・モック置換・ネガティブテスト

Cloudflare Functionsのリクエスト/レスポンスをモック化し、正常系と異常系の両方を検証する。

```javascript
// Cloudflare Functions互換のコンテキスト構築
function createContext(url, env = {}) {
  return { request: new Request(url), env };
}

// 正常系: HTTPレスポンス検証 (M-06)
const ctx = createContext('https://reiwa.casa/auth', {
  OAUTH_CLIENT_ID: 'test-id'
});
const response = await onRequest(ctx);
expect(response.status).toBe(302);
expect(response.headers.get('location')).toContain('github.com/login/oauth');

// 異常系: ネガティブテスト (M-08)
const ctx2 = createContext('https://reiwa.casa/auth', {}); // 環境変数なし
const response2 = await onRequest(ctx2);
expect(response2.status).toBe(500);

// モック置換テスト (M-07): globalThis.fetch をモック化
const mockFetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ access_token: 'mock-token' })
});
globalThis.fetch = mockFetch;
try {
  const response3 = await callbackHandler(ctx3);
  expect(response3.status).toBe(200);
  // モック呼び出しの検証
  expect(mockFetch).toHaveBeenCalledWith(
    'https://github.com/login/oauth/access_token',
    expect.objectContaining({ method: 'POST' })
  );
} finally {
  globalThis.fetch = originalFetch; // 復元
}
```

#### M-10 バイナリファイル検証

`sharp`ライブラリで画像ファイルのメタデータ（EXIFデータ、ピクセルサイズ）を読み取り検証する。

```javascript
// 使用ライブラリ: sharp（動的import）
const sharp = (await import('sharp')).default;

// EXIF orientation検証
const metadata = await sharp(imagePath).metadata();
const orientation = metadata.orientation || 1;
expect(orientation).toBe(1);  // 1 = 正位置（回転済み）

// ピクセルサイズ検証
expect(metadata.width).toBeLessThanOrEqual(1200);  // MAX_WIDTH
```

#### M-12 エンドツーエンドビルド検証

`child_process.execSync()`でビルドコマンドを実行し、パイプライン全体の出力を検証する。

```javascript
// 使用ライブラリ: child_process
import { execSync } from 'child_process';

// ビルド実行（beforeAllで1回のみ）
beforeAll(() => {
  execSync('npm run build', {
    cwd: projectRoot,
    timeout: 120000,  // 2分タイムアウト
    stdio: 'pipe'
  });
}, 180000);  // Vitestのテストタイムアウト: 3分

// ビルド後のdistディレクトリを検証
expect(existsSync(join(projectRoot, 'dist'))).toBe(true);
```

### 4.3 テスト手法の適用マトリクス

```
テストファイル                    M-01  M-02  M-03  M-04  M-05  M-06  M-07  M-08  M-09  M-10  M-11  M-12
─────────────────────────────  ────  ────  ────  ────  ────  ────  ────  ────  ────  ────  ────  ────
content-validation.test.mjs      ●     -     ●     ●     -     -     -     -     ●     ●     ●     -
rehype-image-caption.test.mjs    -     -     -     -     ●     -     -     -     -     -     -     -
auth-functions.test.mjs          -     -     -     -     -     ●     ●     ●     -     -     -     -
cms-config.test.mjs              -     -     ●     ●     -     -     -     -     ●     -     -     -
build.test.mjs                   ●     ●     -     -     -     -     -     -     ●     ●     -     ●
admin-html.test.mjs              -     ●     -     -     -     -     -     -     -     -     -     -
```

---

## 5. テスト分類と戦略

### 5.1 テストレベル

```
┌──────────────────────────────────────────────────────────────┐
│                       テストピラミッド                         │
│                                                              │
│                    ┌──────────┐                              │
│                    │ 統合テスト │  build.test.mjs              │
│                    │ (ビルド)  │  ビルドパイプライン全体の       │
│                    │          │  エンドツーエンド検証            │
│                 ┌──┴──────────┴──┐                           │
│                 │  単体テスト      │  rehype-image-caption      │
│                 │ (関数・プラグイン)│  auth-functions            │
│              ┌──┴────────────────┴──┐                        │
│              │ 設定・コンテンツ検証    │  cms-config              │
│              │ (静的解析)            │  admin-html              │
│              │                      │  content-validation       │
│              └──────────────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 テスト分類と対応手法

| テストレベル | 目的 | テストファイル | 主なテスト手法 |
| :--- | :--- | :--- | :--- |
| 設定・コンテンツ検証 | CMS設定・管理画面HTML・記事ファイルの正当性を静的に検証する | `cms-config.test.mjs`, `admin-html.test.mjs`, `content-validation.test.mjs` | M-02, M-03, M-04, M-09, M-10, M-11 |
| 単体テスト | プラグイン・認証関数を入力/出力で個別検証する | `rehype-image-caption.test.mjs`, `auth-functions.test.mjs` | M-05, M-06, M-07, M-08 |
| 統合テスト | ビルドパイプライン全体を実行し成果物を検証する | `build.test.mjs` | M-01, M-02, M-09, M-10, M-12 |

### 5.3 テスト実行タイミング

| タイミング | コマンド | 目的 | 対象テスト |
| :--- | :--- | :--- | :--- |
| 開発中 | `npm run test:watch` | ファイル変更時に自動再実行 | 全テスト |
| デプロイ前 | `npm test` | 全テスト合格を確認 | 全テスト |
| 記事編集後 | `npx vitest run tests/content-validation.test.mjs` | frontmatter不備の即時検出 | コンテンツ検証のみ |

---

## 6. 開始基準・終了基準

### 6.1 テスト開始基準

| No. | 基準 |
| :--- | :--- |
| 1 | `npm install` が正常に完了していること |
| 2 | テストフレームワーク（Vitest）がインストールされていること |
| 3 | テスト対象のソースコード・設定ファイルが存在すること |

### 6.2 テスト終了基準

| No. | 基準 |
| :--- | :--- |
| 1 | 全テストケース（237件）がPASSであること |
| 2 | `npm run build` が正常に完了すること |
| 3 | 要件トレーサビリティマトリクス（第13章）において、FR-10を除く全要件が「充足」であること |

### 6.3 合否判定基準

| 判定 | 条件 |
| :--- | :--- |
| 合格 | 全テストケースがPASSであり、ビルドが正常に完了する |
| 不合格 | 1件以上のテストケースがFAILである、またはビルドが異常終了する |

---

# 第2部 テストケース一覧

各テストケースには以下の情報を付与する。

| 項目 | 説明 |
| :--- | :--- |
| No. | テストケース番号（テストファイル内での連番） |
| テストケース | 検証内容 |
| テスト手法 | 第4章で定義したテスト手法ID |
| 期待結果 | テスト合格時の期待値 |

---

## 7. コンテンツ検証 (`content-validation.test.mjs`)

記事ファイル（Markdown）のfrontmatterと構造を検証する。テストケースNo.2〜11は記事数分だけ動的に展開される。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 記事ファイルが1つ以上存在する | M-01 | `src/content/posts/`に`.md`ファイルが1件以上存在する |
| 2 | フロントマターが正しくパースできる | M-03 | gray-matterで例外なくパースできる |
| 3 | title（タイトル）が文字列で存在する | M-04 | `typeof title === 'string'` かつ空でない |
| 4 | date（日付）がYYYY-MM-DD形式である | M-04 | `/^\d{4}-\d{2}-\d{2}$/` にマッチする |
| 5 | draft（下書き）がboolean型である | M-04 | `typeof draft === 'boolean'`（未指定時はundefined許容） |
| 6 | categoryフィールドが存在しない | M-09 | `category` キーが frontmatter に含まれない |
| 7 | ファイルがyyyy/mm/ディレクトリに配置されている | M-01 | パスが `posts/YYYY/MM/` パターンに合致する |
| 8 | ファイルのディレクトリがfrontmatterの日付と一致する | M-01, M-03 | ディレクトリの年月がfrontmatterの`date`と一致する |
| 9 | tags（タグ）が配列で各要素が空でない文字列である | M-04 | 配列かつ各要素が非空文字列（tags未指定時はスキップ） |
| 10 | thumbnailが/images/で始まるパスであり画像ファイルが実在する | M-01, M-04 | パスが`/images/`始まり、かつ`public/`配下に実ファイルが存在する |
| 11 | 本文が空でない | M-04 | frontmatter除去後のMarkdown本文が空でない |
| 12 | ソース画像にEXIF回転が残っていない | M-10 | 全アップロード画像のEXIF orientationが1（正位置）または未定義である |
| 13 | image-optimize.mjs で .rotate() が呼ばれている | M-11 | ソースコード内に`.rotate()`呼び出しが存在する |
| 14 | image-optimize.mjs でEXIF orientationによる幅の補正がある | M-11 | ソースコード内にorientation≥5による幅高さ入替処理が存在する |
| 15 | Base.astro に image-orientation: from-image が設定されている | M-11 | ソースコード内に`image-orientation: from-image`が存在する |

---

## 8. rehype-image-caption プラグイン (`rehype-image-caption.test.mjs`) — 8件

プラグイン関数にrehype AST（HAST）を入力し、変換後のノード構造を検証する。

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | img要素にloading="lazy"とdecoding="async"が自動追加される | M-05 | 変換後ASTのimg要素に`loading="lazy"`, `decoding="async"`が付与される |
| 2 | 既存のloading属性は上書きしない | M-05 | `loading="eager"`のimgが変換後も`loading="eager"`のままである |
| 3 | 既存のdecoding属性は上書きしない | M-05 | `decoding="sync"`のimgが変換後も`decoding="sync"`のままである |
| 4 | title属性を持つimgがfigure+figcaptionに変換される | M-05 | `<img title="X">`が`<figure><img><figcaption>X</figcaption></figure>`になる |
| 5 | title属性がないimgはfigureに変換されない | M-05 | title未指定のimgはそのまま（figure未生成） |
| 6 | 既にfigure内にあるimgは二重変換されない | M-05 | 親がfigureのimgは変換をスキップする |
| 7 | 日本語のtitleが正しくキャプションになる | M-05 | `title="日本語テスト"`がfigcaptionの内容として正しく出力される |
| 8 | 複数のimg要素がそれぞれ正しく処理される | M-05 | 文書内の全img要素が個別に正しく変換される |

---

## 9. OAuth認証関数 (`auth-functions.test.mjs`) — 10件

Cloudflare Functions の認証エンドポイントに対し、モックリクエストを入力してレスポンスを検証する。

| No. | テストケース | エンドポイント | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | OAUTH_CLIENT_ID設定時、GitHubへリダイレクトされる | /auth | M-06 | ステータス302、LocationヘッダーがGitHub認可URLを指す |
| 2 | リダイレクトURIにコールバックパスが含まれる | /auth | M-06 | Locationヘッダーのredirect_uriに`/auth/callback`が含まれる |
| 3 | OAUTH_CLIENT_ID未設定時、500エラーを返す | /auth | M-06, M-08 | ステータス500、エラーメッセージ含む |
| 4 | 異なるオリジンでも正しいコールバックURLが生成される | /auth | M-06 | リクエストオリジンに対応したcallback URLが生成される |
| 5 | codeパラメータなしで400エラーを返す | /auth/callback | M-06, M-08 | ステータス400 |
| 6 | OAuth資格情報未設定で500エラーを返す | /auth/callback | M-06, M-08 | ステータス500 |
| 7 | CLIENT_IDのみ設定（SECRET未設定）で500エラーを返す | /auth/callback | M-06, M-08 | ステータス500 |
| 8 | GitHub APIエラー時に400エラーを返す | /auth/callback | M-06, M-07, M-08 | fetchモックがエラーを返した際にステータス400 |
| 9 | 成功時にDecap CMSハンドシェイクHTMLを返す | /auth/callback | M-06, M-07 | ステータス200、HTMLにpostMessageハンドシェイクコードが含まれる |
| 10 | GitHubへのリクエストパラメータが正しい | /auth/callback | M-07 | fetchモックに渡されたURLとbodyが仕様通りである |

---

## 10. CMS設定検証 (`cms-config.test.mjs`) — 27件

`public/admin/config.yml`をパースし、設定値の正当性を検証する。

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | GitHubバックエンドが設定されている | バックエンド | M-03 | `backend.name === "github"` |
| 2 | リポジトリが正しく設定されている | バックエンド | M-03 | `backend.repo === "bickojima/my-blog"` |
| 3 | ブランチがmainに設定されている | バックエンド | M-03 | `backend.branch === "main"` |
| 4 | 認証エンドポイントが設定されている | バックエンド | M-03 | `backend.auth_endpoint` が定義されている |
| 5 | base_urlが本番URLに設定されている | バックエンド | M-03 | `backend.base_url === "https://reiwa.casa"` |
| 6 | メディアフォルダがpublic配下に設定されている | メディア | M-03 | `media_folder`に`public`が含まれる |
| 7 | 公開フォルダパスが正しい | メディア | M-03 | `public_folder === "/images/uploads"` |
| 8 | 日本語ロケールが設定されている | ロケール | M-03 | `locale === "ja"` |
| 9 | Unicode対応のスラッグエンコーディングが設定されている | スラッグ | M-03 | `slug.encoding === "unicode"` |
| 10 | アクセント文字のクリーニングが無効である | スラッグ | M-03 | `slug.clean_accents === false` |
| 11 | コレクションが1つ（posts）定義されている | コレクション | M-03, M-04 | `collections.length === 1` かつ `name === "posts"` |
| 12 | フォルダが正しいパスに設定されている | posts | M-03 | `folder === "src/content/posts"` |
| 13 | 新規作成が有効になっている | posts | M-03 | `create === true` |
| 14 | 拡張子がmdに設定されている | posts | M-03 | `extension === "md"` |
| 15 | フォーマットがfrontmatterに設定されている | posts | M-03 | `format === "frontmatter"` |
| 16 | pathプロパティに年月パスが含まれている | posts | M-03, M-02 | `path`に`{{year}}/{{month}}`が含まれる |
| 17 | slugがファイル名部分のみに設定されている | posts | M-03, M-02 | `slug === "{{slug}}"` |
| 18 | サマリー表示に日付とタイトルが含まれている | posts | M-03, M-02 | `summary`に日付とタイトルのテンプレート変数が含まれる |
| 19 | 必須フィールドがすべて定義されている | フィールド | M-04 | `title`, `date`, `body` が`fields`に存在する |
| 20 | categoryフィールドが存在しない | フィールド | M-04, M-09 | `fields`に`category`が含まれない |
| 21 | オプションフィールドが定義されている | フィールド | M-04 | `draft`, `tags`, `thumbnail`が`fields`に存在する |
| 22 | titleフィールドがstringウィジェットである | フィールド | M-04 | `widget === "string"` |
| 23 | dateフィールドがdatetimeウィジェットでYYYY-MM-DD形式である | フィールド | M-04 | `widget === "datetime"`, `format === "YYYY-MM-DD"` |
| 24 | draftフィールドがbooleanウィジェットでデフォルトfalseである | フィールド | M-04 | `widget === "boolean"`, `default === false` |
| 25 | tagsフィールドがlistウィジェットでオプションである | フィールド | M-04 | `widget === "list"`, `required === false` |
| 26 | thumbnailフィールドがimageウィジェットでオプションである | フィールド | M-04 | `widget === "image"`, `required === false` |
| 27 | bodyフィールドがmarkdownウィジェットである | フィールド | M-04 | `widget === "markdown"` |

---

## 11. ビルド検証 (`build.test.mjs`) — 31件

`npm run build`を実行し、パイプライン全体（normalize-images → organize-posts → astro build → image-optimize）の出力を検証する。全テストケースはビルド完了後に実行される。

| No. | テストケース | カテゴリ | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | distディレクトリが生成される | 成果物 | M-01, M-12 | `dist/`ディレクトリが存在する |
| 2 | トップページが生成される | 成果物 | M-01, M-12 | `dist/index.html`が存在する |
| 3 | 管理画面がコピーされる | 成果物 | M-01 | `dist/admin/index.html`が存在する |
| 4 | CMS設定がコピーされる | 成果物 | M-01 | `dist/admin/config.yml`が存在する |
| 5 | faviconファイルが存在する | 成果物 | M-01 | `dist/favicon.*`が存在する |
| 6 | robots.txtが存在する | 成果物 | M-01 | `dist/robots.txt`が存在する |
| 7 | _headersファイルが存在する | 成果物 | M-01 | `dist/_headers`が存在する |
| 8 | _redirectsファイルが存在する | 成果物 | M-01 | `dist/_redirects`が存在する |
| 9 | 公開記事のページが生成されている | 記事 | M-01, M-12 | 公開記事数分のHTMLが`dist/posts/`に生成される |
| 10 | 記事ページがyyyy/mm/記事名の構造である | 記事 | M-01 | `dist/posts/YYYY/MM/記事名/index.html`のパターンに合致する |
| 11 | 年別アーカイブページが生成される | アーカイブ | M-01 | `dist/posts/YYYY/index.html`が存在する |
| 12 | 月別アーカイブページが生成される | アーカイブ | M-01 | `dist/posts/YYYY/MM/index.html`が存在する |
| 13 | カテゴリページが生成されていない | アーカイブ | M-01, M-09 | `dist/categories/`が存在しない |
| 14 | タグページディレクトリが生成される | タグ | M-01 | `dist/tags/*/index.html`が存在する |
| 15 | HTML5 doctype宣言がある | HTML品質 | M-02 | `<!DOCTYPE html>`（大文字小文字不問）が含まれる |
| 16 | lang="ja"が設定されている | HTML品質 | M-02 | `<html`タグに`lang="ja"`が含まれる |
| 17 | viewportメタタグが設定されている | HTML品質 | M-02 | `<meta name="viewport"`が含まれる |
| 18 | サイトタイトルが含まれている | コンテンツ | M-02 | `<title>`にサイトタイトルが含まれる |
| 19 | 「記事一覧」見出しが含まれている | コンテンツ | M-02 | HTMLに「記事一覧」を含む見出し要素が存在する |
| 20 | 管理画面へのリンクがフッターにある | ナビゲーション | M-02 | `href="/admin"`を含むリンクが存在する |
| 21 | 公開記事へのリンクが含まれている | ナビゲーション | M-02 | `href="/posts/`を含むリンクが存在する |
| 22 | カテゴリリンクが含まれていない | ナビゲーション | M-02, M-09 | `href="/categories/`を含むリンクが存在しない |
| 23 | タグリンクが含まれている | ナビゲーション | M-02 | `href="/tags/`を含むリンクが存在する |
| 24 | アーカイブナビゲーションが含まれている | ナビゲーション | M-02 | ArchiveNavコンポーネントの出力が含まれる |
| 25 | copyright表記がある | フッター | M-02 | `©`またはcopyright文字列が含まれる |
| 26 | Netlify Identityスクリプトが含まれていない | セキュリティ | M-02, M-09 | `identity.netlify.com`および`netlifyIdentity`が含まれない |
| 27 | 記事ページに「記事一覧に戻る」リンクがある | ナビゲーション | M-02 | 記事HTMLに「記事一覧に戻る」テキストを含むリンクが存在する |
| 28 | アップロード画像ディレクトリが存在する | 画像 | M-01 | `dist/images/uploads/`が存在する |
| 29 | ビルド後の画像にEXIF回転が残っていない | 画像 | M-10, M-12 | 全画像のEXIF orientationが1または未定義である |
| 30 | ビルド後の画像がMAX_WIDTH以下にリサイズされている | 画像 | M-10, M-12 | 全画像のピクセル幅が1200px以下である |
| 31 | title付き画像がfigure/figcaptionに変換されている | プラグイン | M-02, M-12 | 記事HTMLに`<figure>`と`<figcaption>`が含まれる |

---

## 12. 管理画面HTML検証 (`admin-html.test.mjs`) — 66件

`public/admin/index.html`のHTML/CSS/JavaScript内容を文字列パターンマッチングで検証する。

### 12.1 基本構造（5件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | HTML5 doctype宣言がある | M-02 | `<!doctype html>`が含まれる |
| 2 | 文字エンコーディングがUTF-8に設定されている | M-02 | `charset="utf-8"`が含まれる |
| 3 | robots noindex が設定されている | M-02 | `noindex`が含まれる |
| 4 | viewportメタタグが設定されている | M-02 | `viewport`が含まれる |
| 5 | Decap CMSのスクリプトが読み込まれている | M-02 | `decap-cms`のスクリプトURLが含まれる |

### 12.2 PC端末対応（6件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | box-sizing: border-boxがグローバルに設定されている | M-02 | CSS内に`box-sizing: border-box`が含まれる |
| 2 | 横はみ出し防止のoverflow-x: hiddenが設定されている | M-02 | CSS内に`overflow-x: hidden`が含まれる |
| 3 | コレクション一覧の日付バッジスタイルが定義されている | M-02 | 日付バッジ用CSSが含まれる |
| 4 | 選択解除ボタンのスタイルが定義されている | M-02 | 選択解除ボタン用CSSが含まれる |
| 5 | 完全削除ボタンのスタイルが定義されている | M-02 | 完全削除ボタン用CSSが含まれる |
| 6 | 完全削除ボタンの無効状態スタイルが定義されている | M-02 | disabled時のCSSが含まれる |

### 12.3 モバイル対応（10件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 799pxブレイクポイントのメディアクエリが存在する | M-02 | `max-width: 799px`メディアクエリが含まれる |
| 2 | アプリコンテナのレイアウト調整がある | M-02 | AppMainContainerのCSS調整が含まれる |
| 3 | サイドバーがposition: initialに変更されている | M-02 | `position: initial`が含まれる |
| 4 | エディタのコントロールバーがstickyに設定されている | M-02 | `position: sticky`が含まれる |
| 5 | 保存・公開ボタンのタップ領域が44px以上確保されている | M-02 | `min-height: 44px`が含まれる |
| 6 | ドロップダウンがボトムシート形式でfixed表示される | M-02 | `position: fixed` `z-index: 99999` `bottom: 0`がDropdownListに含まれる |
| 7 | モーダルが画面幅95%で表示される | M-02 | `95vw`が含まれる |
| 8 | メディアライブラリのカードグリッドが2列表示である | M-02 | `repeat(2, 1fr)`が含まれる |
| 9 | 画像選択ボタンが縦並び・全幅表示である | M-02 | `width: 100%`がボタンに適用されている |
| 10 | メディアライブラリのスクロール対応がある | M-02 | `-webkit-overflow-scrolling`または`overflow`関連CSSが含まれる |

### 12.4 画像回転対応（2件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | image-orientation: from-image が設定されている | M-02 | CSS内に`image-orientation: from-image`が含まれる |
| 2 | ドロップダウン表示時にURLバーとの重なりをJSで制御している | M-02 | `manageDropdownOverlay`関数と`cms-public-url`要素が含まれる |

### 12.5 iPhone固有対応（5件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 入力フォームのfont-sizeが16px以上である | M-02 | `font-size: 16px`がinput/textarea/selectに適用されている |
| 2 | HEIC画像アップロード時のaccept属性制限がある | M-02 | JS内にaccept属性の書き換え処理が含まれる |
| 3 | pull-to-refresh無効化スクリプトがある | M-02 | `touchstart`または`touchmove`のpreventDefault処理が含まれる |
| 4 | モーダル内のスクロールは許可されている | M-02 | モーダル内のタッチイベント伝搬許可処理が含まれる |
| 5 | touchmoveハンドラがSlateエディタとCodeMirrorを除外している | M-02 | `data-slate-editor`と`CodeMirror`のホワイトリストチェックが含まれる |

### 12.5b Slate codeblockクラッシュ対策（3件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | モバイルでcodeblockボタンを非表示にする関数がある | M-02 | `hideCodeBlockOnMobile`関数と`window.innerWidth > 799`のモバイル判定が含まれる |
| 2 | Slateエラー（toSlatePoint/toSlateRange）のグローバルハンドラがある | M-02 | `toSlatePoint`/`toSlateRange`をキャッチするwindow errorハンドラが含まれる |
| 3 | MutationObserverがrequestAnimationFrameでデバウンスされている | M-02 | `requestAnimationFrame`と`rafPending`によるデバウンス処理が含まれる |

### 12.6 JavaScriptカスタマイズ（9件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | MutationObserverによるDOM監視が設定されている | M-02 | `MutationObserver`のインスタンス化コードが含まれる |
| 1b | ヘッダーに本番サイトへのリンク追加機能がある | M-02 | `addSiteLink`関数、`cms-site-link` ID、`https://reiwa.casa`リンク、`target="_blank"`が含まれる |
| 2 | コレクション一覧の日付フォーマット処理がある | M-02 | 日付パース・フォーマット処理のJS関数が含まれる |
| 3 | 削除ボタンのラベル変更処理がある | M-02 | ボタンテキスト書き換え処理が含まれる |
| 4 | 削除ボタンの文脈判定がある | M-02 | メディアライブラリ/エディタの文脈判定ロジックが含まれる |
| 5 | 選択状態による削除ボタンの有効/無効制御がある | M-02 | disabled属性の動的切替処理が含まれる |
| 6 | エディタ画面に公開URL表示機能がある | M-02 | 公開URL生成・表示のJS処理が含まれる |
| 7 | 公開URLがタイトルと日付から動的生成される | M-02 | タイトル・日付フィールド監視と URL 構築処理が含まれる |
| 8 | 選択状態の判定がborderColorで行われている | M-02 | `borderColor`による選択判定ロジックが含まれる |

### 12.7 iPad対応（4件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | フッターボタンがflex配置である | M-02 | `display: flex`がフッターボタン領域に適用されている |
| 2 | アップロードボタンが全幅で表示される | M-02 | `width: 100%`がアップロードボタンに適用されている |
| 3 | ツールバーがwrapで折り返し対応である | M-02 | `flex-wrap: wrap`がツールバーに適用されている |
| 4 | 戻るリンクが省略表示される | M-02 | 戻るリンクの省略表示CSSが含まれる |

### 12.8 ボタン押下可能性検証（6件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | 保存・公開ボタンがflex-shrink: 0で縮小されない | M-02 | `flex-shrink: 0`がボタンに適用されている |
| 2 | min-heightが44px以上である | M-02 | `min-height: 44px`（Apple HIG基準）が適用されている |
| 3 | モーダルフッターのボタンが均等配置される | M-02 | モーダルフッターにflex均等配置CSSが含まれる |
| 4 | アップロードボタンがタップ可能である | M-02 | タップ領域確保CSSが含まれる |
| 5 | 画像ウィジェットボタンが全幅でタップ可能である | M-02 | `width: 100%`がImageWidgetButtonに適用されている |
| 6 | 新規投稿ボタンにパディングがある | M-02 | paddingが新規投稿ボタンに適用されている |

### 12.9 ドロップダウン重なり防止: PC（3件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | ドロップダウンがz-index: 9999で最前面に表示される | M-02 | `z-index: 9999`がDropdownListに適用されている |
| 2 | 公開URLバーがz-index: 9998で表示される | M-02 | `z-index: 9998`が公開URLバーに適用されている |
| 3 | DropdownListがボトムシートとしてposition:fixedで表示される | M-02 | DropdownListに`position: fixed`と`border-radius: 16px 16px 0 0`が適用されている |

### 12.10 ドロップダウン重なり防止: モバイル（8件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | EditorControlBarがz-index: 300でsticky表示される | M-02 | `z-index: 300`かつ`position: sticky`が適用されている |
| 2 | エディタコンテナのoverflowがvisibleである | M-02 | `overflow: visible`が適用されている |
| 3 | ツールバーコンテナのoverflowがvisibleである | M-02 | `overflow: visible`がツールバーに適用されている |
| 4 | モーダルがz-indexなしである | M-02 | モーダルに対してz-indexの上書きが存在しない |
| 5 | カードグリッドがoverflowスクロール対応である | M-02 | `overflow`スクロール設定がカードグリッドに適用されている |
| 6 | AppMainContainerのmin-widthが0である | M-02 | `min-width: 0`が適用されている |
| 7 | コントロールパネルがmax-width: 100vwである | M-02 | `max-width: 100vw`が適用されている |
| 8 | PublishedToolbarButtonの::after疑似要素が非表示である | M-02 | `::after`に`display: none`が適用されている |

### 12.11 プレビュースタイル: 本番サイト再現（5件）

| No. | テストケース | テスト手法 | 期待結果 |
| :--- | :--- | :--- | :--- |
| 1 | CMS.registerPreviewStyle が呼び出されている | M-02 | `CMS.registerPreviewStyle`が含まれる |
| 2 | 本番サイト相当のフォントファミリーが設定されている | M-02 | `-apple-system`と`Hiragino Kaku Gothic ProN`が含まれる |
| 3 | 本番サイト相当の行間（line-height: 1.9）が設定されている | M-02 | `line-height: 1.9`が含まれる |
| 4 | 画像スタイル（border-radius, margin）が設定されている | M-02 | `border-radius: 4px`と`margin: 1rem 0`が含まれる |
| 5 | コードブロックスタイルが設定されている | M-02 | `background: #f5f5f5`が含まれる |

---

# 第3部 要件トレーサビリティ

---

## 13. 要件トレーサビリティマトリクス

要件定義書（DOCUMENTATION.md 第1部）で定義された各要件とテストケースの対応関係を示す。

### 13.1 機能要件 (FR) → テストケース

| 要件ID | 要件概要 | テストファイル | 対応テストケース | 主テスト手法 | 充足状況 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| FR-01 | 記事管理 (frontmatter) | content-validation | 7章 #2〜#5, #9〜#11 | M-03, M-04 | 充足 |
| FR-02 | URL生成 | build | 11章 #10 | M-01 | 充足 |
| FR-03 | 下書き | content-validation | 7章 #5 | M-04 | 充足 |
| FR-04 | タグ分類 | content-validation, build | 7章 #9, 11章 #14,#23 | M-04, M-01, M-02 | 充足 |
| FR-05 | アーカイブ | build | 11章 #11,#12,#24 | M-01, M-02 | 充足 |
| FR-06 | 画像アップロード | cms-config, build | 10章 #6,#7, 11章 #28 | M-03, M-01 | 充足 |
| FR-07 | 画像最適化 | build | 11章 #30 | M-10, M-12 | 充足 |
| FR-08 | EXIF回転正規化 | content-validation, build, admin-html | 7章 #12〜#15, 11章 #29, 12.4章 | M-10, M-11, M-02 | 充足 |
| FR-09 | 記事自動整理 | content-validation | 7章 #7,#8 | M-01, M-03 | 充足 |
| FR-10 | URLマッピングJSON | — | — | — | **未テスト** |
| FR-11 | HEIC→JPEG変換 | admin-html | 12.5章 #2 | M-02 | 充足 |
| FR-12 | CMS認証 | auth-functions, build | 9章 #1〜#10, 11章 #26 | M-06, M-07, M-08 | 充足 |
| FR-13 | 画像キャプション | rehype-image-caption, build | 8章 #1〜#8, 11章 #31 | M-05, M-02 | 充足 |

### 13.2 CMS管理画面要件 (CMS) → テストケース

| 要件ID | 要件概要 | テストファイル | 対応テストケース | 主テスト手法 | 充足状況 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| CMS-01 | モバイルレスポンシブ | admin-html | 12.3章 #1〜#10 | M-02 | 充足 |
| CMS-02 | iOS自動ズーム防止 | admin-html | 12.5章 #1 | M-02 | 充足 |
| CMS-03 | pull-to-refresh無効化 | admin-html | 12.5章 #3,#4 | M-02 | 充足 |
| CMS-04 | 削除ボタンラベル区別 | admin-html | 12.6章 #3,#4,#5 | M-02 | 充足 |
| CMS-05 | 一覧表示改善 | admin-html | 12.2章 #3, 12.6章 #2 | M-02 | 充足 |
| CMS-06 | エディタ公開URL表示 | admin-html | 12.6章 #6,#7 | M-02 | 充足 |
| CMS-07 | メディアライブラリ | admin-html | 12.3章 #8,#10 | M-02 | 充足 |
| CMS-08 | 保存ボタン常時表示 | admin-html | 12.3章 #4,#5, 12.8章 #1,#2 | M-02 | 充足 |
| CMS-11 | 本番サイトリンク表示 | admin-html | 12.6章 #1b | M-02 | 充足 |
| CMS-12 | Slate codeblockクラッシュ対策 | admin-html | 12.5b章 #1,#2,#3, 12.5章 #5 | M-02 | 充足 |

### 13.3 非機能要件 (NFR) → テストケース

| 要件ID | 要件概要 | テストファイル | 対応テストケース | 主テスト手法 | 充足状況 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NFR-01 | 静的サイト生成 | build | 11章 #1〜#8 | M-01, M-12 | 充足 |
| NFR-02 | Cloudflare Pagesホスティング | build | 11章 #6,#7,#8 | M-01 | 充足 |
| NFR-03 | 管理画面SEO除外 | admin-html | 12.1章 #3 | M-02 | 充足 |
| NFR-04 | 日本語URL | cms-config | 10章 #9,#10 | M-03 | 充足 |

### 13.4 未テスト要件

| 要件ID | 要件概要 | 未テスト理由 | リスク評価 |
| :--- | :--- | :--- | :--- |
| FR-10 | URLマッピングJSON生成 | CMS実行時のみ使用される動的機能であり、Vitestからの自動検証が不可である。organize-posts.mjsのビルド前処理として実行され、`public/admin/url-map.json`に出力される。 | 低（ビルドログで`url-map.json generated`メッセージにより手動確認可能） |

---

# 第4部 テスト実行

---

## 14. 動的操作テスト（E2E）

### 14.1 概要

Playwright によるブラウザ自動操作テストを導入し、ユーザー操作を動的にシミュレートする。ビルド済み静的サイトをローカルサーバーで配信し、Chromium で PC / iPad / iPhone の3デバイスを想定したテストを実行する。

```
┌──────────────────────────────────────────────────────────┐
│                    Playwright E2E テスト                    │
│                                                            │
│  ┌────────────────┐    ┌──────────────┐    ┌────────────┐│
│  │ テストスクリプト  │───→│ ヘッドレス     │───→│ serve       ││
│  │ (TypeScript)    │    │ Chromium     │    │ localhost   ││
│  │                │    │              │    │ :4173       ││
│  │ site.spec.ts   │    │ PC 1280x720  │    │             ││
│  │ cms.spec.ts    │    │ iPad 810x1080│    │ dist/       ││
│  │                │    │ iPhone 390x844│   │ (静的サイト)  ││
│  └────────────────┘    └──────────────┘    └────────────┘│
└──────────────────────────────────────────────────────────┘
```

### 14.2 実行環境

| 項目 | 内容 |
| :--- | :--- |
| 実行環境 | **ローカル開発環境のみ**（VSCode ターミナル等） |
| ツール | Playwright (`@playwright/test` v1.58) |
| ブラウザ | Chromium（PC / iPad / iPhone のビューポートで実行） |
| サーバー | `npx serve dist -l 4173`（Playwright が自動起動） |
| 前提条件 | `npm run build` でビルド済みの `dist/` が存在すること |
| CI実行 | 非対応（Cloudflare Pages ビルド環境にブラウザバイナリが無いため） |

### 14.3 テストケース一覧

#### 静的サイトテスト (`tests/e2e/site.spec.ts`)

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-01 | トップページ表示 | h1「記事一覧」表示、記事カード存在、タイトルリンク・日付の構造検証 | DOM検証 |
| E-02 | 記事ページ遷移 | 記事リンクclick → 記事詳細表示（ヘッダー・コンテンツ・フッター）、戻るリンク動作 | ナビゲーション |
| E-03 | タグフィルタリング | タグclick → タグページ遷移、該当記事のみ表示、戻るリンク動作 | ナビゲーション |
| E-04 | アーカイブナビゲーション | 年・月リンクclick → アーカイブページ遷移、トップページと同数の記事一覧表示 | ナビゲーション |
| E-05 | 画像表示 | lazy loading属性、async decoding属性、figure/figcaption構造、サムネイル表示 | DOM検証 |
| E-06 | 下書き記事非表示 | トップページにdraft記事が含まれないこと、タイトルが空でないこと | DOM検証 |

#### CMS管理画面テスト (`tests/e2e/cms.spec.ts`)

OAuth認証はGitHub実環境が必要なため、postMessage APIによるシミュレーション及びHTML構造の静的検証で代替する。

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-07 | CMS管理画面読込 | HTMLロード、Decap CMS初期化、GitHubログインボタン表示 | DOM検証 |
| E-08 | 認証シミュレーション | OAuthポップアップ起動（GitHub リダイレクト対応）、postMessageトークン送信のシミュレーション | モック/シミュレーション |
| E-09 | 記事作成フォーム | 新規記事ハッシュルート (`#/collections/posts/new`) への遷移 | ルーティング検証 |
| E-10 | 記事編集 | 記事編集ハッシュルート (`#/collections/posts/entries/...`) への遷移 | ルーティング検証 |
| E-11 | 画像アップロードUI | CMS config.ymlのmedia_folder定義、HEIC→JPEG変換のaccept属性制限 | 構造検証 |
| E-12 | 記事削除UI | 「選択解除」「完全削除」ラベル変更ロジック、無効化ロジックの実装確認 | 構造検証 |

#### CMS UIカスタマイズ検証 (`tests/e2e/cms-customizations.spec.ts`)

過去の不具合修正・手動打鍵テストの観点をE2Eテストに落とし込み、リグレッション検証する。

| No. | テストケース | 検証内容 | テスト手法 |
| :--- | :--- | :--- | :--- |
| E-13 | CMS カスタマイズ基盤検証 | 全カスタマイズ関数の実装、RAFデバウンス、Slateエラーハンドラ、hashchange/popstate、BackCollection/BackStatus、getBoundingClientRect判定、hiddenByDropdownフラグ、image-orientation CSS | 構造検証 |
| E-14 | プレビュースタイル本番再現 | registerPreviewStyleによる本番CSS注入（フォント、行間、画像、コードブロック）、CMSオブジェクトロード | 構造検証・JS検証 |
| E-15 | 公開URLバー表示制御 | ログイン画面で非表示、コレクション一覧で非表示、エディタ→コレクション遷移で非表示、hashchange後の状態 | 動作検証（認証シミュレーション） |
| E-16 | モバイル固有カスタマイズ | ボトムシートCSS、iOS自動ズーム防止16px、codeblockボタン非表示、タップ領域44px、pull-to-refresh防止、モーダル95vw、カードグリッド2列、stickyコントロールバー | 構造検証 |
| E-17 | サイトリンク・コレクション表示 | 「ブログを見る」リンク表示・遷移先、エントリー日付バッジフォーマット、entry-date/entry-title/entry-draftクラス | 動作検証・構造検証 |
| E-18 | EXIF画像処理・アップロード | Canvas EXIF正規化、HEIC制限accept属性、画像プレビューCSS（object-fit、max-height） | 構造検証 |
| E-19 | 削除ボタン動作・メディアライブラリ | 選択解除ラベル・CSS、完全削除ラベル・CSS、無効化ロジック（borderColor判定）、disabled状態CSS | 構造検証 |

### 14.4 デバイス別テスト

全テストケースを以下の3デバイスで実行する（合計204テスト）。

| デバイス | ビューポート | 用途 |
| :--- | :--- | :--- |
| PC | 1280 x 720 | デスクトップ表示の検証 |
| iPad (gen 7) | 810 x 1080 | タブレット表示の検証 |
| iPhone 14 | 390 x 844 | モバイル表示の検証 |

### 14.5 CMS操作テストの制約と今後

| 項目 | 説明 |
| :--- | :--- |
| 認証 | GitHub OAuthの実環境が必要。postMessageシミュレーションで認証フローの構造は検証可能だが、CMS内部のReact状態は完全には再現できない |
| 記事CRUD操作 | 認証済み状態でのみ可能。ローカル手動テストで補完する |
| 今後の拡張 | Decap CMS の `test-repo` バックエンドを使えば認証不要でCMS操作テストが可能になる。需要に応じて導入を検討する |

---

## 15. 実行手順

### 15.1 単体テスト実行（Vitest）

```bash
# 全テスト実行（CI/デプロイ前）
npm test

# 個別テスト実行
npx vitest run tests/content-validation.test.mjs
npx vitest run tests/rehype-image-caption.test.mjs
npx vitest run tests/auth-functions.test.mjs

# ウォッチモード（開発中）
npm run test:watch
```

### 15.2 E2Eテスト実行（Playwright）

```bash
# 前提: ビルド済みのdist/が必要
npm run build

# E2Eテスト実行（PC/iPad/iPhone 全デバイス）
npm run test:e2e

# 静的サイトテストのみ
npx playwright test tests/e2e/site.spec.ts

# CMSテストのみ
npx playwright test tests/e2e/cms.spec.ts

# 特定デバイスのみ
npx playwright test --project=iPhone
```

**注意**: E2Eテストはローカル開発環境でのみ実行可能である。Chromiumブラウザのバイナリが必要なため、初回は `npx playwright install chromium` でインストールすること。

### 15.3 ビルド検証

```bash
# ビルドパイプライン全体の実行
npm run build

# 確認事項:
# - normalize-images のログに異常がないこと
# - organize-posts のログに "url-map.json generated" が出力されること
# - astro build が正常に完了すること
# - image-optimize のログにリサイズ結果が出力されること
```

---

## 16. テスト実行結果

### 16.1 単体テスト最新実行結果（Vitest）

| 項目 | 結果 |
| :--- | :--- |
| 実行日時 | 2026-02-15 17:20 |
| Vitest バージョン | v4.0.18 |
| 実行時間 | 1.31s |
| 合否判定 | **合格** |

### 16.2 テストファイル別結果

| テストファイル | テスト数 | 結果 | 実行時間 |
| :--- | :--- | :--- | :--- |
| `cms-config.test.mjs` | 27 | PASS | 3ms |
| `admin-html.test.mjs` | 66 | PASS | 4ms |
| `rehype-image-caption.test.mjs` | 8 | PASS | 2ms |
| `auth-functions.test.mjs` | 10 | PASS | 25ms |
| `content-validation.test.mjs` | 35 | PASS | 21ms |
| `build.test.mjs` | 31 | PASS | 1293ms |
| **合計** | **177** | **全PASS** | **1358ms** |

### 16.3 E2Eテスト最新実行結果（Playwright）

| 項目 | 結果 |
| :--- | :--- |
| 実行日時 | 2026-02-20 13:00 |
| Playwright バージョン | v1.58.2 |
| 実行時間 | 96s |
| 合否判定 | **合格** |

| テストファイル | PC | iPad | iPhone | 合計 |
| :--- | :--- | :--- | :--- | :--- |
| `site.spec.ts`（E-01〜E-06） | 19 PASS | 19 PASS | 19 PASS | 57 |
| `cms.spec.ts`（E-07〜E-12） | 11 PASS | 11 PASS | 11 PASS | 33 |
| `cms-customizations.spec.ts`（E-13〜E-19） | 38 PASS | 38 PASS | 38 PASS | 114 |
| **合計** | **68** | **68** | **68** | **204 全PASS** |

### 16.4 ビルド実行結果

| 項目 | 結果 |
| :--- | :--- |
| ビルドコマンド | `npm run build` |
| 生成ページ数 | 16ページ |
| 画像最適化 | 1ファイル（img_4642.jpg: 6.0MB → 0.2MB, -96%） |
| ビルド時間 | 689ms |
| 合否判定 | **合格** |

---

**最終更新**: 2026年2月15日
