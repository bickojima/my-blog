import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import { parseFrontmatter } from '../scripts/lib/safe-frontmatter.mjs'; // Bug #52: gray-matter を直接呼ばない

const configPath = join(process.cwd(), 'public/admin/config.yml');
const configRaw = readFileSync(configPath, 'utf-8');
let config;
try {
  config = yaml.load(configRaw);
} catch (e) {
  throw new Error(`config.yml のYAML解析に失敗: ${e.message}`);
}

const docPath = join(process.cwd(), 'docs/DOCUMENTATION.md');
const docContent = readFileSync(docPath, 'utf-8');

const astroConfigPath = join(process.cwd(), 'astro.config.mjs');
const astroConfigRaw = readFileSync(astroConfigPath, 'utf-8');
const robotsPath = join(process.cwd(), 'public/robots.txt');
const robotsRaw = readFileSync(robotsPath, 'utf-8');

/**
 * 現在のブランチを判定する（Bug #51再発防止）。
 * Base.astro は本番ビルド時のみ利用可能な CF_PAGES_BRANCH のみで判定しているが、
 * このテストはローカル・CI（GitHub Actions）双方で実行されるため、
 * Cloudflare Pages > GitHub Actions > ローカルgit の優先順でフォールバックする。
 * GitHub Actions の pull_request イベントでは GITHUB_REF_NAME が `<PR番号>/merge` になり
 * main/staging と一致しないが、その場合は意図的に「ブランチ判定不能」側（内部整合のみ検証）に倒す。
 */
function getCurrentBranch() {
  if (process.env.CF_PAGES_BRANCH) return process.env.CF_PAGES_BRANCH;
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd: process.cwd() })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

const currentBranch = getCurrentBranch();

function extractSiteUrl(content) {
  const m = content.match(/const SITE_URL = '([^']+)'/);
  return m ? m[1] : null;
}

const siteUrl = extractSiteUrl(astroConfigRaw);

const ENV_EXPECTATIONS = {
  main: {
    base_url: 'https://reiwa.casa',
    siteUrl: 'https://reiwa.casa',
    robotsRequired: /Allow:\s*\//,
    robotsForbidden: /Disallow:\s*\//,
  },
  staging: {
    base_url: 'https://staging.reiwa.casa',
    siteUrl: 'https://staging.reiwa.casa',
    robotsRequired: /Disallow:\s*\//,
    robotsForbidden: /Allow:\s*\//,
  },
};

