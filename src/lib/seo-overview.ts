import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { buildSeoChecklist, buildCtaChecklist } from './content-checks';
import { parseStructuredData } from './content';
import { SUBDIRS, type ArticleType, type AdminArticle } from './admin-content';
import type { Stream } from './streams';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface ArticleSeoSnapshot {
  slug: string;
  title: string;
  type: ArticleType;
  category: string;
  status: string;
  targetKeyword: string;
  seoPassed: number;
  seoTotal: number;
  ctaPassed: number;
  ctaTotal: number;
  metaTitleLength: number;
  metaDescriptionLength: number;
  wordCount: number;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getArticleSeoSnapshots(stream?: Stream): ArticleSeoSnapshot[] {
  const dirs = stream ? SUBDIRS.filter(s => stream.contentDirs.includes(s.dir)) : SUBDIRS;
  const snapshots: ArticleSeoSnapshot[] = [];

  for (const { dir, type } of dirs) {
    const fullDir = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(fullDir)) continue;
    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(fullDir, file), 'utf-8');
      const { data, content } = matter(raw);
      if (!data?.title) continue;

      const targetKeyword = String(data.target_keyword ?? '');
      const metaTitle = String(data.meta_title ?? data.title ?? '');
      const metaDescription = String(data.meta_description ?? '');
      const blocks = parseStructuredData(content);

      const seo = buildSeoChecklist({
        body: content,
        title: data.title,
        metaTitle,
        metaDescription,
        targetKeyword,
      });
      const cta = buildCtaChecklist(content, type, blocks.length);

      snapshots.push({
        slug: data.slug || file.replace(/\.md$/, ''),
        title: data.title,
        type,
        category: data.category || '',
        status: data.status || 'unknown',
        targetKeyword,
        seoPassed: seo.passedCount,
        seoTotal: seo.totalCount,
        ctaPassed: cta.passedCount,
        ctaTotal: cta.totalCount,
        metaTitleLength: metaTitle.length,
        metaDescriptionLength: metaDescription.length,
        wordCount: countWords(content),
      });
    }
  }

  return snapshots;
}

export interface SeoOverview {
  total: number;
  averageSeoPercent: number;
  averageCtaPercent: number;
  fullyPassing: number;
  withoutTargetKeyword: number;
  shortMeta: number;
  longMeta: number;
}

export function summariseSeo(snapshots: ArticleSeoSnapshot[]): SeoOverview {
  if (snapshots.length === 0) {
    return {
      total: 0,
      averageSeoPercent: 0,
      averageCtaPercent: 0,
      fullyPassing: 0,
      withoutTargetKeyword: 0,
      shortMeta: 0,
      longMeta: 0,
    };
  }
  let seoSum = 0;
  let ctaSum = 0;
  let fullyPassing = 0;
  let withoutTargetKeyword = 0;
  let shortMeta = 0;
  let longMeta = 0;
  for (const s of snapshots) {
    seoSum += s.seoTotal === 0 ? 0 : (s.seoPassed / s.seoTotal) * 100;
    ctaSum += s.ctaTotal === 0 ? 0 : (s.ctaPassed / s.ctaTotal) * 100;
    if (s.seoPassed === s.seoTotal && s.ctaPassed === s.ctaTotal) fullyPassing++;
    if (!s.targetKeyword) withoutTargetKeyword++;
    if (s.metaDescriptionLength < 150) shortMeta++;
    if (s.metaDescriptionLength > 160) longMeta++;
  }
  return {
    total: snapshots.length,
    averageSeoPercent: Math.round(seoSum / snapshots.length),
    averageCtaPercent: Math.round(ctaSum / snapshots.length),
    fullyPassing,
    withoutTargetKeyword,
    shortMeta,
    longMeta,
  };
}

export function articleAdminFromSnapshot(s: ArticleSeoSnapshot): Pick<AdminArticle, 'slug' | 'title' | 'type'> {
  return { slug: s.slug, title: s.title, type: s.type };
}
