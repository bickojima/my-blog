import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1).max(200),
    date: z.union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      z.date(),
    ]).transform((val) =>
      val instanceof Date ? val.toISOString().split('T')[0] : val
    ),
    draft: z.boolean().default(false),
    tags: z.array(z.string().min(1).max(50)).max(20).default([]),
    thumbnail: z.string().startsWith('/images/').optional(),
    summary: z.string().max(500).optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1).max(200),
    order: z.number().int().min(1).default(1),
    draft: z.boolean().default(false),
    // 検索結果に出さないページ。noindexメタとsitemap除外をセットで適用する
    noindex: z.boolean().default(false),
  }),
});

export const collections = { posts, pages };
