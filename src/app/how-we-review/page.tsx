import { getArticle } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How We Review AI Tools — Our Process',
  description: 'Every AI tool on The AI Picker is scored out of 100 on five weighted factors. Full methodology, category data points, and the quality gates we apply.',
};

export default async function HowWeReviewPage() {
  const article = await getArticle('pages', 'how-we-review-expanded.md');

  return (
    <article style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '2rem', color: '#1E293B' }}>
        How We Review AI Tools
      </h1>
      {article && (
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.htmlContent }}
        />
      )}
    </article>
  );
}
