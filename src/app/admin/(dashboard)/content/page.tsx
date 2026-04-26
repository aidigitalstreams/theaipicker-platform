import { getAllAdminArticles } from '@/lib/admin-content';
import ContentTable from './ContentTable';

export const dynamic = 'force-dynamic';

export default function ContentPage() {
  const articles = getAllAdminArticles();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">Content</div>
          <h1>All articles</h1>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
          {articles.length} total
        </div>
      </div>

      <div className="admin-content">
        <ContentTable articles={articles} />
      </div>
    </>
  );
}
