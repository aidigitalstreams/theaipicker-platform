import Link from 'next/link';
import { getArticleBySlug, getAllSlugs } from '@/lib/content';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import ArticleContent from '@/components/ArticleContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs('best-of');
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug('best-of', slug);
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

export default async function BestOfPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug('best-of', slug);

  if (!article) notFound();

  return (
    <>
      <PageHero
        label={article.meta.category || 'BEST OF 2026'}
        title={article.meta.title}
      />

      <section style={{ background: '#FFFFFF', padding: '3rem 2rem 5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#2563EB', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <Link href="/rankings" style={{ color: '#2563EB', textDecoration: 'none' }}>Rankings</Link>
            {article.meta.category && (
              <>
                <span style={{ margin: '0 0.5rem' }}>/</span>
                <span style={{ color: '#64748B' }}>{article.meta.category}</span>
              </>
            )}
          </nav>

          {/* Disclosure */}
          <div className="disclosure">
            <strong>Disclosure:</strong> We earn a commission if you make a purchase through our links, at no extra cost to you. This doesn&apos;t influence our scoring — we research tools honestly and score transparently.
          </div>

          {/* Content */}
          <ArticleContent html={article.htmlContent} />
        </div>
      </section>
    </>
  );
}