describe('CMS設定（config.yml）の検証', () => {
  describe('バックエンド設定', () => {
    it('GitHubバックエンドが設定されている', () => {
      expect(config.backend).toBeDefined();
      expect(config.backend.name).toBe('github');
    });

    it('リポジトリが正しく設定されている', () => {
      expect(config.backend.repo).toBe('bickojima/my-blog');
    });

    it('ブランチが有効な値に設定されている', () => {
      expect(['main', 'staging']).toContain(config.backend.branch);
    });

    it('認証エンドポイントが設定されている', () => {
      expect(config.backend.auth_endpoint).toBe('/auth');
    });

    it('base_urlがブランチに対応するURLに設定されている', () => {
      const expectedUrls = {
        main: 'https://reiwa.casa',
        staging: 'https://staging.reiwa.casa',
      };
      expect(config.backend.base_url).toBe(expectedUrls[config.backend.branch]);
    });
  });

  describe('メディア設定', () => {
    it('メディアフォルダがpublic配下に設定されている', () => {
      expect(config.media_folder).toBe('public/images/uploads');
    });

    it('公開フォルダパスが正しい', () => {
      expect(config.public_folder).toBe('/images/uploads');
    });
  });

  describe('ロケール設定', () => {
    it('日本語ロケールが設定されている', () => {
      expect(config.locale).toBe('ja');
    });
  });

  describe('スラッグ設定', () => {
    it('Unicode対応のスラッグエンコーディングが設定されている', () => {
      expect(config.slug).toBeDefined();
      expect(config.slug.encoding).toBe('unicode');
    });

    it('アクセント文字のクリーニングが無効', () => {
      expect(config.slug.clean_accents).toBe(false);
    });
  });

  describe('コレクション設定', () => {
    it('コレクションが2つ（posts, pages）定義されている', () => {
      expect(config.collections).toHaveLength(2);
      const names = config.collections.map(c => c.name);
      expect(names).toContain('posts');
      expect(names).toContain('pages');
    });

    it('postsコレクションが先頭に定義されている（CMS初期表示で記事が最初に表示される）', () => {
      expect(config.collections[0].name).toBe('posts');
      expect(config.collections[1].name).toBe('pages');
    });

    describe('Decap CMS v3.10.0 互換性', () => {
      it('全コレクションのsortable_fieldsが有効な形式である', () => {
        // Decap CMS v3.10.0: 文字列 or { field: string, default_sort: "asc"|"desc" }
        config.collections.forEach(collection => {
          if (collection.sortable_fields) {
            collection.sortable_fields.forEach(field => {
              if (typeof field === 'object') {
                expect(field).toHaveProperty('field');
                expect(typeof field.field).toBe('string');
                if (field.default_sort) {
                  expect(['asc', 'desc']).toContain(field.default_sort);
                }
              } else {
                expect(typeof field).toBe('string');
              }
            });
          }
        });
      });
    });

    describe('pages コレクション', () => {
      const collection = config.collections.find(c => c.name === 'pages');

      it('フォルダが正しいパスに設定されている', () => {
        expect(collection.folder).toBe('src/content/pages');
      });

      it('新規作成が有効になっている', () => {
        expect(collection.create).toBe(true);
      });

      it('拡張子がmdに設定されている', () => {
        expect(collection.extension).toBe('md');
      });

      it('slugテンプレートがfields.slugを参照している（タイトルベースではない）', () => {
        // {{slug}}はDecap CMSではタイトルの安全版を意味する
        // {{fields.slug}}でフロントマターのslugフィールド値をファイル名に使用する
        expect(collection.slug).toBe('{{fields.slug}}');
      });

      describe('フィールド定義', () => {
        const fields = collection.fields;
        const fieldNames = fields.map(f => f.name);

        it('必須フィールドがすべて定義されている', () => {
          expect(fieldNames).toContain('title');
          expect(fieldNames).toContain('slug');
          expect(fieldNames).toContain('order');
          expect(fieldNames).toContain('body');
        });

        it('slugフィールドにバリデーションパターンがある', () => {
          const slug = fields.find(f => f.name === 'slug');
          expect(slug.widget).toBe('string');
          expect(slug.pattern).toBeDefined();
          expect(slug.pattern[0]).toBe('^[a-z0-9-]+$');
        });

        it('orderフィールドがnumberウィジェット（min:1で不正値を防止）', () => {
          const order = fields.find(f => f.name === 'order');
          expect(order.widget).toBe('number');
          expect(order.value_type).toBe('int');
          expect(order.min).toBe(1);
          expect(order.default).toBeGreaterThanOrEqual(1);
        });

        it('draftフィールドがbooleanウィジェットでデフォルトfalse', () => {
          const draft = fields.find(f => f.name === 'draft');
          expect(draft.widget).toBe('boolean');
          expect(draft.default).toBe(false);
        });

        it('bodyフィールドがmarkdownウィジェット', () => {
          const body = fields.find(f => f.name === 'body');
          expect(body.widget).toBe('markdown');
        });

        it('noindexフィールドがbooleanウィジェットでデフォルトfalse（FR-29）', () => {
          const noindex = fields.find(f => f.name === 'noindex');
          expect(noindex).toBeDefined();
          expect(noindex.widget).toBe('boolean');
          expect(noindex.default).toBe(false);
        });

        // Decap CMSは設定にないフロントマター項目を保存時に落とす。
        // CMSで1回編集しただけでnoindexやdraftが消える事故を防ぐ。
        it('既存固定ページのフロントマター項目がすべてCMSフィールドに定義されている', () => {
          const pagesDir = join(process.cwd(), 'src/content/pages');
          const files = readdirSync(pagesDir).filter(f => f.endsWith('.md'));
          expect(files.length).toBeGreaterThan(0);
          for (const file of files) {
            const { data } = parseFrontmatter(readFileSync(join(pagesDir, file), 'utf-8'));
            for (const key of Object.keys(data)) {
              expect(fieldNames, `${file} の "${key}" がCMS設定に無い（保存時に消える）`).toContain(key);
            }
          }
        });

        // スキーマ側で定義した項目もCMSから編集できないと、CMS保存で既定値へ戻る。
        it('固定ページのZodスキーマ項目がすべてCMSフィールドに定義されている', () => {
          const schema = readFileSync(join(process.cwd(), 'src/content.config.ts'), 'utf-8');
          const pagesBlock = schema.split('const pages = defineCollection(')[1].split('});')[0];
          const schemaKeys = [...pagesBlock.matchAll(/^\s{4}([a-zA-Z][a-zA-Z0-9_]*):/gm)].map(m => m[1]);
          expect(schemaKeys).toContain('noindex');
          for (const key of schemaKeys) {
            expect(fieldNames, `スキーマの "${key}" がCMS設定に無い`).toContain(key);
          }
        });
      });

      it('フォーマットがfrontmatterに設定されている', () => {
        expect(collection.format).toBe('frontmatter');
      });

      it('サマリー表示にorder・draft・titleが含まれている', () => {
        expect(collection.summary).toContain('{{order}}');
        expect(collection.summary).toContain('{{draft}}');
        expect(collection.summary).toContain('{{title}}');
      });

      it('ソート可能フィールドにorderとtitleが含まれている', () => {
        const fields = collection.sortable_fields;
        const fieldNames = fields.map(f => typeof f === 'object' ? f.field : f);
        expect(fieldNames).toContain('order');
        expect(fieldNames).toContain('title');
      });

      it('orderフィールドがデフォルトで昇順ソートに設定されている', () => {
        const orderField = collection.sortable_fields.find(
          f => typeof f === 'object' && f.field === 'order'
        );
        expect(orderField).toBeDefined();
        expect(orderField.default_sort).toBe('asc');
      });
    });

    describe('posts コレクション', () => {
      const collection = config.collections.find(c => c.name === 'posts');

      it('フォルダが正しいパスに設定されている', () => {
        expect(collection.folder).toBe('src/content/posts');
      });

      it('新規作成が有効になっている', () => {
        expect(collection.create).toBe(true);
      });

      it('拡張子がmdに設定されている', () => {
        expect(collection.extension).toBe('md');
      });

      it('フォーマットがfrontmatterに設定されている', () => {
        expect(collection.format).toBe('frontmatter');
      });

      it('pathプロパティに年月パスが含まれている', () => {
        expect(collection.path).toContain('{{year}}');
        expect(collection.path).toContain('{{month}}');
        expect(collection.path).toContain('{{slug}}');
      });

      it('slugがファイル名部分のみ（{{slug}}）に設定されている', () => {
        expect(collection.slug).toBe('{{slug}}');
      });

      it('サマリー表示に日付とタイトルが含まれている', () => {
        expect(collection.summary).toContain('{{date}}');
        expect(collection.summary).toContain('{{title}}');
      });

      it('ソート可能フィールドにdateとtitleが含まれている', () => {
        const fields = collection.sortable_fields;
        const fieldNames = fields.map(f => typeof f === 'object' ? f.field : f);
        expect(fieldNames).toContain('date');
        expect(fieldNames).toContain('title');
      });

      it('dateフィールドがデフォルトで降順ソートに設定されている', () => {
        const dateField = collection.sortable_fields.find(
          f => typeof f === 'object' && f.field === 'date'
        );
        expect(dateField).toBeDefined();
        expect(dateField.default_sort).toBe('desc');
      });

      it('view_groupsに年月グルーピングが設定されている', () => {
        expect(collection.view_groups).toBeDefined();
        expect(collection.view_groups).toHaveLength(1);

        const monthGroup = collection.view_groups[0];
        expect(monthGroup.label).toBe('年月');
        expect(monthGroup.field).toBe('date');
        expect(monthGroup.pattern).toMatch(/\\d\{4\}-\\d\{2\}/);
      });

      describe('フィールド定義', () => {
        const fields = collection.fields;
        const fieldNames = fields.map((f) => f.name);

        it('必須フィールドがすべて定義されている', () => {
          expect(fieldNames).toContain('title');
          expect(fieldNames).toContain('date');
          expect(fieldNames).toContain('draft');
          expect(fieldNames).toContain('body');
        });

        it('categoryフィールドが存在しない', () => {
          expect(fieldNames).not.toContain('category');
        });

        it('オプションフィールドが定義されている', () => {
          expect(fieldNames).toContain('tags');
          expect(fieldNames).toContain('thumbnail');
          expect(fieldNames).toContain('summary');
        });

        it('titleフィールドがstringウィジェット', () => {
          const title = fields.find((f) => f.name === 'title');
          expect(title.widget).toBe('string');
        });

        it('dateフィールドがdatetimeウィジェットでYYYY-MM-DD形式', () => {
          const date = fields.find((f) => f.name === 'date');
          expect(date.widget).toBe('datetime');
          expect(date.format).toBe('YYYY-MM-DD');
        });

        it('draftフィールドがbooleanウィジェットでデフォルトfalse', () => {
          const draft = fields.find((f) => f.name === 'draft');
          expect(draft.widget).toBe('boolean');
          expect(draft.default).toBe(false);
        });

        it('tagsフィールドがlistウィジェットでオプション', () => {
          const tags = fields.find((f) => f.name === 'tags');
          expect(tags.widget).toBe('list');
          expect(tags.required).toBe(false);
        });

        it('thumbnailフィールドがimageウィジェットでオプション', () => {
          const thumbnail = fields.find((f) => f.name === 'thumbnail');
          expect(thumbnail.widget).toBe('image');
          expect(thumbnail.required).toBe(false);
        });

        it('bodyフィールドがmarkdownウィジェット', () => {
          const body = fields.find((f) => f.name === 'body');
          expect(body.widget).toBe('markdown');
        });
      });
    });
  });
});

