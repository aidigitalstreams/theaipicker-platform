import Link from 'next/link';
import { getAllAdminArticles } from '@/lib/admin-content';
import { getActiveStream } from '@/lib/streams';
import ContentTable from './ContentTable';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const stream = await getActiveStream();
  const articles = getAllAdminArticles(stream);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Content</div>
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
