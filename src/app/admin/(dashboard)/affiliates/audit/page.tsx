import Link from 'next/link';
import { runAffiliateAudit } from '@/lib/affiliate-audit';
import { getActiveStream } from '@/lib/streams';

export const dynamic = 'force-dynamic';

export default function AffiliateAuditPage() {
  const stream = getActiveStream();
  const audit = runAffiliateAudit(stream.id);

  const programsActive = audit.programs.filter(p => p.status === 'active').length;
  const totalCoveredLinks = audit.programCoverage.reduce((acc, c) => acc + c.affiliateLinkCount, 0);
  const totalUncoveredMentions = audit.uncoveredTools.reduce((acc, t) => acc + t.articleCount, 0);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">
            {stream.name} ·{' '}
            <Link href="/admin/affiliates" className="admin-breadcrumb-link">Affiliates</Link>
          </div>
          <h1>Affiliate audit</h1>
        </div>
        <div className="admin-topbar-meta">
          {audit.totalArticlesScanned} articles scanned
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-label">Active programs</div>
            <div className="admin-stat-value">{programsActive}</div>
            <div className="admin-stat-delta">{audit.programs.length} total</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Affiliate links live</div>
            <div className="admin-stat-value">{totalCoveredLinks}</div>
            <div className="admin-stat-delta">[AFFILIATE:] tags pointing at signed-up programs</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Uncovered mentions</div>
            <div className="admin-stat-value" style={{ color: 'var(--admin-warning)' }}>
              {totalUncoveredMentions}
            </div>
            <div className="admin-stat-delta">Tool mentions in content with no affiliate program</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Idle programs</div>
            <div className="admin-stat-value" style={{ color: audit.programsWithoutContent.length > 0 ? 'var(--admin-danger)' : 'var(--admin-text)' }}>
              {audit.programsWithoutContent.length}
            </div>
            <div className="admin-stat-delta">Programs with zero content coverage</div>
          </div>
        </div>

        <div className="admin-grid-2" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Program coverage</h2>
                <div className="admin-card-sub">How many articles each program shows up in.</div>
              </div>
            </div>
            {audit.programCoverage.length === 0 ? (
              <div className="admin-form-help">
                No affiliate programs yet. <Link href="/admin/affiliates" className="admin-breadcrumb-link">Add your first program</Link>.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Articles</th>
                    <th style={{ textAlign: 'right' }}>Links</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.programCoverage.map(c => (
                    <tr key={c.program.id}>
                      <td style={{ fontWeight: 600 }}>{c.program.toolName}</td>
                      <td>
                        <span className={`admin-pill status-${c.program.status}`}>{c.program.status}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {c.articleCount === 0
                          ? <span style={{ color: 'var(--admin-warning)' }}>0</span>
                          : c.articleCount}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--admin-text-muted)' }}>
                        {c.affiliateLinkCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Uncovered mentions</h2>
                <div className="admin-card-sub">Tools showing up in content with no affiliate program signed up.</div>
              </div>
            </div>
            {audit.uncoveredTools.length === 0 ? (
              <div className="admin-form-help">No gaps — every tool in published content has a matching affiliate program.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th style={{ textAlign: 'right' }}>Articles</th>
                    <th style={{ textAlign: 'right' }}>[AFFILIATE:] tags</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.uncoveredTools.slice(0, 30).map(t => (
                    <tr key={t.toolName}>
                      <td style={{ fontWeight: 600 }}>{t.toolName}</td>
                      <td style={{ textAlign: 'right' }}>{t.articleCount}</td>
                      <td style={{ textAlign: 'right', color: t.affiliateLinkCount > 0 ? 'var(--admin-warning)' : 'var(--admin-text-muted)' }}>
                        {t.affiliateLinkCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {audit.programsWithoutContent.length > 0 && (
          <div className="admin-card" style={{ marginTop: '1.25rem' }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Idle programs</h2>
                <div className="admin-card-sub">
                  We have these programs but no content links to them. Either write a review or pause the program.
                </div>
              </div>
            </div>
            <div className="admin-stream-dir-pills">
              {audit.programsWithoutContent.map(p => (
                <span key={p.id} className={`admin-pill status-${p.status}`}>{p.toolName}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
