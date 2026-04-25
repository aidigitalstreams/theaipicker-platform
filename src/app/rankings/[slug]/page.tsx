import Link from 'next/link';
import { getArticleBySlug, getAllSlugs } from '@/lib/content';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs('rankings');
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug('rankings', slug);
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

export default async function RankingsPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug('rankings', slug);

  if (!article) notFound();

  return (
    <>
      <PageHero
        label="LEADERBOARD"
        title={article.meta.title}
        subtitle={article.meta.category ? `Full rankings for ${article.meta.category}` : undefined}
      />

      <section style={{ background: '#FFFFFF', padding: '3rem 2rem 5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#2563EB', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <Link href="/rankings" style={{ color: '#2563EB', textDecoration: 'none' }}>Rankings</Link>
          </nav>

          {/* Content */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.htmlContent }}
          />
        </div>
      </section>
    </>
  );
}