describe('基本機能保護テスト（FR-15〜FR-19）', () => {
  describe('コンテンツ保存・公開の前提条件（FR-15）', () => {
    it('backend設定に保存に必要な全フィールドが存在する', () => {
      // 保存操作に必要な5つのフィールドが全て設定されていること
      expect(config.backend.name).toBeDefined();
      expect(config.backend.repo).toBeDefined();
      expect(config.backend.branch).toBeDefined();
      expect(config.backend.base_url).toBeDefined();
      expect(config.backend.auth_endpoint).toBeDefined();
    });
  });

  describe('コンテンツ削除の許可（FR-16）', () => {
    it('全コレクションでdeleteが明示的に無効化されていない', () => {
      // Decap CMSではcreate: trueのコレクションでdeleteはデフォルト有効
      // delete: false が明示的に設定されていないことを検証
      for (const collection of config.collections) {
        expect(
          collection.delete,
          `${collection.name}コレクションでdelete: falseが設定されている`
        ).not.toBe(false);
      }
    });
  });

  describe('リッチテキスト編集（FR-17）', () => {
    it('postsのbodyフィールドがmarkdownウィジェットである', () => {
      const posts = config.collections.find(c => c.name === 'posts');
      const body = posts.fields.find(f => f.name === 'body');
      expect(body.widget).toBe('markdown');
    });

    it('pagesのbodyフィールドがmarkdownウィジェットである', () => {
      const pages = config.collections.find(c => c.name === 'pages');
      const body = pages.fields.find(f => f.name === 'body');
      expect(body.widget).toBe('markdown');
    });
  });

  describe('メディアライブラリ設定（FR-19）', () => {
    it('全コレクションにmedia_folderが設定されている', () => {
      for (const collection of config.collections) {
        expect(
          collection.media_folder,
          `${collection.name}コレクションにmedia_folderが未設定`
        ).toBeDefined();
      }
    });
  });
});

