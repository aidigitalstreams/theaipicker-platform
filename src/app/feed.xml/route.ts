import { getAllArticles } from '@/lib/content';

const SITE_URL = 'https://theaipicker.com';
const SITE_TITLE = 'The AI Picker';
const SITE_DESC = 'In-depth, research-based reviews and comparisons of AI tools.';

interface FeedItem {
  title: string;
  url: string;
  description: string;
  pubDate: Date;
  category?: string;
}

const ARTICLE_GROUPS: { dir: string; route: string }[] = [
  { dir: 'reviews', route: '/reviews' },
  { dir: 'comparisons', route: '/compare' },
  { dir: 'best-of', route: '/best' },
  { dir: 'guides', route: '/guides' },
  { dir: 'rankings', route: '/rankings' },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderItem(item: FeedItem): string {
  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
${item.category ? `      <category>${escapeXml(item.category)}</category>\n` : ''}    </item>`;
}

export async function GET() {
  const items: FeedItem[] = [];
  const now = new Date();

  for (const group of ARTICLE_GROUPS) {
    const articles = await getAllArticles(group.dir);
    for (const article of articles) {
      if (article.meta.status && article.meta.status !== 'publish') continue;
      items.push({
        title: article.meta.title,
        url: `${SITE_URL}${group.route}/${article.meta.slug}`,
        description: article.meta.meta_description || article.meta.title,
        pubDate: now,
        category: article.meta.category || undefined,
      });
    }
  }

  items.sort((a, b) => a.title.localeCompare(b.title));
  const recent = items.slice(0, 50);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en-gb</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${recent.map(renderItem).join('\n')}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
