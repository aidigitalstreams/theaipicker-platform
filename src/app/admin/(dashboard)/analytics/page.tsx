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

export default function AnalyticsPage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">Insights</div>
          <h1>Analytics</h1>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-analytics-grid">
          <PlaceholderPanel
            title="Traffic"
            description="Sessions, unique visitors, and source breakdown"
            awaiting="Connects once Google Analytics 4 is wired up (Phase 3)."
          />
          <PlaceholderPanel
            title="Top articles"
            description="Highest traffic and revenue articles this period"
            awaiting="Combines GA4 page views with affiliate revenue per article."
          />
          <PlaceholderPanel
            title="Revenue tracker"
            description="Affiliate earnings across all programmes"
            awaiting="Manual entry first; automated via affiliate APIs where supported."
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
