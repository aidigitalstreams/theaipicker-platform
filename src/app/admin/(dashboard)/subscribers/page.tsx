import { getSubscribers } from '@/lib/subscribers';
import { getActiveStream } from '@/lib/streams';
import { unsubscribeAction, deleteSubscriberAction } from './actions';

export const dynamic = 'force-dynamic';

const SOURCE_LABELS: Record<string, string> = {
  'comparison-builder': 'Comparison builder',
  'free-tools': 'Free tools',
  'newsletter': 'Newsletter',
  'other': 'Other',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function SubscribersPage() {
  const stream = await getActiveStream();
  const subs = (await getSubscribers(stream.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const active = subs.filter(s => s.status === 'active');
  const unsubscribed = subs.filter(s => s.status === 'unsubscribed');

  const bySource = new Map<string, number>();
  for (const s of active) bySource.set(s.source, (bySource.get(s.source) || 0) + 1);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Audience</div>
          <h1>Subscribers</h1>
        </div>
        <div className="admin-topbar-actions">
          <span className="admin-topbar-meta">
            {active.length} active · {unsubscribed.length} unsubscribed
          </span>
          {subs.length > 0 && (
            <a href="/admin/subscribers/export" className="admin-button-primary">
              Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-label">Active</div>
            <div className="admin-stat-value">{active.length}</div>
            <div className="admin-stat-delta">Receiving emails</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">From comparisons</div>
            <div className="admin-stat-value">{bySource.get('comparison-builder') ?? 0}</div>
            <div className="admin-stat-delta">Comparison builder soft prompt</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">From free tools</div>
            <div className="admin-stat-value">{bySource.get('free-tools') ?? 0}</div>
            <div className="admin-stat-delta">Partial email gate</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Newsletter</div>
            <div className="admin-stat-value">{bySource.get('newsletter') ?? 0}</div>
            <div className="admin-stat-delta">Direct signups</div>
          </div>
        </div>

        {subs.length === 0 ? (
          <div className="admin-card" style={{ marginTop: '1.25rem' }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">No subscribers yet</h2>
                <div className="admin-card-sub">
                  Emails captured from the comparison builder soft prompt and the free-tools partial gate will appear here.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-table-wrap" style={{ marginTop: '1.25rem' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Context</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.email}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                      {SOURCE_LABELS[s.source] ?? s.source}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                      {s.context ?? '—'}
                    </td>
                    <td>
                      <span className={`admin-pill status-${s.status === 'active' ? 'active' : 'paused'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(s.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        {s.status === 'active' && (
                          <form action={unsubscribeAction}>
                            <input type="hidden" name="id" value={s.id} />
                            <button
                              type="submit"
                              className="admin-button-ghost"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            >
                              Unsubscribe
                            </button>
                          </form>
                        )}
                        <form action={deleteSubscriberAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            className="admin-button-danger"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
