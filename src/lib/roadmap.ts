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
    status: 'complete',
    items: [
      { label: 'Edit article metadata from dashboard (title, category, status, scores)', done: true },
      { label: 'Publish/unpublish articles from dashboard', done: true },
      { label: 'Create new articles from dashboard', done: true },
      { label: 'Featured image management', done: true },
      { label: 'Structured data editor for scores and category data points', done: true },
    ],
  },
  {
    number: 3,
    title: 'Analytics & Revenue',
    summary: 'Affiliate program manager and manual revenue tracking so income is visible inside the admin from day one.',
    status: 'complete',
    items: [
      { label: 'Affiliate program manager with CRUD', done: true },
      { label: 'Manual revenue entry stored in content/data/revenue.json', done: true },
      { label: 'Monthly revenue summary on /admin/analytics', done: true },
      { label: 'Affiliates section in admin sidebar', done: true },
      { label: 'Placeholders for traffic / top articles / affiliate performance', done: true },
    ],
  },
  {
    number: 4,
    title: 'Publishing Pipeline',
    summary: 'Move articles from draft to live with structured review gates and pre-publish quality checks.',
    status: 'complete',
    items: [
      { label: 'Draft → Review → Publish workflow with status tracking', done: true },
      { label: 'CTA verification checklist per article', done: true },
      { label: 'SEO checklist per article (keyword density, meta tags, internal links)', done: true },
      { label: 'Scheduled publishing via publish_at frontmatter', done: true },
    ],
  },
  {
    number: 5,
    title: 'Platform Infrastructure',
    summary: 'Cut over from WordPress to the Next.js platform and bring the supporting site systems online.',
    status: 'in-progress',
    items: [
      { label: 'Point theaipicker.com domain from WordPress to Vercel', done: false },
      { label: 'Email capture system (comparison builder + free tools)', done: false },
      { label: 'Sitemap generation', done: true },
      { label: 'RSS feed', done: true },
      { label: 'robots.txt blocking /admin', done: true },
    ],
  },
  {
    number: 6,
    title: 'Multi-Stream Architecture',
    summary: 'Generalise the platform so AI Digital Streams can run multiple revenue streams from a single admin.',
    status: 'in-progress',
    items: [
      { label: 'Stream interface + JSON config in content/data/streams.json', done: true },
      { label: 'Stream selector in admin sidebar', done: true },
      { label: 'Stream-aware dashboard, content, and pipeline pages', done: true },
      { label: 'Add / edit / delete streams from /admin/streams', done: true },
      { label: 'Per-stream affiliates and revenue tracking', done: true },
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
