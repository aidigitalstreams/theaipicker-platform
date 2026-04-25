import Link from 'next/link';
import { getAllStructuredData, getCategories } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'All AI Tools — Product Catalogue',
  description: 'Browse every AI tool we\'ve reviewed, scored out of 100. Filter by category, compare scores, and find the right tool for your needs.',
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

function ScorePick({ score, size = 40 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#10B981' : score >= 75 ? '#2563EB' : score >= 65 ? '#F59E0B' : '#EF4444';
  return (
    <svg viewBox="0 0 44 54" width={size} height={size * 1.2} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={`tpc${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
      </defs>
      <path d={`M22 1 C33 1 42 9.5 42 20.5 C42 34 27 49 22 53 C17 49 2 34 2 20.5 C2 9.5 11 1 22 1 Z`} fill={`${color}18`} stroke={color} strokeWidth="1.8"/>
      <text x="22" y="24" fontFamily="Inter,system-ui,sans-serif" fontSize="14" fontWeight="800" fill={color} textAnchor="middle" dominantBaseline="middle">{score}</text>
    </svg>
  );
}

export default async function ToolsPage() {
  const allTools = await getAllStructuredData();
  const categories = await getCategories();
  const sortedTools = allTools.sort((a, b) => b.overallScore - a.overallScore);

  return (
    <>
      <PageHero
        label="PRODUCT CATALOGUE"
        title="AI Tools Catalogue"
        subtitle={`Every tool we've reviewed, scored out of 100. ${sortedTools.length} tools across ${categories.length} categories.`}
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Category filter pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
            {categories.map(cat => {
              const color = catColors[cat.name] || '#64748B';
              return (
                <Link
                  key={cat.slug}
                  href={`/tools/${cat.slug}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    background: 'transparent',
                    color: '#475569',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40` }} />
                  {cat.name} ({cat.count})
                </Link>
              );
            })}
          </div>

          {/* Tools grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {sortedTools.map(tool => {
              const color = catColors[tool.category] || '#64748B';
              return (
                <div key={tool.toolName} style={{ background: '#F8FAFC', borderRadius: '0.875rem', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}40` }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{tool.category}</span>
                      </div>
                      <h3 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {tool.toolName}
                      </h3>
                    </div>
                    <ScorePick score={tool.overallScore} size={36} />
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    {tool.bestFor}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                      From {tool.priceFrom} {tool.freePlan === 'Yes' && '· Free plan'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedTools.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94A3B8' }}>
              <p style={{ fontSize: '1.125rem' }}>No tools reviewed yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
