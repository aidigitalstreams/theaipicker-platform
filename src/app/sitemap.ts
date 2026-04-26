import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/content';
import { getFreeToolCategories } from '@/lib/free-tools';

const SITE_URL = 'https://theaipicker.com';

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/reviews', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/compare', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/best', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/rankings', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/free-tools', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/guides', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/tools', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/how-we-review', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/editorial-standards', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/disclosure', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.3 },
];

const ARTICLE_GROUPS: { dir: string; route: string; priority: number }[] = [
  { dir: 'reviews', route: '/reviews', priority: 0.8 },
  { dir: 'comparisons', route: '/compare', priority: 0.8 },
  { dir: 'best-of', route: '/best', priority: 0.8 },
  { dir: 'guides', route: '/guides', priority: 0.7 },
  { dir: 'rankings', route: '/rankings', priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  for (const group of ARTICLE_GROUPS) {
    const articles = await getAllArticles(group.dir);
    for (const article of articles) {
      if (article.meta.status && article.meta.status !== 'publish') continue;
      entries.push({
        url: `${SITE_URL}${group.route}/${article.meta.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: group.priority,
      });
    }
  }

  const freeCategories = await getFreeToolCategories();
  for (const cat of freeCategories) {
    entries.push({
      url: `${SITE_URL}/free-tools/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    });
  }

  return entries;
}
