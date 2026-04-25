import Link from 'next/link';
import { getAllArticles } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Compare AI Tools — VS Comparisons',
  description: 'Head-to-head AI tool comparisons. Every matchup scored across five weighted factors with a clear verdict.',
};

const catColors: Record<string, string> = {
  'AI Chatbots': '#EC4899',
  'AI Writing Tools': '#2563EB',
  'AI Voice Generators': '#8B5CF6',
  'AI Image Generators': '#10B981',
  'AI Video Tools': '#F59E0B',
  'AI Coding Assistants': '#06B6D4',
  'AI Meeting Assistants': '#F97316',
  'AI SEO Tools': '#14B8A6',
  'AI Music Generation': '#A855F7',
  'AI Presentation Tools': '#EC4899',
  'AI Transcription Tools': '#3B82F6',
};

export default async function CompareHub() {
  const articles = await getAllArticles('comparisons');
  const sorted = articles.sort((a, b) => a.meta.title.localeCompare(b.meta.title));

  // Group by category
  const byCategory = new Map<string, typeof sorted>();
  for (const article of sorted) {
    const cat = article.meta.category || 'Uncategorised';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(article);
  }

  return (
    <>
      <PageHero
        label="COMPARISON"
        title="Compare AI Tools"
        subtitle={`${sorted.length} head-to-head comparisons across ${byCategory.size} categories. Pick a matchup and see how they stack up.`}
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Comparisons by category */}
          {Array.from(byCategory.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, articles]) => {
              const color = catColors[category] || '#64748B';
              return (
                <div key={category} style={{ marginBottom: '3.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}40`, flexShrink: 0 }} />
                    <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{category}</h2>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', border: '1.5px solid #2563EB' }}>{articles.length} comparisons</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {articles.map(article => (
                      <Link
                        key={article.meta.slug}
                        href={`/compare/${article.meta.slug}`}
                        style={{
                          background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.875rem', padding: '1.25rem 1.5rem',
                          textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <div>
                          <h3 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem' }}>
                            {article.meta.title}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40` }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{category.replace('AI ', '')}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB', whiteSpace: 'nowrap' }}>Read →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </>
  );
}
