import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

// Content directory — reads from the content/ folder at project root
const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface ArticleMeta {
  slug: string;
  title: string;
  type: 'post' | 'page';
  category: string;
  meta_title: string;
  meta_description: string;
  target_keyword?: string;
  status?: string;
  wp_id?: string;
  publish_at?: string;
  featured_image?: string;
}

export interface Article {
  meta: ArticleMeta;
  content: string;       // raw markdown
  htmlContent: string;    // rendered HTML
}

function isPubliclyVisible(meta: ArticleMeta, now: Date = new Date()): boolean {
  // Hide non-published articles entirely
  if (meta.status && meta.status !== 'publish' && meta.status !== 'published') return false;
  // Hide published articles whose publish_at is still in the future
  if (meta.publish_at) {
    const t = Date.parse(meta.publish_at);
    if (!Number.isNaN(t) && t > now.getTime()) return false;
  }
  return true;
}

export interface StructuredData {
  toolName: string;
  category: string;
  overallScore: number;
  corePerformance: number;
  easeOfUse: number;
  valueForMoney: number;
  outputQuality: number;
  supportReliability: number;
  priceFrom: string;
  freePlan: string;
  freePlanLimitations: string;
  bestFor: string;
  affiliateLink: string;
  lastReviewed: string;
}

/**
 * Convert markdown to HTML
 */
async function markdownToHtml(markdown: string): Promise<string> {
  // Replace [AFFILIATE: x] tags with empty string (links already have href)
  const cleaned = markdown.replace(/\s*\[AFFILIATE:\s*[^\]]*\]/g, '');

  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(cleaned);

  return result.toString();
}

/**
 * Get all markdown files from a content subdirectory
 */
function getContentFiles(subdir: string): string[] {
  const dir = path.join(CONTENT_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md'));
}

/**
 * Read and parse a single markdown file
 */
export async function getArticle(subdir: string, filename: string): Promise<Article | null> {
  const filePath = path.join(CONTENT_DIR, subdir, filename);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const htmlContent = await markdownToHtml(content);

  return {
    meta: {
      slug: data.slug || filename.replace('.md', ''),
      title: data.title || '',
      type: data.type || 'post',
      category: data.category || '',
      meta_title: data.meta_title || data.title || '',
      meta_description: data.meta_description || '',
      target_keyword: data.target_keyword,
      status: data.status,
      wp_id: data.wp_id,
      publish_at: data.publish_at,
      featured_image: data.featured_image,
    },
    content,
    htmlContent,
  };
}

/**
 * Get all articles from a content subdirectory.
 * Filters out drafts and future-scheduled articles by default.
 */
export async function getAllArticles(subdir: string, opts: { includeAll?: boolean } = {}): Promise<Article[]> {
  const files = getContentFiles(subdir);
  const articles: Article[] = [];

  for (const file of files) {
    const article = await getArticle(subdir, file);
    if (!article) continue;
    if (!opts.includeAll && !isPubliclyVisible(article.meta)) continue;
    articles.push(article);
  }

  return articles;
}

/**
 * Get article by slug from a content subdirectory.
 * Returns null for drafts and future-scheduled articles unless includeAll is set.
 */
export async function getArticleBySlug(
  subdir: string,
  slug: string,
  opts: { includeAll?: boolean } = {},
): Promise<Article | null> {
  const files = getContentFiles(subdir);

  for (const file of files) {
    const article = await getArticle(subdir, file);
    if (!article || article.meta.slug !== slug) continue;
    if (!opts.includeAll && !isPubliclyVisible(article.meta)) return null;
    return article;
  }

  return null;
}

/**
 * Get all slugs from a content subdirectory (for static generation).
 * Filters out drafts and future-scheduled articles by default.
 */
export function getAllSlugs(subdir: string, opts: { includeAll?: boolean } = {}): string[] {
  const files = getContentFiles(subdir);
  const slugs: string[] = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, subdir, f), 'utf-8');
    const { data } = matter(raw);
    if (!opts.includeAll) {
      const meta: ArticleMeta = {
        slug: data.slug || f.replace('.md', ''),
        title: data.title || '',
        type: data.type || 'post',
        category: data.category || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        status: data.status,
        publish_at: data.publish_at,
      };
      if (!isPubliclyVisible(meta)) continue;
    }
    slugs.push(data.slug || f.replace('.md', ''));
  }
  return slugs;
}

/**
 * Parse structured data from article markdown content
 */
export function parseStructuredData(content: string): StructuredData[] {
  const blocks: StructuredData[] = [];
  const sdSections = content.split('## Structured Data');

  for (let i = 1; i < sdSections.length; i++) {
    const section = sdSections[i];
    const getField = (field: string): string => {
      const match = section.match(new RegExp(`\\*\\*${field}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|`, 'm'));
      return match ? match[1].trim() : '';
    };

    const scoreStr = (field: string): number => {
      const val = getField(field);
      const num = val.match(/(\d+)/);
      return num ? parseInt(num[1]) : 0;
    };

    const toolName = getField('Tool Name');
    if (!toolName) continue;

    blocks.push({
      toolName,
      category: getField('Category'),
      overallScore: scoreStr('Overall Score'),
      corePerformance: scoreStr('Core Performance'),
      easeOfUse: scoreStr('Ease of Use'),
      valueForMoney: scoreStr('Value for Money'),
      outputQuality: scoreStr('Output Quality'),
      supportReliability: scoreStr('Support & Reliability'),
      priceFrom: getField('Price From'),
      freePlan: getField('Free Plan'),
      freePlanLimitations: getField('Free Plan Limitations'),
      bestFor: getField('Best For'),
      affiliateLink: getField('Affiliate Link'),
      lastReviewed: getField('Last Reviewed'),
    });
  }

  return blocks;
}

/**
 * Get all structured data across all content types
 */
export async function getAllStructuredData(): Promise<StructuredData[]> {
  const allData: StructuredData[] = [];

  for (const subdir of ['reviews', 'comparisons', 'best-of']) {
    const articles = await getAllArticles(subdir);
    for (const article of articles) {
      const data = parseStructuredData(article.content);
      allData.push(...data);
    }
  }

  // Deduplicate by tool name (keep latest)
  const seen = new Map<string, StructuredData>();
  for (const d of allData) {
    seen.set(d.toolName, d);
  }

  return Array.from(seen.values());
}

/**
 * Get categories with their tool counts
 */
export async function getCategories(): Promise<{ name: string; count: number; slug: string }[]> {
  const allData = await getAllStructuredData();
  const catMap = new Map<string, number>();

  for (const d of allData) {
    if (d.category) {
      catMap.set(d.category, (catMap.get(d.category) || 0) + 1);
    }
  }

  return Array.from(catMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }))
    .sort((a, b) => b.count - a.count);
}
