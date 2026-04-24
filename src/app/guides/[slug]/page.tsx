import { getArticleBySlug, getAllSlugs } from '@/lib/content';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs('guides');
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug('guides', slug);
  if (!article) return {};

  return {
    title: article.meta.meta_title || article.meta.title,
    description: article.meta.meta_description,
    openGraph: {
      title: article.meta.meta_title || article.meta.title,
      description: article.meta.meta_description,
      type: 'article',
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug('guides', slug);

  if (!article) notFound();

  return (
    <article style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
        <a href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</a>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <a href="/guides" style={{ color: '#94A3B8', textDecoration: 'none' }}>Guides</a>
      </nav>

      {/* Title */}
      <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem', color: '#1E293B' }}>
        {article.meta.title}
      </h1>

      {/* Category badge */}
      {article.meta.category && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
          <span style={{ background: '#DBEAFE', color: '#2563EB', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 500 }}>
            {article.meta.category}
          </span>
        </div>
      )}

      {/* Affiliate disclosure */}
      <div style={{ background: '#F1F5F9', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '2rem', fontSize: '0.8125rem', color: '#64748B', fontStyle: 'italic' }}>
        Disclosure: We earn a commission if you make a purchase through our links, at no extra cost to you. This does not influence our scoring.
      </div>

      {/* Content */}
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: article.htmlContent }}
      />
    </article>
  );
}
