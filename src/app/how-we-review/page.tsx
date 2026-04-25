import { getArticle } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'How We Review AI Tools — Our Process',
  description: 'Every AI tool on The AI Picker is scored out of 100 on five weighted factors. Full methodology, category data points, and the quality gates we apply.',
};

export default async function HowWeReviewPage() {
  const article = await getArticle('pages', 'how-we-review-expanded.md');

  return (
    <>
      <PageHero
        label="METHODOLOGY"
        title="How We Review AI Tools"
        subtitle="Every tool goes through the same rigorous process. Here's exactly how our scoring works."
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {article && (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.htmlContent }}
            />
          )}
        </div>
      </section>
    </>
  );
}
