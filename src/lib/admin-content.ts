import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { parseStructuredData, type StructuredData } from './content';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export type ArticleType = 'review' | 'comparison' | 'best-of' | 'guide' | 'ranking' | 'page';

export type EditableArticleType = Exclude<ArticleType, 'page'>;

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

export const SUBDIRS: { dir: string; type: ArticleType }[] = [
  { dir: 'reviews', type: 'review' },
  { dir: 'comparisons', type: 'comparison' },
  { dir: 'best-of', type: 'best-of' },
  { dir: 'guides', type: 'guide' },
  { dir: 'rankings', type: 'ranking' },
];

export function subdirForType(type: EditableArticleType): string {
  const entry = SUBDIRS.find(s => s.type === type);
  if (!entry) throw new Error(`Unknown article type: ${type}`);
  return entry.dir;
}

export function frontmatterDocType(type: EditableArticleType): 'post' | 'page' {
  return type === 'ranking' ? 'page' : 'post';
}

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

export interface AdminArticleFull {
  meta: AdminArticle;
  frontmatter: Record<string, unknown>;
  body: string;
  structuredData: StructuredData[];
}

export function getAdminArticleBySlug(slug: string): AdminArticleFull | null {
  for (const { dir, type } of SUBDIRS) {
    const fullDir = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(fullDir)) continue;
    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(fullDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(raw);
      const articleSlug = data.slug || file.replace(/\.md$/, '');
      if (articleSlug !== slug) continue;
      const meta = readArticle(dir, type, file);
      if (!meta) return null;
      return {
        meta,
        frontmatter: { ...data },
        body: content,
        structuredData: parseStructuredData(content),
      };
    }
  }
  return null;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSlug(slug: string): string | null {
  if (!slug) return 'Slug is required.';
  if (!SLUG_PATTERN.test(slug)) {
    return 'Slug must be lowercase letters, numbers, and single hyphens only.';
  }
  return null;
}

export function slugIsTaken(slug: string, ignoreFile?: { subdir: string; filename: string }): boolean {
  for (const { dir } of SUBDIRS) {
    const fullDir = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(fullDir)) continue;
    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      if (ignoreFile && ignoreFile.subdir === dir && ignoreFile.filename === file) continue;
      const raw = fs.readFileSync(path.join(fullDir, file), 'utf-8');
      const { data } = matter(raw);
      const existing = data.slug || file.replace(/\.md$/, '');
      if (existing === slug) return true;
    }
  }
  return false;
}

export interface SaveArticleInput {
  type: EditableArticleType;
  slug: string;
  title: string;
  category: string;
  status: 'draft' | 'publish';
  targetKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  body: string;
  preserveFrontmatter?: Record<string, unknown>;
  existing?: { subdir: string; filename: string };
}

export function saveArticle(input: SaveArticleInput): { subdir: string; filename: string } {
  const subdir = subdirForType(input.type);
  const filename = `${input.slug}.md`;
  const fullDir = path.join(CONTENT_DIR, subdir);
  const fullPath = path.join(fullDir, filename);

  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }

  const preserved = { ...(input.preserveFrontmatter || {}) };
  const featuredImage =
    input.featuredImage !== undefined ? input.featuredImage : (preserved.featured_image as string | undefined) ?? '';
  const frontmatter: Record<string, unknown> = {
    ...preserved,
    title: input.title,
    slug: input.slug,
    type: frontmatterDocType(input.type),
    status: input.status,
    meta_title: input.metaTitle ?? preserved.meta_title ?? input.title,
    meta_description: input.metaDescription ?? preserved.meta_description ?? '',
    target_keyword: input.targetKeyword ?? preserved.target_keyword ?? '',
    category: input.category,
    wp_id: preserved.wp_id ?? '',
  };
  if (featuredImage) {
    frontmatter.featured_image = featuredImage;
  } else {
    delete frontmatter.featured_image;
  }

  const output = matter.stringify(input.body, frontmatter);
  fs.writeFileSync(fullPath, output, 'utf-8');

  if (input.existing) {
    const oldPath = path.join(CONTENT_DIR, input.existing.subdir, input.existing.filename);
    if (oldPath !== fullPath && fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  return { subdir, filename };
}

export function deleteArticle(subdir: string, filename: string): void {
  const fullPath = path.join(CONTENT_DIR, subdir, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export const SCORE_WEIGHTS = {
  corePerformance: 0.30,
  easeOfUse: 0.20,
  valueForMoney: 0.25,
  outputQuality: 0.15,
  supportReliability: 0.10,
} as const;

export interface FactorScores {
  corePerformance: number;
  easeOfUse: number;
  valueForMoney: number;
  outputQuality: number;
  supportReliability: number;
}

export function computeOverallScore(s: FactorScores): number {
  const weighted =
    s.corePerformance * SCORE_WEIGHTS.corePerformance +
    s.easeOfUse * SCORE_WEIGHTS.easeOfUse +
    s.valueForMoney * SCORE_WEIGHTS.valueForMoney +
    s.outputQuality * SCORE_WEIGHTS.outputQuality +
    s.supportReliability * SCORE_WEIGHTS.supportReliability;
  return Math.round(weighted);
}

export interface StructuredDataUpdate extends FactorScores {
  bestFor: string;
  priceFrom: string;
  freePlan: string;
}

function replaceStructuredField(section: string, field: string, value: string): string {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(\\|\\s*\\*\\*${escaped}\\*\\*\\s*\\|\\s*)([^|\\n]*?)(\\s*\\|)`);
  return section.replace(re, (_m, p1, _p2, p3) => `${p1}${value}${p3}`);
}

export function applyStructuredDataUpdates(body: string, updates: StructuredDataUpdate[]): string {
  if (!updates.length) return body;
  const sections = body.split('## Structured Data');
  for (let i = 1; i < sections.length; i++) {
    const update = updates[i - 1];
    if (!update) continue;
    const overall = computeOverallScore(update);
    let s = sections[i];
    s = replaceStructuredField(s, 'Overall Score', `${overall}/100`);
    s = replaceStructuredField(s, 'Core Performance', `${update.corePerformance}/100`);
    s = replaceStructuredField(s, 'Ease of Use', `${update.easeOfUse}/100`);
    s = replaceStructuredField(s, 'Value for Money', `${update.valueForMoney}/100`);
    s = replaceStructuredField(s, 'Output Quality', `${update.outputQuality}/100`);
    s = replaceStructuredField(s, 'Support & Reliability', `${update.supportReliability}/100`);
    s = replaceStructuredField(s, 'Best For', update.bestFor);
    s = replaceStructuredField(s, 'Price From', update.priceFrom);
    s = replaceStructuredField(s, 'Free Plan', update.freePlan);
    sections[i] = s;
  }
  return sections.join('## Structured Data');
}
