import Link from 'next/link';
import NewArticleForm from './NewArticleForm';

export default function NewArticlePage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">
            <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link> · New
          </div>
          <h1>New article</h1>
        </div>
        <Link href="/admin/content" className="admin-button-ghost">Cancel</Link>
      </div>

      <div className="admin-content">
        <NewArticleForm />
      </div>
    </>
  );
}
