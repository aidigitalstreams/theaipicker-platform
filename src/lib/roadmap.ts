export type PhaseStatus = 'complete' | 'in-progress' | 'planned';

export interface PhaseItem {
  label: string;
  done: boolean;
}

export interface Phase {
  number: number;
  title: string;
  summary: string;
  items: PhaseItem[];
  status?: PhaseStatus;
}

export const PHASES: Phase[] = [
  {
    number: 1,
    title: 'Admin Dashboard Foundation',
    summary: 'Authenticated admin shell, content overview, and full article inventory sourced from the content folder.',
    items: [
      { label: 'Password-protected /admin login with cookie-based auth', done: true },
      { label: 'Dark sidebar layout isolated from public site styling', done: true },
      { label: 'Dashboard overview — totals, type and category breakdowns', done: true },
      { label: 'Content management table with type filters and search', done: true },
    ],
  },
  {
    number: 2,
    title: 'Content Management',
    summary: 'Edit, publish, and create articles directly from the admin without touching the file system.',
    status: 'in-progress',
    items: [
      { label: 'Edit article metadata from dashboard (title, category, status, scores)', done: false },
      { label: 'Publish/unpublish articles from dashboard', done: false },
      { label: 'Create new articles from dashboard', done: false },
      { label: 'Featured image management', done: false },
      { label: 'Structured data editor for scores and category data points', done: false },
    ],
  },
  {
    number: 3,
    title: 'Analytics & Revenue',
    summary: 'Connect traffic and revenue data sources so performance is visible alongside content.',
    status: 'planned',
    items: [
      { label: 'Google Analytics integration', done: false },
      { label: 'Google Search Console integration', done: false },
      { label: 'Revenue tracking per article', done: false },
      { label: 'Affiliate link click tracking', done: false },
      { label: 'Traffic dashboard with charts', done: false },
    ],
  },
  {
    number: 4,
    title: 'Publishing Pipeline',
    summary: 'Move articles from draft to live with structured review gates and pre-publish quality checks.',
    items: [
      { label: 'Draft → Review → Publish workflow with status tracking', done: false },
      { label: 'CTA verification checklist per article', done: false },
      { label: 'SEO checklist per article (keyword density, meta tags, internal links)', done: false },
      { label: 'Scheduled publishing', done: false },
    ],
  },
  {
    number: 5,
    title: 'Platform Infrastructure',
    summary: 'Cut over from WordPress to the Next.js platform and bring the supporting site systems online.',
    items: [
      { label: 'Point theaipicker.com domain from WordPress to Vercel', done: false },
      { label: 'Email capture system (comparison builder + free tools)', done: false },
      { label: 'Sitemap generation', done: false },
      { label: 'RSS feed', done: false },
    ],
  },
  {
    number: 6,
    title: 'Multi-Stream Architecture',
    summary: 'Generalise the platform so AI Digital Streams can run multiple revenue streams from a single admin.',
    items: [
      { label: 'Stream selector in admin (AI Digital Streams parent)', done: false },
      { label: 'Add new business stream from dashboard', done: false },
      { label: 'Per-stream analytics and content management', done: false },
      { label: 'Shared component library across streams', done: false },
    ],
  },
];

export function phaseStatus(phase: Phase): PhaseStatus {
  if (phase.status) return phase.status;
  if (phase.items.length === 0) return 'planned';
  const done = phase.items.filter(i => i.done).length;
  if (done === phase.items.length) return 'complete';
  if (done > 0) return 'in-progress';
  return 'planned';
}

export function phaseProgress(phase: Phase): number {
  if (phase.items.length === 0) return 0;
  const done = phase.items.filter(i => i.done).length;
  return Math.round((done / phase.items.length) * 100);
}
