import { getAllArticles, getAllStructuredData } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import ReviewsGrid from '@/components/ReviewsGrid';

export const metadata: Metadata = {
  title: 'AI Tool Reviews — Single Tool Deep Dives',
  description: 'In-depth reviews of individual AI tools, each scored out of 100 across five weighted factors. Honest research, transparent methodology.',
};

export default async function ReviewsHub() {
  const articles = await getAllArticles('reviews');
  const structuredData = await getAllStructuredData();

  // Build review items with scores from structured data
  const reviews = articles
    .sort((a, b) => a.meta.title.localeCompare(b.meta.title))
    .map(article => {
      const sd = structuredData.find(d =>
        article.meta.title.toLowerCase().includes(d.toolName.toLowerCase())
      );
      return {
        slug: article.meta.slug,
        title: article.meta.title,
        category: article.meta.category || 'Uncategorised',
        overallScore: sd?.overallScore || 0,
        bestFor: sd?.bestFor || '',
      };
    });

  return (
    <>
      <PageHero
        label="REVIEW LIBRARY"
        title="AI Tool Reviews"
        subtitle={`In-depth reviews for every tool we've researched. ${reviews.length} reviews across multiple categories.`}
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <ReviewsGrid reviews={reviews} />
        </div>
      </section>
    </>
  );
}
