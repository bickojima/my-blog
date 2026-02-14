import type { CollectionEntry } from 'astro:content';

export function getPostUrl(post: CollectionEntry<'posts'>, allPosts: CollectionEntry<'posts'>[]): string {
  const [year, month] = post.data.date.split('-');

  // 同じ年月・同じslugの記事を検出
  const dupes = allPosts.filter(p => {
    const [y, m] = p.data.date.split('-');
    return y === year && m === month && p.slug === post.slug;
  });

  let slug = post.slug;
  if (dupes.length > 1) {
    dupes.sort((a, b) => a.id.localeCompare(b.id));
    const idx = dupes.findIndex(p => p.id === post.id);
    if (idx > 0) slug = `${post.slug}-${idx}`;
  }

  return `/posts/${year}/${month}/${slug}`;
}

export function getPostUrlParts(post: CollectionEntry<'posts'>, allPosts: CollectionEntry<'posts'>[]): { year: string; month: string; slug: string } {
  const url = getPostUrl(post, allPosts);
  const parts = url.split('/');
  return { year: parts[2], month: parts[3], slug: parts[4] };
}