describe('要件トレーサビリティ検証', () => {
  it('DOCUMENTATION.mdの全CMS要件IDがトレーサビリティマトリクスに記載されている', () => {
    // 1.3章（CMS管理画面要件）からCMS-XX IDを抽出
    const reqSectionMatch = docContent.match(/## 1\.3\. CMS管理画面要件[\s\S]*?(?=\n---|\n## 1\.4\.)/);
    const reqSection = reqSectionMatch ? reqSectionMatch[0] : '';
    const reqIds = [...new Set([...reqSection.matchAll(/\| (CMS-\d+) \|/g)].map(m => m[1]))];

    // 1.5.2章（トレーサビリティマトリクス）からCMS-XX IDを抽出
    const traceSectionMatch = docContent.match(/### 1\.5\.2[\s\S]*?(?=\n### 1\.5\.3|\n---)/);
    const traceSection = traceSectionMatch ? traceSectionMatch[0] : '';
    const traceIds = [...traceSection.matchAll(/\| (CMS-\d+) \|/g)].map(m => m[1]);

    // 各要件IDがトレーサビリティに存在するか検証
    expect(reqIds.length).toBeGreaterThan(0);
    for (const id of reqIds) {
      expect(traceIds, `${id} がトレーサビリティマトリクスに未記載`).toContain(id);
    }
  });

  it('config.ymlの全コレクションに対応する要件がDOCUMENTATION.mdに存在する', () => {
    const collectionNames = config.collections.map(c => c.name);
    for (const name of collectionNames) {
      expect(docContent, `コレクション "${name}" に対応する要件がDOCUMENTATION.mdに未記載`).toContain(name);
    }
  });
});

describe('環境固有ファイルの実ブランチ整合性検証（SEC-35, Bug #51再発防止）', () => {
  // Bug #51: staging環境で config.yml(branch/base_url)・astro.config.mjs(SITE_URL)・robots.txt の
  // 4項目が「互いに整合」していても、その揃った値がmainマージの副作用で丸ごとmain値に
  // 上書きされたため、内部整合チェックだけでは事故を検出できなかった（staging CMSがmainブランチへ
  // 直接コミットする状態が21分間発生）。
  // このテストは「今チェックアウトしているブランチに対して正しい環境の値か」を検証する。
  if (currentBranch === 'main' || currentBranch === 'staging') {
    const expected = ENV_EXPECTATIONS[currentBranch];

    it(`現在のブランチ（${currentBranch}）に対してconfig.ymlのbranchが一致する`, () => {
      expect(config.backend.branch).toBe(currentBranch);
    });

    it(`現在のブランチ（${currentBranch}）に対してconfig.ymlのbase_urlが一致する`, () => {
      expect(config.backend.base_url).toBe(expected.base_url);
    });

    it(`現在のブランチ（${currentBranch}）に対してastro.config.mjsのSITE_URLが一致する`, () => {
      expect(siteUrl).toBe(expected.siteUrl);
    });

    it(`現在のブランチ（${currentBranch}）に対してpublic/robots.txtのクロール方針が一致する`, () => {
      expect(robotsRaw).toMatch(expected.robotsRequired);
      expect(robotsRaw).not.toMatch(expected.robotsForbidden);
    });
  } else {
    // feature/* 等はmain起点・staging起点どちらもあり得るため絶対値は検証しない。
    // ブランチが判定できない場合（CI の pull_request イベント等）も同様に扱う。
    // 代わりに、config.yml・astro.config.mjs・robots.txt の3ファイルが
    // 同一環境（staging寄りかmain寄りか）を指しているという内部整合のみ検証する。
    it('ブランチをmain/stagingと判定できない場合はconfig.yml・SITE_URL・robots.txtが同一環境を指す', () => {
      const isStagingByConfig = config.backend.branch === 'staging';
      const isStagingBySiteUrl = siteUrl === ENV_EXPECTATIONS.staging.siteUrl;
      const isStagingByRobots = ENV_EXPECTATIONS.staging.robotsRequired.test(robotsRaw)
        && !ENV_EXPECTATIONS.staging.robotsForbidden.test(robotsRaw);

      expect(
        config.backend.base_url,
        'config.ymlのbranchとbase_urlが不一致'
      ).toBe(isStagingByConfig ? ENV_EXPECTATIONS.staging.base_url : ENV_EXPECTATIONS.main.base_url);
      expect(isStagingBySiteUrl, 'astro.config.mjsのSITE_URLがconfig.ymlのbranchと不一致').toBe(isStagingByConfig);
      expect(isStagingByRobots, 'robots.txtの方針がconfig.ymlのbranchと不一致').toBe(isStagingByConfig);
    });
  }
});
