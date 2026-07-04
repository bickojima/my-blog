import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getPostUrl } from '../lib/posts';

export async function GET(context) {
  const posts = (await getCollection('posts'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'tbiのブログ',
    description: 'tbiの個人ブログ。日々のできごとを記録しています。',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.summary,
      link: getPostUrl(post),
    })),
  });
}
