import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { parseStructuredData } from './content';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export type ArticleType = 'review' | 'comparison' | 'best-of' | 'guide' | 'ranking' | 'page';

export interface AdminArticle {
  slug: string;
  title: string;
  type: ArticleType;
  category: string;
  status: string;
  targetKeyword: string;
  filename: string;
  subdir: string;
  topScore: number | null;
  toolCount: number;
}

const SUBDIRS: { dir: string; type: ArticleType }[] = [
  { dir: 'reviews', type: 'review' },
  { dir: 'comparisons', type: 'comparison' },
  { dir: 'best-of', type: 'best-of' },
  { dir: 'guides', type: 'guide' },
  { dir: 'rankings', type: 'ranking' },
];

function readArticle(subdir: string, type: ArticleType, filename: string): AdminArticle | null {
  const filePath = path.join(CONTENT_DIR, subdir, filename);
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  if (!data || !data.title) return null;

  const blocks = parseStructuredData(content);
  const scores = blocks.map(b => b.overallScore).filter(s => s > 0);
  const topScore = scores.length ? Math.max(...scores) : null;

  return {
    slug: data.slug || filename.replace(/\.md$/, ''),
    title: data.title,
    type,
    category: data.category || '',
    status: data.status || 'unknown',
    targetKeyword: data.target_keyword || '',
    filename,
    subdir,
    topScore,
    toolCount: blocks.length,
  };
}

export function getAllAdminArticles(): AdminArticle[] {
  const articles: AdminArticle[] = [];

  for (const { dir, type } of SUBDIRS) {
    const fullDir = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(fullDir)) continue;
    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const article = readArticle(dir, type, file);
      if (article) articles.push(article);
    }
  }

  articles.sort((a, b) => a.title.localeCompare(b.title));
  return articles;
}

export interface AdminStats {
  total: number;
  byType: { type: ArticleType; label: string; count: number }[];
  byCategory: { name: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

const TYPE_LABELS: Record<ArticleType, string> = {
  review: 'Review',
  comparison: 'Comparison',
  'best-of': 'Best-of list',
  guide: 'Guide',
  ranking: 'Ranking',
  page: 'Page',
};

export function getAdminStats(articles: AdminArticle[]): AdminStats {
  const typeCounts = new Map<ArticleType, number>();
  const catCounts = new Map<string, number>();
  const statusCounts = new Map<string, number>();

  for (const a of articles) {
    typeCounts.set(a.type, (typeCounts.get(a.type) || 0) + 1);
    if (a.category) catCounts.set(a.category, (catCounts.get(a.category) || 0) + 1);
    statusCounts.set(a.status, (statusCounts.get(a.status) || 0) + 1);
  }

  const byType = Array.from(typeCounts.entries())
    .map(([type, count]) => ({ type, label: TYPE_LABELS[type], count }))
    .sort((a, b) => b.count - a.count);

  const byCategory = Array.from(catCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const byStatus = Array.from(statusCounts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: articles.length,
    byType,
    byCategory,
    byStatus,
  };
}

export function typeLabel(type: ArticleType): string {
  return TYPE_LABELS[type];
}
