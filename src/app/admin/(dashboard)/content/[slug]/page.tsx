import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminArticleBySlug, typeLabel } from '@/lib/admin-content';
import EditArticleForm from './EditArticleForm';
import DeleteArticleButton from './DeleteArticleButton';
import { togglePublishAction } from './actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditArticlePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const article = getAdminArticleBySlug(slug);
  if (!article) notFound();

  const isPublished = article.meta.status === 'publish';

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">
            <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link> · {typeLabel(article.meta.type)}
          </div>
          <h1>{article.meta.title}</h1>
        </div>
        <div className="admin-topbar-actions">
          <form action={togglePublishAction}>
            <input type="hidden" name="originalSlug" value={article.meta.slug} />
            <button
              type="submit"
              className={isPublished ? 'admin-button-ghost' : 'admin-button-success'}
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </form>
          <Link href="/admin/content" className="admin-button-ghost">Back</Link>
        </div>
      </div>

      <div className="admin-content">
        {saved === '1' && (
          <div className="admin-form-success" role="status">Saved.</div>
        )}

        <EditArticleForm
          slug={article.meta.slug}
          title={article.meta.title}
          type={article.meta.type}
          category={article.meta.category}
          status={article.meta.status}
          targetKeyword={article.meta.targetKeyword}
          metaTitle={String(article.frontmatter.meta_title ?? '')}
          metaDescription={String(article.frontmatter.meta_description ?? '')}
          featuredImage={String(article.frontmatter.featured_image ?? '')}
          body={article.body}
          structuredData={article.structuredData}
          subdir={article.meta.subdir}
          filename={article.meta.filename}
        />

        <div className="admin-form-section admin-form-section-wide admin-form-danger">
          <h2 className="admin-form-section-title">Danger zone</h2>
          <p className="admin-form-help" style={{ marginBottom: '0.75rem' }}>
            Deleting an article removes its markdown file from <code>content/{article.meta.subdir}/{article.meta.filename}</code>. This cannot be undone from the admin.
          </p>
          <DeleteArticleButton slug={article.meta.slug} title={article.meta.title} />
        </div>
      </div>
    </>
  );
}
