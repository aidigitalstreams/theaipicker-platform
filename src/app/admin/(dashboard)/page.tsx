import { getAllAdminArticles, getAdminStats } from '@/lib/admin-content';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const articles = getAllAdminArticles();
  const stats = getAdminStats(articles);

  const publishedCount = stats.byStatus.find(s => s.status === 'publish' || s.status === 'published')?.count ?? 0;
  const draftCount = stats.byStatus.find(s => s.status === 'draft')?.count ?? 0;
  const maxTypeCount = Math.max(1, ...stats.byType.map(t => t.count));
  const maxCatCount = Math.max(1, ...stats.byCategory.map(c => c.count));

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">Overview</div>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-label">Total articles</div>
            <div className="admin-stat-value">{stats.total}</div>
            <div className="admin-stat-delta">Across all content folders</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Published</div>
            <div className="admin-stat-value">{publishedCount}</div>
            <div className="admin-stat-delta">Live on the site</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Drafts</div>
            <div className="admin-stat-value">{draftCount}</div>
            <div className="admin-stat-delta">Awaiting publish</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Categories covered</div>
            <div className="admin-stat-value">{stats.byCategory.length}</div>
            <div className="admin-stat-delta">Distinct tool categories</div>
          </div>
        </div>

        <div className="admin-grid-2">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">By type</h2>
                <div className="admin-card-sub">Reviews, comparisons, best-of lists, guides, rankings</div>
              </div>
            </div>
            <div className="admin-dist">
              {stats.byType.map(row => (
                <div key={row.type}>
                  <div className="admin-dist-row">
                    <span className="admin-dist-name">{row.label}</span>
                    <span className="admin-dist-count">{row.count}</span>
                  </div>
                  <div className="admin-dist-bar" style={{ marginTop: 4 }}>
                    <div
                      className="admin-dist-bar-fill"
                      style={{ width: `${(row.count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">By category</h2>
                <div className="admin-card-sub">Tool categories covered across all articles</div>
              </div>
            </div>
            <div className="admin-dist">
              {stats.byCategory.length === 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                  No category data yet.
                </div>
              )}
              {stats.byCategory.map(row => (
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
