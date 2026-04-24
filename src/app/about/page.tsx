import { getArticle } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About The AI Picker — Who We Are & Why We Do This',
  description: 'The AI Picker is an independent AI tool review site. We research tools thoroughly, compare them fairly, and tell you what\'s actually worth paying for.',
};

export default async function AboutPage() {
  const article = await getArticle('pages', 'about-page-expanded.md');

  return (
    <article style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '2rem', color: '#1E293B' }}>
        About The AI Picker
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
