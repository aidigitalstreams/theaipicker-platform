import { getAllArticles, getAllStructuredData, parseStructuredData } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import CompareBuilder from '@/components/CompareBuilder';

export const metadata: Metadata = {
  title: 'Compare AI Tools — VS Comparisons',
  description: 'Head-to-head AI tool comparisons. Every matchup scored across five weighted factors with a clear verdict.',
};

export default async function CompareHub() {
  const articles = await getAllArticles('comparisons');
  const allSD = await getAllStructuredData();

  // Build tool data for the interactive builder
  const tools = allSD.map(d => ({
    toolName: d.toolName,
    category: d.category,
    overallScore: d.overallScore,
    corePerformance: d.corePerformance,
    easeOfUse: d.easeOfUse,
    valueForMoney: d.valueForMoney,
    outputQuality: d.outputQuality,
    supportReliability: d.supportReliability,
    priceFrom: d.priceFrom,
    freePlan: d.freePlan,
    bestFor: d.bestFor,
  }));

  // Build popular comparisons from published articles
  const comparisons = articles
    .sort((a, b) => a.meta.title.localeCompare(b.meta.title))
    .map(article => {
      const sd = parseStructuredData(article.content);
      return {
        slug: article.meta.slug,
        title: article.meta.title,
        category: article.meta.category || 'Uncategorised',
        toolA: sd[0]?.toolName,
        toolB: sd[1]?.toolName,
        scoreA: sd[0]?.overallScore || 0,
        scoreB: sd[1]?.overallScore || 0,
      };
    });

  return (
    <>
      <PageHero
        label="COMPARISON"
        title="Compare AI Tools"
        subtitle="Pick a category, choose two tools, and see how they stack up side by side."
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <CompareBuilder tools={tools} comparisons={comparisons} />
        </div>
      </section>
    </>
  );
}
