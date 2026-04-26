import AdminNav from './_components/AdminNav';
import StreamSelector from './_components/StreamSelector';
import { logoutAction } from '../login/actions';
import { listStreams, getActiveStreamId } from '@/lib/streams';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const streams = listStreams();
  const activeStreamId = getActiveStreamId();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          AI Digital Streams
          <span className="small">Admin</span>
        </div>

        <StreamSelector streams={streams} activeStreamId={activeStreamId} />

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">Overview</div>
          <AdminNav href="/admin" exact label="Dashboard" />
          <AdminNav href="/admin/roadmap" label="Roadmap" />
          <AdminNav href="/admin/streams" label="Streams" />

          <div className="admin-nav-section">Content</div>
          <AdminNav href="/admin/content" label="All articles" />
          <AdminNav href="/admin/pipeline" label="Pipeline" />

          <div className="admin-nav-section">Intelligence</div>
          <AdminNav href="/admin/research" label="Research Hub" />

          <div className="admin-nav-section">Brand</div>
          <AdminNav href="/admin/design" label="Design Centre" />

          <div className="admin-nav-section">Audience</div>
          <AdminNav href="/admin/subscribers" label="Subscribers" />

          <div className="admin-nav-section">Revenue</div>
          <AdminNav href="/admin/affiliates" label="Affiliates" />

          <div className="admin-nav-section">Insights</div>
          <AdminNav href="/admin/analytics" label="Analytics" />
          <AdminNav href="/admin/seo" label="SEO War Room" />
        </nav>

        <div className="admin-sidebar-footer">
          <form action={logoutAction}>
            <button type="submit" className="admin-logout-button">Sign out</button>
          </form>
        </div>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}
