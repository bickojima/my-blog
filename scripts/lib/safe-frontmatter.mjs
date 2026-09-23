import matter from 'gray-matter';

// SEC-29 / Bug #52（Issue #117 項目1の再対応）:
// gray-matter は `language` オプションを指定しても、本文が `---js` / `---javascript` / `---json`
// のように開始区切りの直後で言語を名乗るとそちらを優先する（gray-matter/index.js の parseMatter）。
// さらに `engines` は置換ではなくマージ（lib/defaults.js）なので、組み込みの javascript エンジン
// （内部で eval を実行）は `{ language: 'yaml' }` だけでは無効化できない。
// そこで YAML 以外の組み込みエンジンを「必ず例外を投げるエンジン」で上書きし、
// frontmatter を評価する前に拒否する。未登録の言語名は gray-matter 自身が例外を投げる。
function rejectEngine(name) {
  return {
    parse() {
      throw new Error(`frontmatter language "${name}" is not allowed (YAML only)`);
    },
    stringify() {
      throw new Error(`frontmatter language "${name}" is not allowed (YAML only)`);
    },
  };
}

export const FRONTMATTER_OPTIONS = Object.freeze({
  language: 'yaml',
  engines: {
    javascript: rejectEngine('javascript'),
    json: rejectEngine('json'),
  },
});

/**
 * YAML frontmatter のみを解析する。YAML 以外の言語指定（`---js` 等）は評価せずに例外を投げる。
 * gray-matter は同一文字列の解析結果をキャッシュするため、呼び出し毎にオプションを渡して
 * キャッシュを無効化する（オプション付き呼び出しはキャッシュされない）。
 * @param {string} content Markdown ファイルの内容
 */
export function parseFrontmatter(content) {
  return matter(content, FRONTMATTER_OPTIONS);
}
