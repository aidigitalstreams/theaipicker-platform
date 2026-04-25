import { getArticle } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Editorial Standards',
  description: 'The rules that govern every review we publish — research sources, scoring rigour, AI disclosure, conflict-of-interest policy, and update cadence.',
};

export default async function EditorialStandardsPage() {
  const article = await getArticle('pages', 'editorial-standards.md');

  return (
    <>
      <PageHero
        label="EDITORIAL POLICY"
        title="Editorial Standards"
        subtitle="The rules that govern every review we publish. Transparency isn't optional — it's the whole point."
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
