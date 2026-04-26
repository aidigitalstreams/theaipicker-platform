import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface ImageAsset {
  filename: string;
  path: string;
  sizeBytes: number;
  modified: string;
  usedBy: string[];
}

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

export function listImageAssets(): ImageAsset[] {
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) return [];

  const files = fs.readdirSync(PUBLIC_IMAGES_DIR, { withFileTypes: true })
    .filter(d => d.isFile() && IMAGE_EXTS.includes(path.extname(d.name).toLowerCase()))
    .map(d => d.name);

  // Build a usage map by scanning frontmatter for featured_image
  const usageMap = new Map<string, string[]>();
  const subdirs = ['reviews', 'comparisons', 'best-of', 'guides', 'rankings', 'pages'];
  for (const sub of subdirs) {
    const dir = path.join(CONTENT_DIR, sub);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        const { data } = matter(raw);
        const featured = typeof data.featured_image === 'string' ? data.featured_image : '';
        if (!featured) continue;
        const fname = featured.split('/').pop();
        if (!fname) continue;
        const list = usageMap.get(fname) ?? [];
        list.push(`${sub}/${file}`);
        usageMap.set(fname, list);
      } catch {
        /* skip */
      }
    }
  }

  return files.map(name => {
    const full = path.join(PUBLIC_IMAGES_DIR, name);
    const stat = fs.statSync(full);
    return {
      filename: name,
      path: `/images/${name}`,
      sizeBytes: stat.size,
      modified: stat.mtime.toISOString(),
      usedBy: usageMap.get(name) ?? [],
    };
  }).sort((a, b) => a.filename.localeCompare(b.filename));
}

export interface BrandPalette {
  name: string;
  hex: string;
  role: string;
}

export const BRAND_PALETTE: BrandPalette[] = [
  { name: 'Trust blue', hex: '#2563EB', role: 'Primary — links, primary CTAs, focus rings' },
  { name: 'Action green', hex: '#10B981', role: 'Secondary — success states, positive scores' },
  { name: 'Highlight amber', hex: '#F59E0B', role: 'Accent — warnings, mid scores, badges' },
  { name: 'Alert red', hex: '#EF4444', role: 'Errors, low scores, destructive actions' },
  { name: 'Ink', hex: '#0F172A', role: 'Body text, headings' },
  { name: 'Mist', hex: '#F8FAFC', role: 'Page background' },
  { name: 'Edge', hex: '#E2E8F0', role: 'Borders, dividers' },
];

export const BRAND_TYPE = {
  primaryFamily: 'Inter',
  fallback: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  scale: ['0.75rem (xs)', '0.875rem (sm)', '1rem (base)', '1.125rem (lg)', '1.5rem (xl)', '2rem (2xl)', '3rem (3xl)'],
};

export const VOICE_RULES: { rule: string; detail: string }[] = [
  { rule: 'Research-based language only', detail: '"We researched", "we compared", "based on our analysis" — never "we tested" or "in our experience" unless we genuinely have hands-on experience.' },
  { rule: 'British English spellings', detail: 'optimise, colour, behaviour, organisation, programme.' },
  { rule: 'Strong opinions backed by evidence', detail: 'No fence-sitting. Make a clear recommendation, then show the working.' },
  { rule: 'Short paragraphs', detail: '2–3 sentences max. Subheadings every 200–300 words.' },
  { rule: 'Comparison tables in every VS article', detail: 'Pricing, features, factor scores. Tables beat prose for skimmers.' },
];
