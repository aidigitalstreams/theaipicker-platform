import { getAllAdminArticles, getAdminStats } from '@/lib/admin-content';
import { getActiveStream } from '@/lib/streams';
import { generateAlerts, getDecisionQueue } from '@/lib/notifications';
import { getRevenueSummary } from '@/lib/affiliate-data';
import { getInboxCounts } from '@/lib/inbox';
import DashboardCardGrid, { type DashboardCardData } from './_components/DashboardCardGrid';

export const dynamic = 'force-dynamic';

function gbp(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const stream = await getActiveStream();
  const articles = getAllAdminArticles(stream);
  const stats = getAdminStats(articles);
  const [alerts, decisions, revenue, inbox] = await Promise.all([
    generateAlerts(stream),
    Promise.resolve(getDecisionQueue()),
    getRevenueSummary(stream.id),
    getInboxCounts(),
  ]);

  const publishedCount =
    stats.byStatus.find(s => s.status === 'publish' || s.status === 'published')?.count ?? 0;
  const draftCount = stats.byStatus.find(s => s.status === 'draft')?.count ?? 0;
  const errors = alerts.alerts.filter(a => a.severity === 'error').length;
  const warnings = alerts.alerts.filter(a => a.severity === 'warn').length;

  const cards: DashboardCardData[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: '◎',
      stat: {
        value: String(publishedCount),
        label: `published article${publishedCount === 1 ? '' : 's'}`,
      },
      links: [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/roadmap', label: 'Roadmap' },
        { href: '/admin/streams', label: 'Streams' },
      ],
    },
    {
      id: 'content',
      title: 'Content',
      icon: '✎',
      stat: {
        value: String(draftCount),
        label: `draft${draftCount === 1 ? '' : 's'} in queue`,
      },
      links: [
        { href: '/admin/content', label: 'All articles' },
        { href: '/admin/pipeline', label: 'Pipeline' },
      ],
    },
    {
      id: 'intelligence',
      title: 'Intelligence',
      icon: '◈',
      links: [{ href: '/admin/research', label: 'Research Hub' }],
    },
    {
      id: 'brand',
      title: 'Brand',
      icon: '◐',
      links: [{ href: '/admin/design', label: 'Design Centre' }],
    },
    {
      id: 'audience',
      title: 'Audience',
      icon: '◉',
      links: [
        { href: '/admin/subscribers', label: 'Subscribers' },
        { href: '/admin/newsletter/compose', label: 'Newsletter' },
      ],
    },
    {
      id: 'revenue',
      title: 'Revenue',
      icon: '£',
      stat: {
        value: gbp(revenue.thisMonth),
        label: 'this month',
        tone: revenue.thisMonth > 0 ? 'success' : 'default',
      },
      links: [{ href: '/admin/affiliates', label: 'Affiliates' }],
    },
    {
      id: 'insights',
      title: 'Insights',
      icon: '◆',
      stat: {
        value: String(alerts.alerts.length),
        label: `active alert${alerts.alerts.length === 1 ? '' : 's'}`,
        tone: errors > 0 ? 'danger' : warnings > 0 ? 'warning' : 'default',
      },
      links: [
        { href: '/admin/analytics', label: 'Analytics' },
        { href: '/admin/seo', label: 'SEO War Room' },
      ],
    },
    {
      id: 'operations',
      title: 'Operations',
      icon: '⚙',
      stat: {
        value: String(inbox.totalOpen),
        label: `queued job${inbox.totalOpen === 1 ? '' : 's'}`,
        tone: inbox.totalOpen > 0 ? 'warning' : 'default',
      },
      links: [
        { href: '/admin/operations', label: 'Operations Centre' },
        { href: '/admin/inbox', label: 'Inbox' },
        { href: '/admin/system-map', label: 'System map' },
        { href: '/admin/notifications', label: 'Notifications' },
        { href: '/admin/activity', label: 'Activity log' },
        { href: '/admin/claude-code', label: 'Launch Claude Code' },
      ],
    },
  ];

  return (
    <>
      <div className="admin-dashboard-hero">
        <div>
          <div className="admin-dashboard-eyebrow">{stream.name}</div>
          <h1 className="admin-dashboard-title">Control room</h1>
        </div>
        <div className="admin-dashboard-summary">
          <span>
            {alerts.alerts.length} alert{alerts.alerts.length === 1 ? '' : 's'}
          </span>
          <span className="dot" aria-hidden="true">·</span>
          <span>
            {decisions.length} decision{decisions.length === 1 ? '' : 's'} pending
          </span>
        </div>
      </div>

      <div className="admin-dashboard-content">
        <DashboardCardGrid cards={cards} />
        <p className="admin-dashboard-hint">
          Drag any card to reorder. Your layout is saved on this device.
        </p>
      </div>
    </>
  );
}
