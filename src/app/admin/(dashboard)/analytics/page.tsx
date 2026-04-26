import { getRevenueEntries, getRevenueSummary } from '@/lib/affiliate-data';
import { getActiveStream } from '@/lib/streams';
import RevenueEntryForm from './RevenueEntryForm';
import { deleteRevenueAction } from './actions';

export const dynamic = 'force-dynamic';

interface PanelProps {
  title: string;
  description: string;
  awaiting: string;
}

function PlaceholderPanel({ title, description, awaiting }: PanelProps) {
  return (
    <div className="admin-card admin-analytics-panel">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">{title}</h2>
          <div className="admin-card-sub">{description}</div>
        </div>
        <span className="admin-pill status-draft">Coming soon</span>
      </div>
      <div className="admin-analytics-placeholder">
        <div className="admin-analytics-placeholder-bars" aria-hidden="true">
          <span style={{ height: '38%' }} />
          <span style={{ height: '62%' }} />
          <span style={{ height: '46%' }} />
          <span style={{ height: '78%' }} />
          <span style={{ height: '54%' }} />
          <span style={{ height: '70%' }} />
          <span style={{ height: '40%' }} />
        </div>
        <p className="admin-analytics-placeholder-note">{awaiting}</p>
      </div>
    </div>
  );
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export default async function AnalyticsPage() {
  const stream = await getActiveStream();
  const entries = (await getRevenueEntries(stream.id)).sort((a, b) => b.date.localeCompare(a.date));
  const summary = await getRevenueSummary(stream.id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Insights</div>
          <h1>Analytics</h1>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-card admin-revenue-card" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Revenue tracker</h2>
              <div className="admin-card-sub">Manual entry until affiliate APIs are wired up.</div>
            </div>
          </div>

          <div className="admin-revenue-stats">
            <div className="admin-stat">
              <div className="admin-stat-label">All time</div>
              <div className="admin-stat-value">
                {formatMoney(summary.totalAllTime, summary.currency)}
              </div>
              <div className="admin-stat-delta">{entries.length} entr{entries.length === 1 ? 'y' : 'ies'}</div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat-label">This month</div>
              <div className="admin-stat-value">
                {formatMoney(summary.thisMonth, summary.currency)}
              </div>
              <div className="admin-stat-delta">{today.slice(0, 7)}</div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat-label">Top source</div>
              <div className="admin-stat-value" style={{ fontSize: '1.25rem' }}>
                {summary.byTool[0]?.toolName ?? '—'}
              </div>
              <div className="admin-stat-delta">
                {summary.byTool[0]
                  ? formatMoney(summary.byTool[0].total, summary.currency)
                  : 'No revenue logged yet'}
              </div>
            </div>
          </div>

          <RevenueEntryForm defaultDate={today} />

          {entries.length > 0 && (
            <div className="admin-revenue-list">
              <div className="admin-revenue-list-head">Recent entries</div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Notes</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 25).map(e => (
                    <tr key={e.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{e.date}</td>
                      <td>{e.toolName}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatMoney(e.amount, e.currency)}
                      </td>
                      <td style={{ color: 'var(--admin-text-muted)' }}>{e.notes ?? '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <form action={deleteRevenueAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <button type="submit" className="admin-button-ghost admin-revenue-delete">
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-analytics-grid">
          <PlaceholderPanel
            title="Traffic"
            description="Sessions, unique visitors, and source breakdown"
            awaiting="Connects once Google Analytics 4 is wired up."
          />
          <PlaceholderPanel
            title="Top articles"
            description="Highest traffic and revenue articles this period"
            awaiting="Combines GA4 page views with affiliate revenue per article."
          />
          <PlaceholderPanel
            title="Affiliate performance"
            description="Click-through and conversion rate per affiliate link"
            awaiting="Hooks into outbound link tracking once instrumented."
          />
        </div>
      </div>
    </>
  );
}
