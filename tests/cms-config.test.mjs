import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const configPath = join(process.cwd(), 'public/admin/config.yml');
const configRaw = readFileSync(configPath, 'utf-8');
const config = yaml.load(configRaw);

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
    it('コレクションが1つ（posts）定義されている', () => {
      expect(config.collections).toHaveLength(1);
      expect(config.collections[0].name).toBe('posts');
    });

    describe('posts コレクション', () => {
      const collection = config.collections[0];

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
