import Link from 'next/link';
import { getAllAdminArticles, getAdminStats } from '@/lib/admin-content';
import { getActiveStream } from '@/lib/streams';
import { generateAlerts, getDecisionQueue } from '@/lib/notifications';
import { getRevenueSummary } from '@/lib/affiliate-data';
import { getActivity, ACTIVITY_KIND_LABELS, ACTIVITY_GROUPS } from '@/lib/activity';
import { summariseCosts } from '@/lib/operations';

export const dynamic = 'force-dynamic';

const KIND_TO_GROUP: Record<string, string> = Object.fromEntries(
  ACTIVITY_GROUPS.map(g => [g.kind, g.group]),
);

function gbp(value: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(value);
}

function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const min = Math.round(diff / (60 * 1000));
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

export default async function DashboardPage() {
  const stream = await getActiveStream();
  const articles = getAllAdminArticles(stream);
  const stats = getAdminStats(articles);
  const alerts = await generateAlerts(stream);
  const decisions = getDecisionQueue();
  const revenue = await getRevenueSummary(stream.id);
  const costs = summariseCosts();
  const recent = await getActivity(stream.id, { limit: 8 });

  const publishedCount = stats.byStatus.find(s => s.status === 'publish' || s.status === 'published')?.count ?? 0;
  const draftCount = stats.byStatus.find(s => s.status === 'draft')?.count ?? 0;
  const monthlyNet = revenue.thisMonth - costs.monthlyActiveCostGbp;
  const errors = alerts.alerts.filter(a => a.severity === 'error').length;
  const warnings = alerts.alerts.filter(a => a.severity === 'warn').length;
  const maxCatCount = Math.max(1, ...stats.byCategory.map(c => c.count));

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Overview</div>
          <h1>Dashboard</h1>
        </div>
        <div className="admin-topbar-meta">
          {alerts.alerts.length} alert{alerts.alerts.length === 1 ? '' : 's'} · {decisions.length} decision{decisions.length === 1 ? '' : 's'} pending
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-label">Published</div>
            <div className="admin-stat-value">{publishedCount}</div>
            <div className="admin-stat-delta">{draftCount} draft{draftCount === 1 ? '' : 's'} in queue</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Revenue (month)</div>
            <div className="admin-stat-value">{gbp(revenue.thisMonth)}</div>
            <div className="admin-stat-delta">All-time {gbp(revenue.totalAllTime)}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Net (month)</div>
            <div
              className="admin-stat-value"
              style={{ color: monthlyNet >= 0 ? 'var(--admin-success)' : 'var(--admin-danger)' }}
            >
              {gbp(monthlyNet)}
            </div>
            <div className="admin-stat-delta">Revenue − active spend</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Active alerts</div>
            <div
              className="admin-stat-value"
              style={{ color: errors > 0 ? 'var(--admin-danger)' : warnings > 0 ? 'var(--admin-warning)' : 'var(--admin-text)' }}
            >
              {alerts.alerts.length}
            </div>
            <div className="admin-stat-delta">{errors} error · {warnings} warn</div>
          </div>
        </div>

        <div className="admin-grid-2">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Top alerts</h2>
                <div className="admin-card-sub">Surface from /admin/notifications.</div>
              </div>
              <Link href="/admin/notifications" className="admin-affiliate-link">View all →</Link>
            </div>
            {alerts.alerts.length === 0 ? (
              <div className="admin-form-help">No alerts. Everything looks clean.</div>
            ) : (
              <ul className="admin-alert-list">
                {alerts.alerts.slice(0, 4).map(a => (
                  <li key={a.id} className={`admin-alert admin-alert-${a.severity}`}>
                    <div className="admin-alert-head">
                      <strong className="admin-alert-title">{a.title}</strong>
                      {typeof a.count === 'number' && (
                        <span className="admin-alert-count">{a.count}</span>
                      )}
                    </div>
                    <p className="admin-alert-detail">{a.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Decisions awaiting Owner</h2>
                <div className="admin-card-sub">Items I can&apos;t move forward without explicit approval.</div>
              </div>
              <Link href="/admin/notifications" className="admin-affiliate-link">View all →</Link>
            </div>
            <ul className="admin-alert-list">
              {decisions.slice(0, 3).map(d => (
                <li key={d.id} className="admin-alert admin-alert-decision">
                  <div className="admin-alert-head">
                    <strong className="admin-alert-title">{d.title}</strong>
                  </div>
                  <p className="admin-alert-detail">{d.proposedAction}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="admin-grid-2" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Recent activity</h2>
                <div className="admin-card-sub">Latest 8 events across this stream.</div>
              </div>
              <Link href="/admin/activity" className="admin-affiliate-link">View all →</Link>
            </div>
            {recent.length === 0 ? (
              <div className="admin-form-help">
                Saves, publishes, deletes, signups, and sends will appear here as they happen.
              </div>
            ) : (
              <ul className="admin-activity-entries">
                {recent.map(e => (
                  <li key={e.id} className="admin-activity-entry">
                    <div className="admin-activity-entry-time">{relativeTime(e.at)}</div>
                    <div className="admin-activity-entry-body">
                      <div className="admin-activity-entry-head">
                        <span className={`admin-pill kind-${KIND_TO_GROUP[e.kind]?.toLowerCase() ?? 'other'}`}>
                          {ACTIVITY_KIND_LABELS[e.kind] ?? e.kind}
                        </span>
                        <strong className="admin-activity-entry-subject">{e.subject}</strong>
                      </div>
                      {e.detail && <div className="admin-activity-entry-detail">{e.detail}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Category coverage</h2>
                <div className="admin-card-sub">{stats.byCategory.length} distinct categor{stats.byCategory.length === 1 ? 'y' : 'ies'}.</div>
              </div>
            </div>
            <div className="admin-dist">
              {stats.byCategory.length === 0 && (
                <div className="admin-form-help">No category data yet.</div>
              )}
              {stats.byCategory.slice(0, 8).map(row => (
                <div key={row.name}>
                  <div className="admin-dist-row">
                    <span className="admin-dist-name">{row.name}</span>
                    <span className="admin-dist-count">{row.count}</span>
                  </div>
                  <div className="admin-dist-bar" style={{ marginTop: 4 }}>
                    <div
                      className="admin-dist-bar-fill"
                      style={{ width: `${(row.count / maxCatCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
