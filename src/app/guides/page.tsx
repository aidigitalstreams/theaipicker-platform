import Link from 'next/link';
import { getAllArticles } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'AI Tool Guides — Buyer\'s Guides & Resources',
  description: 'In-depth guides to help you choose the right AI tool. Alternatives, pricing breakdowns, and decision frameworks.',
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

export default async function GuidesHub() {
  const articles = await getAllArticles('guides');
  const sorted = articles.sort((a, b) => a.meta.title.localeCompare(b.meta.title));

  return (
    <>
      <PageHero
        label="RESOURCE CENTRE"
        title="Guides"
        subtitle={`Buyer's guides, alternatives roundups, and decision frameworks to help you pick the right AI tool. ${sorted.length} guides available.`}
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {sorted.map(article => {
              const cat = article.meta.category || '';
              const color = catColors[cat] || '#64748B';
              return (
                <Link
                  key={article.meta.slug}
                  href={`/guides/${article.meta.slug}`}
                  style={{
                    background: '#F8FAFC', borderRadius: '0.875rem', padding: '1.5rem 1.25rem',
                    border: '1px solid #E2E8F0', textDecoration: 'none', color: 'inherit',
                    transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column',
                  }}
                >
                  {cat && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40` }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{cat}</span>
                    </div>
                  )}
                  <h3 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem' }}>
                    {article.meta.title}
                  </h3>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB', marginTop: 'auto' }}>Read Guide →</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
