import type { CollectionEntry } from 'astro:content';

export function getPostUrl(post: CollectionEntry<'posts'>, allPosts: CollectionEntry<'posts'>[]): string {
  const [year, month] = post.data.date.split('-');
  const baseSlug = post.data.title;

  // 同じ年月・同じタイトルの記事を検出
  const dupes = allPosts.filter(p => {
    const [y, m] = p.data.date.split('-');
    return y === year && m === month && p.data.title === baseSlug;
  });

  let slug = baseSlug;
  if (dupes.length > 1) {
    // 日付の古い順でソート、同日の場合はidでソート
    dupes.sort((a, b) => {
      const dateDiff = new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.id.localeCompare(b.id);
    });
    const idx = dupes.findIndex(p => p.id === post.id);
    if (idx > 0) slug = `${baseSlug}-${idx}`;
  }

  return `/posts/${year}/${month}/${slug}`;
}

export function getPostUrlParts(post: CollectionEntry<'posts'>, allPosts: CollectionEntry<'posts'>[]): { year: string; month: string; slug: string } {
  const url = getPostUrl(post, allPosts);
  const parts = url.split('/');
  return { year: parts[2], month: parts[3], slug: parts[4] };
}
