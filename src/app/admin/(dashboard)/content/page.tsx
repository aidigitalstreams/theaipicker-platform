import Link from 'next/link';
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
        <div className="admin-topbar-actions">
          <span className="admin-topbar-meta">{articles.length} total</span>
          <Link href="/admin/content/new" className="admin-button-primary">
            <span aria-hidden="true">+</span> New article
          </Link>
        </div>
      </div>

      <div className="admin-content">
        <ContentTable articles={articles} />
      </div>
    </>
  );
}
