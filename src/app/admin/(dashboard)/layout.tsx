import AdminNav from './_components/AdminNav';
import { logoutAction } from '../login/actions';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          AI Digital Streams
          <span className="small">Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">Overview</div>
          <AdminNav href="/admin" exact label="Dashboard" />
          <AdminNav href="/admin/roadmap" label="Roadmap" />

          <div className="admin-nav-section">Content</div>
          <AdminNav href="/admin/content" label="All articles" />
          <AdminNav href="/admin/pipeline" label="Pipeline" />

          <div className="admin-nav-section">Revenue</div>
          <AdminNav href="/admin/affiliates" label="Affiliates" />

          <div className="admin-nav-section">Insights</div>
          <AdminNav href="/admin/analytics" label="Analytics" />
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
