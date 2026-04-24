import { getArticle } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Standards',
  description: 'The rules that govern every review we publish — research sources, scoring rigour, AI disclosure, conflict-of-interest policy, and update cadence.',
};

export default async function EditorialStandardsPage() {
  const article = await getArticle('pages', 'editorial-standards.md');

  return (
    <article style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '2rem', color: '#1E293B' }}>
        Editorial Standards
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
