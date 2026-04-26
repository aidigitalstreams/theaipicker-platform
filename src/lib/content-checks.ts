import type { ArticleType } from './admin-content';

export interface CheckItem {
  label: string;
  passed: boolean;
  detail?: string;
}

export interface ChecklistResult {
  items: CheckItem[];
  passedCount: number;
  totalCount: number;
}

const AFFILIATE_RE = /\[AFFILIATE:\s*[^\]]+\]/g;
const SITE_DOMAIN_RE = /https?:\/\/(?:www\.)?theaipicker\.(?:com|co\.uk)/i;

export function countAffiliateTags(text: string): number {
  return (text.match(AFFILIATE_RE) || []).length;
}

interface Section {
  heading: string;
  body: string;
}

function splitH2Sections(body: string): Section[] {
  const re = /^##\s+(.+)$/gm;
  const headings: { heading: string; start: number; afterHeading: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    headings.push({
      heading: m[1].trim(),
      start: m.index,
      afterHeading: m.index + m[0].length,
    });
  }
  return headings.map((h, i) => ({
    heading: h.heading,
    body: body.slice(h.afterHeading, i + 1 < headings.length ? headings[i + 1].start : body.length),
  }));
}

function findSections(body: string, pattern: RegExp): Section[] {
  return splitH2Sections(body).filter(s => pattern.test(s.heading));
}

function sectionCheck(label: string, body: string, pattern: RegExp): CheckItem {
  const matches = findSections(body, pattern);
  if (matches.length === 0) {
    return { label, passed: false, detail: 'Section not found' };
  }
  const ctaTotal = matches.reduce((acc, s) => acc + countAffiliateTags(s.body), 0);
  if (ctaTotal === 0) {
    return { label, passed: false, detail: `${matches.length} section${matches.length === 1 ? '' : 's'} present, 0 CTAs` };
  }
  return {
    label,
    passed: true,
    detail: `${ctaTotal} CTA${ctaTotal === 1 ? '' : 's'}`,
  };
}

export function buildCtaChecklist(
  body: string,
  type: ArticleType,
  toolCount: number,
): ChecklistResult {
  const items: CheckItem[] = [];
  const totalCtas = countAffiliateTags(body);

  if (type === 'review') {
    items.push(sectionCheck('CTA after Quick Verdict', body, /quick verdict/i));
    items.push(sectionCheck('CTA in Pricing section', body, /pricing/i));
    items.push(sectionCheck('CTA in Best-For section', body, /best for/i));
    items.push(sectionCheck('CTA in Final Verdict', body, /final verdict|verdict/i));
    items.push({
      label: 'At least 3 CTAs total',
      passed: totalCtas >= 3,
      detail: `${totalCtas} found`,
    });
  } else if (type === 'comparison') {
    items.push(sectionCheck('CTAs after Quick Verdict', body, /quick verdict/i));
    items.push(sectionCheck('CTAs in Pricing comparison', body, /pricing/i));
    items.push(sectionCheck('CTAs after "Who Should Choose" sections', body, /who should choose/i));
    items.push(sectionCheck('CTAs in Our Recommendation', body, /recommendation/i));
    const min = Math.max(6, toolCount * 3);
    items.push({
      label: `At least ${min} CTAs total`,
      passed: totalCtas >= min,
      detail: `${totalCtas} found`,
    });
  } else if (type === 'best-of') {
    items.push(sectionCheck('CTAs in Top Picks summary', body, /top picks/i));
    items.push(sectionCheck('CTA after How to Choose', body, /how to choose/i));
    const min = toolCount > 0 ? toolCount + 1 : 3;
    items.push({
      label: `At least ${min} CTAs total (1 per tool + extras)`,
      passed: totalCtas >= min,
      detail: `${totalCtas} found`,
    });
  } else {
    items.push({
      label: 'CTAs present',
      passed: totalCtas > 0,
      detail: `${totalCtas} found`,
    });
  }

  const passedCount = items.filter(i => i.passed).length;
  return { items, passedCount, totalCount: items.length };
}

interface SeoInput {
  body: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  targetKeyword: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface LinkCounts {
  internal: number;
  external: number;
}

function countLinks(body: string): LinkCounts {
  const linkRe = /\]\(([^)]+)\)/g;
  let internal = 0;
  let external = 0;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(body)) !== null) {
    const url = m[1].trim();
    if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('AFFILIATE:')) continue;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (SITE_DOMAIN_RE.test(url)) internal++;
      else external++;
    } else if (url.startsWith('/')) {
      internal++;
    }
  }
  return { internal, external };
}

function countImages(body: string): number {
  const re = /!\[[^\]]*\]\(([^)]+)\)/g;
  return (body.match(re) || []).length;
}

export function buildSeoChecklist(input: SeoInput): ChecklistResult {
  const { body, title, metaTitle, metaDescription, targetKeyword } = input;
  const items: CheckItem[] = [];
  const kw = targetKeyword.toLowerCase().trim();
  const titleLower = title.toLowerCase();
  const first100 = body.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
  const h2Matches = body.match(/^##\s+(.+)$/gm) || [];
  const h2sWithKw = kw ? h2Matches.filter(h => h.toLowerCase().includes(kw)).length : 0;
  const wordCount = countWords(body);
  const links = countLinks(body);
  const images = countImages(body);

  items.push({
    label: 'Target keyword set',
    passed: kw.length > 0,
    detail: kw ? `"${targetKeyword}"` : 'Empty',
  });
  if (kw) {
    items.push({
      label: 'Keyword in title',
      passed: titleLower.includes(kw),
    });
    items.push({
      label: 'Keyword in first 100 words',
      passed: first100.includes(kw),
    });
    items.push({
      label: 'Keyword in at least 2 H2 headings',
      passed: h2sWithKw >= 2,
      detail: `${h2sWithKw} found`,
    });
  }

  items.push({
    label: 'Meta title 1-60 chars',
    passed: metaTitle.length > 0 && metaTitle.length <= 60,
    detail: `${metaTitle.length} chars`,
  });
  items.push({
    label: 'Meta description 150-160 chars',
    passed: metaDescription.length >= 150 && metaDescription.length <= 160,
    detail: `${metaDescription.length} chars`,
  });
  items.push({
    label: 'At least 3 internal links',
    passed: links.internal >= 3,
    detail: `${links.internal} found`,
  });
  items.push({
    label: 'At least 2 external links',
    passed: links.external >= 2,
    detail: `${links.external} found`,
  });
  items.push({
    label: 'At least 3 images',
    passed: images >= 3,
    detail: `${images} found`,
  });
  items.push({
    label: 'Word count 1,500-3,000',
    passed: wordCount >= 1500 && wordCount <= 3000,
    detail: `${wordCount.toLocaleString()} words`,
  });

  const passedCount = items.filter(i => i.passed).length;
  return { items, passedCount, totalCount: items.length };
}
