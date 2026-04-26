import {
  ACTIVE_TOOLS,
  PLANNED_TOOLS,
  DOMAINS,
  REVENUE_MILESTONES,
  summariseCosts,
} from '@/lib/operations';
import { getRevenueSummary } from '@/lib/affiliate-data';
import { getActiveStream } from '@/lib/streams';

export const dynamic = 'force-dynamic';

function gbp(value: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(value);
}

export default async function OperationsCentrePage() {
  const stream = await getActiveStream();
  const costs = summariseCosts();
  const revenue = await getRevenueSummary(stream.id);

  const monthlyNet = revenue.thisMonth - costs.monthlyActiveCostGbp;
  const nextMilestone = REVENUE_MILESTONES.find(m => revenue.thisMonth < m.amount);
  const milestonesReached = REVENUE_MILESTONES.filter(m => revenue.thisMonth >= m.amount).length;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Operations</div>
          <h1>Operations Centre</h1>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-label">Monthly cost (active)</div>
            <div className="admin-stat-value">{gbp(costs.monthlyActiveCostGbp)}</div>
            <div className="admin-stat-delta">{ACTIVE_TOOLS.length} tools live</div>
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
            <div className="admin-stat-delta">Revenue − active tool spend</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Milestones hit</div>
            <div className="admin-stat-value">{milestonesReached} / {REVENUE_MILESTONES.length}</div>
            <div className="admin-stat-delta">
              {nextMilestone ? `Next: ${gbp(nextMilestone.amount)}/mo` : 'All milestones cleared'}
            </div>
          </div>
        </div>

        <div className="admin-grid-2" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Active subscriptions</h2>
                <div className="admin-card-sub">
                  Total {gbp(costs.monthlyActiveCostGbp)}/month — Owner-approved running costs.
                </div>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tool</th>
                  <th style={{ textAlign: 'right' }}>Monthly</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVE_TOOLS.map(t => (
                  <tr key={t.name}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{gbp(t.monthlyCostGbp)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{t.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Planned subscriptions</h2>
                <div className="admin-card-sub">
                  Triggered by need + revenue, never the calendar. Total {gbp(costs.monthlyPlannedCostGbp)}/month if all activated.
                </div>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tool</th>
                  <th style={{ textAlign: 'right' }}>Monthly</th>
                  <th>Trigger</th>
                </tr>
              </thead>
              <tbody>
                {PLANNED_TOOLS.map(t => (
                  <tr key={t.name}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ textAlign: 'right' }}>{gbp(t.monthlyCostGbp)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{t.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Domain assets</h2>
              <div className="admin-card-sub">
                Combined {gbp(costs.annualDomainsGbp)}/year across {DOMAINS.length} domains.
              </div>
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Registrar</th>
                <th style={{ textAlign: 'right' }}>Annual</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {DOMAINS.map(d => (
                <tr key={d.domain}>
                  <td style={{ fontWeight: 600 }}>{d.domain}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{d.registrar}</td>
                  <td style={{ textAlign: 'right' }}>{gbp(d.annualCostGbp)}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{d.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-card" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Revenue milestones</h2>
              <div className="admin-card-sub">CLAUDE.md §7. Each tier triggers a specific business action.</div>
            </div>
          </div>
          <ul className="admin-milestone-list">
            {REVENUE_MILESTONES.map(m => {
              const reached = revenue.thisMonth >= m.amount;
              return (
                <li key={m.amount} className={`admin-milestone ${reached ? 'reached' : ''}`}>
                  <span className="admin-milestone-amount">{gbp(m.amount)}</span>
                  <span className="admin-milestone-label">{m.label}</span>
                  <span className="admin-milestone-state">{reached ? 'reached' : 'pending'}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
