import Link from 'next/link';
import { generateAlerts, getDecisionQueue } from '@/lib/notifications';
import { getActiveStream } from '@/lib/streams';

export const dynamic = 'force-dynamic';

const SEVERITY_LABEL: Record<string, string> = {
  info: 'Info',
  warn: 'Warning',
  error: 'Error',
};

export default function NotificationsPage() {
  const stream = getActiveStream();
  const { alerts, generatedAt } = generateAlerts(stream);
  const decisions = getDecisionQueue();

  const errors = alerts.filter(a => a.severity === 'error').length;
  const warnings = alerts.filter(a => a.severity === 'warn').length;
  const infos = alerts.filter(a => a.severity === 'info').length;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Operations</div>
          <h1>Notifications</h1>
        </div>
        <div className="admin-topbar-meta">
          {alerts.length} alert{alerts.length === 1 ? '' : 's'} · {decisions.length} decision{decisions.length === 1 ? '' : 's'} pending
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-label">Errors</div>
            <div className="admin-stat-value" style={{ color: errors > 0 ? 'var(--admin-danger)' : 'var(--admin-text)' }}>{errors}</div>
            <div className="admin-stat-delta">Things actively breaking</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Warnings</div>
            <div className="admin-stat-value" style={{ color: warnings > 0 ? 'var(--admin-warning)' : 'var(--admin-text)' }}>{warnings}</div>
            <div className="admin-stat-delta">Issues to address</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Info</div>
            <div className="admin-stat-value">{infos}</div>
            <div className="admin-stat-delta">Awareness items</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Decisions pending</div>
            <div className="admin-stat-value">{decisions.length}</div>
            <div className="admin-stat-delta">Awaiting Owner approval</div>
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">System alerts</h2>
              <div className="admin-card-sub">
                Auto-generated from content + revenue + pipeline state. Last run {new Date(generatedAt).toLocaleString('en-GB')}.
              </div>
            </div>
          </div>
          {alerts.length === 0 ? (
            <div className="admin-form-help">No active alerts. The platform is happy.</div>
          ) : (
            <ul className="admin-alert-list">
              {alerts.map(a => (
                <li key={a.id} className={`admin-alert admin-alert-${a.severity}`}>
                  <div className="admin-alert-head">
                    <span className={`admin-pill severity-${a.severity}`}>{SEVERITY_LABEL[a.severity]}</span>
                    <strong className="admin-alert-title">{a.title}</strong>
                    {typeof a.count === 'number' && (
                      <span className="admin-alert-count">{a.count}</span>
                    )}
                  </div>
                  <p className="admin-alert-detail">{a.detail}</p>
                  {a.href && (
                    <Link href={a.href} className="admin-affiliate-link">View →</Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-card" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Decisions awaiting Owner</h2>
              <div className="admin-card-sub">
                Items I can't move forward on without explicit approval — see CLAUDE.md Approval Matrix.
              </div>
            </div>
          </div>
          <ul className="admin-alert-list">
            {decisions.map(d => (
              <li key={d.id} className="admin-alert admin-alert-decision">
                <div className="admin-alert-head">
                  <span className="admin-pill status-pending">Decision</span>
                  <strong className="admin-alert-title">{d.title}</strong>
                </div>
                <p className="admin-alert-detail">{d.detail}</p>
                <p className="admin-alert-detail" style={{ marginTop: '0.25rem' }}>
                  <strong>Proposed:</strong> {d.proposedAction}
                </p>
                <Link href={d.href} className="admin-affiliate-link">Open →</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
