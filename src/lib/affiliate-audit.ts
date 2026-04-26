import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getAffiliates, type AffiliateProgram } from './affiliate-data';
import { parseStructuredData } from './content';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const AFFILIATE_RE = /\[AFFILIATE:\s*([^\]]+)\]/g;

export interface ToolMention {
  toolName: string;
  articleCount: number;
  affiliateLinkCount: number;
  articles: string[];
}

export interface AuditResult {
  programs: AffiliateProgram[];
  programCoverage: { program: AffiliateProgram; articleCount: number; affiliateLinkCount: number; articles: string[] }[];
  uncoveredTools: ToolMention[];
  programsWithoutContent: AffiliateProgram[];
  totalArticlesScanned: number;
}

const SUBDIRS = ['reviews', 'comparisons', 'best-of', 'guides', 'rankings'];

function normaliseToolName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export async function runAffiliateAudit(streamId?: string): Promise<AuditResult> {
  const programs = await getAffiliates(streamId);
  const programNames = new Map<string, AffiliateProgram>();
  for (const p of programs) programNames.set(normaliseToolName(p.toolName), p);

  // Scan all articles for tool mentions (Structured Data tool names + [AFFILIATE: ...] tags)
  const toolMap = new Map<string, ToolMention>();
  const programArticles = new Map<string, Set<string>>();
  const programAffiliateCounts = new Map<string, number>();
  let articlesScanned = 0;

  for (const sub of SUBDIRS) {
    const dir = path.join(CONTENT_DIR, sub);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      articlesScanned++;
      const fullPath = path.join(dir, file);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const { content } = matter(raw);
      const articleId = `${sub}/${file}`;

      const blocks = parseStructuredData(content);
      const toolsInArticle = new Set<string>();
      for (const block of blocks) {
        if (!block.toolName) continue;
        toolsInArticle.add(block.toolName);
      }

      // Affiliate link tags
      let m: RegExpExecArray | null;
      AFFILIATE_RE.lastIndex = 0;
      const affiliateNamesInArticle = new Map<string, number>();
      while ((m = AFFILIATE_RE.exec(content)) !== null) {
        const tag = m[1].trim();
        const norm = normaliseToolName(tag);
        affiliateNamesInArticle.set(norm, (affiliateNamesInArticle.get(norm) ?? 0) + 1);
        toolsInArticle.add(tag);
      }

      for (const tool of toolsInArticle) {
        const norm = normaliseToolName(tool);
        const program = programNames.get(norm);
        if (program) {
          const set = programArticles.get(program.id) ?? new Set();
          set.add(articleId);
          programArticles.set(program.id, set);
          programAffiliateCounts.set(
            program.id,
            (programAffiliateCounts.get(program.id) ?? 0) + (affiliateNamesInArticle.get(norm) ?? 0),
          );
        } else {
          const existing = toolMap.get(norm) ?? {
            toolName: tool,
            articleCount: 0,
            affiliateLinkCount: 0,
            articles: [],
          };
          existing.articleCount += 1;
          existing.affiliateLinkCount += affiliateNamesInArticle.get(norm) ?? 0;
          existing.articles.push(articleId);
          toolMap.set(norm, existing);
        }
      }
    }
  }

  const programCoverage = programs.map(p => {
    const articles = Array.from(programArticles.get(p.id) ?? []).sort();
    return {
      program: p,
      articleCount: articles.length,
      affiliateLinkCount: programAffiliateCounts.get(p.id) ?? 0,
      articles,
    };
  });

  const programsWithoutContent = programCoverage
    .filter(c => c.articleCount === 0)
    .map(c => c.program);

  const uncoveredTools = Array.from(toolMap.values())
    .filter(t => t.articleCount >= 1)
    .sort((a, b) => b.articleCount - a.articleCount || a.toolName.localeCompare(b.toolName));

  return {
    programs,
    programCoverage: programCoverage.sort((a, b) => b.articleCount - a.articleCount),
    uncoveredTools,
    programsWithoutContent,
    totalArticlesScanned: articlesScanned,
  };
}
