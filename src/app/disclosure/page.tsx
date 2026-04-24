import { getArticle } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'How The AI Picker makes money, how it affects our reviews (it doesn\'t), and what it means for you as a reader.',
};

export default async function DisclosurePage() {
  const article = await getArticle('pages', 'affiliate-disclosure.md');

  return (
    <article style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '2rem', color: '#1E293B' }}>
        Affiliate Disclosure
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
