import Link from 'next/link';
import { getAllArticles } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'AI Tool Rankings — Category Leaderboards',
  description: 'Browse AI tool rankings by category. Every tool scored out of 100 across five weighted factors. Updated as we review new tools.',
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

export default async function RankingsHub() {
  const articles = await getAllArticles('rankings');
  const sorted = articles.sort((a, b) => a.meta.title.localeCompare(b.meta.title));

  return (
    <>
      <PageHero
        label="LEADERBOARDS"
        title="AI Tool Rankings"
        subtitle={`Every tool we've reviewed, ranked by category. ${sorted.length} leaderboards — updated when scores change.`}
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {sorted.map(article => {
              const cat = article.meta.category || article.meta.title;
              const color = catColors[cat] || '#64748B';
              return (
                <Link
                  key={article.meta.slug}
                  href={`/rankings/${article.meta.slug}`}
                  style={{
                    background: '#F8FAFC', borderRadius: '0.875rem', padding: '1.5rem 1.25rem',
                    border: '1px solid #E2E8F0', textDecoration: 'none', color: 'inherit',
                    transition: 'border-color 0.2s', cursor: 'pointer',
                  }}
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, marginBottom: '0.875rem', boxShadow: `0 0 12px ${color}40` }} />
                  <div style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>{article.meta.title}</div>
                  {article.meta.category && (
                    <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>{article.meta.category}</div>
                  )}
                  <span style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB' }}>View Rankings →</span>
                </Link>
              );
            })}
          </div>

          {sorted.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94A3B8', padding: '4rem 1rem' }}>
              Rankings coming soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
