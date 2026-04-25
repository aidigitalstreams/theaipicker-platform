import { getArticle } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'How The AI Picker makes money, how it affects our reviews (it doesn\'t), and what it means for you as a reader.',
};

export default async function DisclosurePage() {
  const article = await getArticle('pages', 'affiliate-disclosure.md');

  return (
    <>
      <PageHero
        dark={false}
        title="Affiliate Disclosure"
        subtitle="Full transparency about how we earn money and how it affects (and doesn't affect) our reviews."
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
