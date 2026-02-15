import type { CollectionEntry } from 'astro:content';

// ファイル名からスラグを取得（post.id = "2026/01/あああ.md"）
function getFileSlug(post: CollectionEntry<'posts'>): string {
  return post.id.replace(/\.md$/, '').split('/').pop()!;
}

export function getPostUrl(post: CollectionEntry<'posts'>, _allPosts: CollectionEntry<'posts'>[]): string {
  const [year, month] = post.data.date.split('-');
  const slug = getFileSlug(post);
  return `/posts/${year}/${month}/${slug}`;
}

export function getPostUrlParts(post: CollectionEntry<'posts'>, allPosts: CollectionEntry<'posts'>[]): { year: string; month: string; slug: string } {
  const url = getPostUrl(post, allPosts);
  const parts = url.split('/');
  return { year: parts[2], month: parts[3], slug: parts[4] };
}
