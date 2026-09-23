import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { parseFrontmatter } from '../scripts/lib/safe-frontmatter.mjs'; // Bug #52: gray-matter を直接呼ばない
import { loadResolveCmsBackend, locationOf, effectiveBackend } from './lib/cms-env-loader.mjs';
import { PRODUCTION_SITE_URL, STAGING_SITE_URL } from '../src/lib/site-env.mjs';

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

// Issue #127: backend.branch / base_url は config.yml に置かず、admin/index.html が
// /admin/cms-env.js の resolveCmsBackend(location) で導出して CMS.init に渡す（config.yml の上に deepmerge）。
// 以下のテストは「config.yml + 実行時導出値」の実効設定を検証する。
const resolveCmsBackend = loadResolveCmsBackend();
const HOST_SAMPLES = [
  'https://reiwa.casa/admin/',
  'https://staging.reiwa.casa/admin/',
  'https://abc123.my-blog-3cg.pages.dev/admin/',
  'http://localhost:4173/admin/',
];

describe('CMS設定（config.yml）の検証', () => {
  describe('バックエンド設定', () => {
    it('GitHubバックエンドが設定されている', () => {
      expect(config.backend).toBeDefined();
      expect(config.backend.name).toBe('github');
    });

    it('リポジトリが正しく設定されている', () => {
      expect(config.backend.repo).toBe('bickojima/my-blog');
    });

    // Issue #127 で書き換え: 旧テストは config.yml の backend.branch が main/staging か見ていた。
    // branch は config.yml から削除したため、実行時に導出される実効値で同じ性質を検証する。
    it('ブランチが有効な値に設定されている（実行時導出の実効値が main/staging のいずれか）', () => {
      for (const url of HOST_SAMPLES) {
        const eff = effectiveBackend(config, resolveCmsBackend(locationOf(url)));
        expect(['main', 'staging'], url).toContain(eff.branch);
      }
    });

    it('認証エンドポイントが設定されている', () => {
      expect(config.backend.auth_endpoint).toBe('/auth');
    });

    // Issue #127 で書き換え: 旧テストは config.yml 内の branch と base_url の対応を見ていた。
    // 両方とも実行時導出になったため、本番/staging ホストでの実効値の対応で同じ性質を検証する。
    it('base_urlがブランチに対応するURLに設定されている（本番ホスト=main+本番URL、stagingホスト=staging+staging URL）', () => {
      const prod = effectiveBackend(config, resolveCmsBackend(locationOf(PRODUCTION_SITE_URL + '/admin/')));
      expect(prod.branch).toBe('main');
      expect(prod.base_url).toBe(PRODUCTION_SITE_URL);
      const stg = effectiveBackend(config, resolveCmsBackend(locationOf(STAGING_SITE_URL + '/admin/')));
      expect(stg.branch).toBe('staging');
      expect(stg.base_url).toBe(STAGING_SITE_URL);
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
      // 保存操作に必要な5つのフィールドが全て設定されていること。
      // Issue #127: branch / base_url は config.yml ではなく CMS.init で渡す実行時導出値のため、
      // config.yml と deepmerge した実効設定で検証する（どのホストでも欠けないこと）。
      for (const url of HOST_SAMPLES) {
        const eff = effectiveBackend(config, resolveCmsBackend(locationOf(url)));
        expect(eff.name, url).toBeDefined();
        expect(eff.repo, url).toBeDefined();
        expect(eff.branch, url).toBeDefined();
        expect(eff.base_url, url).toBeDefined();
        expect(eff.auth_endpoint, url).toBeDefined();
      }
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

describe('環境固有値の導出整合性検証（SEC-35 改訂, Bug #51再発防止, Issue #127）', () => {
  // Bug #51: config.yml(branch/base_url)・astro.config.mjs(SITE_URL)・robots.txt の4項目が
  // マージの副作用で丸ごと相手ブランチの値に上書きされた。旧 SEC-35 は「チェックアウト中のブランチに対して
  // 値が正しいか」を検知していたが、CI の pull_request では GITHUB_REF_NAME が `NNN/merge` になり
  // 判定不能側（内部整合のみ）に倒れ、修正もしなかった。
  // Issue #127 で4項目をファイルから消し、ビルド時（CF_PAGES_BRANCH）・実行時（location）に導出する構造へ変えたため、
  // ここでは「どのブランチ・どのホストでも導出結果が正しい」ことを、ブランチに依存しない同じテスト集合で検証する
  // （テスト件数が main / staging / feature で変わらない）。ファイル差分を置かない静的ガードは env-derivation.test.mjs。
  const EXPECTED = [
    // [CMS を開くホストの URL, 期待する書き込み先ブランチ]
    [PRODUCTION_SITE_URL + '/admin/', 'main'],
    [STAGING_SITE_URL + '/admin/', 'staging'],
    ['https://my-blog-3cg.pages.dev/admin/', 'staging'],
    ['http://localhost:4321/admin/', 'staging'],
  ];

  for (const [url, branch] of EXPECTED) {
    it(`${new URL(url).host} で開いた CMS の実効 backend は branch=${branch}・base_url=配信オリジン`, () => {
      const loc = locationOf(url);
      const eff = effectiveBackend(config, resolveCmsBackend(loc));
      expect(eff.branch).toBe(branch);
      expect(eff.base_url).toBe(loc.origin);
    });
  }

  it('config.yml 単体には branch / base_url が無い（マージで持ち込まれる環境値を置かない）', () => {
    expect(config.backend.branch).toBeUndefined();
    expect(config.backend.base_url).toBeUndefined();
  });
});
