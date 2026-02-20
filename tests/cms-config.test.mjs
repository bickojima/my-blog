import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const configPath = join(process.cwd(), 'public/admin/config.yml');
const configRaw = readFileSync(configPath, 'utf-8');
const config = yaml.load(configRaw);

const docPath = join(process.cwd(), 'docs/DOCUMENTATION.md');
const docContent = readFileSync(docPath, 'utf-8');

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

        it('orderフィールドがnumberウィジェット', () => {
          const order = fields.find(f => f.name === 'order');
          expect(order.widget).toBe('number');
          expect(order.value_type).toBe('int');
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
