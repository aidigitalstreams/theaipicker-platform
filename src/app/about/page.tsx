import { getArticle } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'About The AI Picker — Who We Are & Why We Do This',
  description: 'The AI Picker is an independent AI tool review site. We research tools thoroughly, compare them fairly, and tell you what\'s actually worth paying for.',
};

export default async function AboutPage() {
  const article = await getArticle('pages', 'about-page-expanded.md');

  return (
    <>
      <PageHero
        label="ABOUT US"
        title="We research AI tools so you don't have to"
        subtitle="The AI Picker is an independent review site. No sponsored rankings. No inflated scores. Just honest research."
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
