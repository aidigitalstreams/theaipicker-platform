import Link from 'next/link';
import { getAllArticles } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'AI Tool Reviews — Single Tool Deep Dives',
  description: 'In-depth reviews of individual AI tools, each scored out of 100 across five weighted factors. Honest research, transparent methodology.',
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

export default async function ReviewsHub() {
  const articles = await getAllArticles('reviews');
  const sorted = articles.sort((a, b) => a.meta.title.localeCompare(b.meta.title));

  // Get unique categories with counts
  const catMap = new Map<string, number>();
  for (const article of sorted) {
    const cat = article.meta.category || 'Uncategorised';
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  }
  const categories = Array.from(catMap.entries()).sort(([a], [b]) => a.localeCompare(b));

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
        label="REVIEW LIBRARY"
        title="AI Tool Reviews"
        subtitle={`In-depth reviews for every tool we've researched. ${sorted.length} reviews across ${categories.length} categories.`}
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Category filter */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Filter by Category</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>—</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563EB' }}>{sorted.length} Total Reviews</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {categories.map(([name, count]) => {
                const color = catColors[name] || '#64748B';
                return (
                  <span
                    key={name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      background: 'transparent',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40`, flexShrink: 0 }} />
                    {name}
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', marginLeft: '0.125rem' }}>({count})</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Reviews by category */}
          {Array.from(byCategory.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, articles]) => {
              const color = catColors[category] || '#64748B';
              return (
                <div key={category} style={{ marginBottom: '3.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}40`, flexShrink: 0 }} />
                    <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{category}</h2>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', border: '1.5px solid #2563EB' }}>{articles.length} reviewed</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {articles.map(article => (
                      <Link
                        key={article.meta.slug}
                        href={`/reviews/${article.meta.slug}`}
                        style={{
                          background: '#F8FAFC', borderRadius: '0.875rem', padding: '1.5rem', border: '1px solid #E2E8F0',
                          textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column',
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40` }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{category}</span>
                        </div>
                        <h3 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.75rem' }}>
                          {article.meta.title}
                        </h3>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB', marginTop: 'auto' }}>Read Full Review →</span>
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
