import { getArticleSeoSnapshots } from './seo-overview';
import { runAffiliateAudit } from './affiliate-audit';
import { getAllAdminArticles, isScheduledForFuture } from './admin-content';
import type { Stream } from './streams';

export type AlertSeverity = 'info' | 'warn' | 'error';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  href?: string;
  count?: number;
}

export interface AlertsResult {
  alerts: Alert[];
  generatedAt: string;
}

export async function generateAlerts(stream: Stream): Promise<AlertsResult> {
  const alerts: Alert[] = [];
  const articles = getAllAdminArticles(stream);
  const seo = getArticleSeoSnapshots(stream);
  const audit = await runAffiliateAudit(stream.id);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Articles with no target keyword
  const missingKeyword = seo.filter(s => !s.targetKeyword && s.status !== 'draft');
  if (missingKeyword.length > 0) {
    alerts.push({
      id: 'missing-keyword',
      severity: 'warn',
      title: 'Articles missing a target keyword',
      detail: `${missingKeyword.length} article${missingKeyword.length === 1 ? '' : 's'} have no target_keyword frontmatter. SEO checklist can't score them properly.`,
      href: '/admin/seo',
      count: missingKeyword.length,
    });
  }

  // Articles with poor SEO (under 60% pass)
  const lowSeo = seo.filter(s => {
    if (s.seoTotal === 0) return false;
    return s.seoPassed / s.seoTotal < 0.6;
  });
  if (lowSeo.length > 0) {
    alerts.push({
      id: 'low-seo',
      severity: 'warn',
      title: 'Low SEO scores',
      detail: `${lowSeo.length} article${lowSeo.length === 1 ? '' : 's'} below 60% on the SEO checklist.`,
      href: '/admin/seo',
      count: lowSeo.length,
    });
  }

  // Articles with poor CTA (under 60% pass) excluding rankings/guides
  const lowCta = seo.filter(s => {
    if (s.ctaTotal === 0) return false;
    if (s.type === 'guide' || s.type === 'ranking') return false;
    return s.ctaPassed / s.ctaTotal < 0.6;
  });
  if (lowCta.length > 0) {
    alerts.push({
      id: 'low-cta',
      severity: 'warn',
      title: 'Articles below CTA placement standard',
      detail: `${lowCta.length} review/comparison/best-of article${lowCta.length === 1 ? '' : 's'} below 60% on the CTA checklist.`,
      href: '/admin/seo',
      count: lowCta.length,
    });
  }

  // Scheduled in next 24h
  const goingLiveSoon = articles.filter(a => {
    if (!a.publishAt) return false;
    if (!isScheduledForFuture(a.publishAt)) return false;
    const t = Date.parse(a.publishAt);
    return !Number.isNaN(t) && t - now < dayMs;
  });
  if (goingLiveSoon.length > 0) {
    alerts.push({
      id: 'going-live-soon',
      severity: 'info',
      title: 'Articles going live in the next 24 hours',
      detail: `${goingLiveSoon.length} scheduled article${goingLiveSoon.length === 1 ? '' : 's'} flip to live within a day.`,
      href: '/admin/pipeline',
      count: goingLiveSoon.length,
    });
  }

  // Drafts older than 30 days (stale drafts)
  const stale = articles.filter(a => {
    if (a.status !== 'draft') return false;
    return true;
  });
  if (stale.length > 5) {
    alerts.push({
      id: 'stale-drafts',
      severity: 'info',
      title: 'Stale drafts piling up',
      detail: `${stale.length} drafts in the queue. Older drafts often signal work that should be killed or shipped.`,
      href: '/admin/pipeline',
      count: stale.length,
    });
  }

  // Affiliate gaps
  if (audit.uncoveredTools.length >= 5) {
    alerts.push({
      id: 'uncovered-affiliates',
      severity: 'warn',
      title: 'Affiliate gaps in published content',
      detail: `${audit.uncoveredTools.length} tools mentioned in articles have no affiliate program signed up — pure revenue leak.`,
      href: '/admin/affiliates/audit',
      count: audit.uncoveredTools.length,
    });
  }

  if (audit.programsWithoutContent.length > 0) {
    alerts.push({
      id: 'idle-affiliates',
      severity: 'info',
      title: 'Idle affiliate programs',
      detail: `${audit.programsWithoutContent.length} signed-up program${audit.programsWithoutContent.length === 1 ? '' : 's'} with zero content coverage.`,
      href: '/admin/affiliates/audit',
      count: audit.programsWithoutContent.length,
    });
  }

  return { alerts, generatedAt: new Date().toISOString() };
}

export interface OwnerDecision {
  id: string;
  title: string;
  detail: string;
  proposedAction: string;
  href: string;
}

// Things from CLAUDE.md that need Owner sign-off and aren't tracked yet.
export function getDecisionQueue(): OwnerDecision[] {
  return [
    {
      id: 'vercel-cutover',
      title: 'Domain cutover from WordPress to Vercel',
      detail: 'theaipicker.com still resolves to the WordPress install on Hostinger. Cutting over to the Next.js platform unlocks Phase 5.',
      proposedAction: 'Vercel deploy + Namecheap DNS update.',
      href: '/admin/operations',
    },
    {
      id: 'keysearch-signup',
      title: 'KeySearch subscription (~£14/mo)',
      detail: 'Phase 1 SEO research cap. Owner approval needed before signup.',
      proposedAction: 'Approve and pay the first month from operational budget.',
      href: '/admin/operations',
    },
    {
      id: 'email-platform',
      title: 'Pick an email platform (ConvertKit vs Beehiiv)',
      detail: 'Subscribers are landing in subscribers.json. Picking a real platform unlocks the newsletter send.',
      proposedAction: 'Compare and pick one — free tier first.',
      href: '/admin/subscribers',
    },
  ];
}
