import Link from 'next/link';
import { getAllArticles, parseStructuredData } from '@/lib/content';
import { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Best AI Tools 2026 — Compared & Ranked',
  description: 'The best AI tools in every category, compared and ranked. Each list scores tools out of 100 across five weighted factors.',
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

function ScorePick({ score, size = 28 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#10B981' : score >= 75 ? '#2563EB' : score >= 65 ? '#F59E0B' : '#EF4444';
  return (
    <svg viewBox="0 0 36 44" width={size} height={size * 1.22} style={{ flexShrink: 0 }}>
      <path d="M18 1 C27 1 34 8.5 34 17.5 C34 29 23 40 18 44 C13 40 2 29 2 17.5 C2 8.5 9 1 18 1 Z" fill={`${color}18`} stroke={color} strokeWidth="1.8"/>
      <text x="18" y="20" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="800" fill={color} textAnchor="middle" dominantBaseline="middle">{score}</text>
    </svg>
  );
}

export default async function BestOfHub() {
  const articles = await getAllArticles('best-of');
  const sorted = articles.sort((a, b) => a.meta.title.localeCompare(b.meta.title));

  return (
    <>
      <PageHero
        label="BEST OF 2026"
        title="Best AI Tools by Category"
        subtitle={`${sorted.length} curated lists. Each one ranks the top tools in its category, scored out of 100.`}
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {sorted.map(article => {
            const cat = article.meta.category || 'AI Tools';
            const color = catColors[cat] || '#64748B';
            const sd = parseStructuredData(article.content);
            const topTools = sd.sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);

            return (
              <div key={article.meta.slug} style={{ marginBottom: '3rem' }}>
                {/* Category header */}
                <Link
                  href={`/best/${article.meta.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: '1rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}40`, flexShrink: 0 }} />
                    <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {article.meta.title}
                    </h2>
                  </div>
                </Link>

                {/* Summary table */}
                {topTools.length > 0 && (
                  <div style={{ borderRadius: '0.875rem', border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1.2fr 0.6fr 2fr 0.8fr 0.5fr 1.2fr', padding: '0.875rem 1rem', background: '#0F172A', gap: '0.5rem' }}>
                      {['#', 'Tool', 'Score', 'Best For', 'Price', 'Free', ''].map(h => (
                        <div key={h} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
                      ))}
                    </div>
                    {topTools.map((tool, i) => (
                      <div key={tool.toolName} style={{
                        display: 'grid', gridTemplateColumns: '0.4fr 1.2fr 0.6fr 2fr 0.8fr 0.5fr 1.2fr',
                        padding: '0.875rem 1rem',
                        background: i === 0 ? 'rgba(16,185,129,0.03)' : i % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                        borderTop: '1px solid #E2E8F0', gap: '0.5rem', alignItems: 'center',
                      }}>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: i === 0 ? '#10B981' : '#64748B' }}>{i + 1}</div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>
                          {tool.toolName}
                          {i === 0 && <span style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)', color: 'white', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', marginLeft: '0.5rem' }}>OUR PICK</span>}
                        </div>
                        <div><ScorePick score={tool.overallScore} size={24} /></div>
                        <div style={{ fontSize: '0.875rem', color: '#475569' }}>{tool.bestFor}</div>
                        <div style={{ fontSize: '0.875rem', color: '#475569' }}>{tool.priceFrom}</div>
                        <div style={{ fontSize: '0.875rem', color: tool.freePlan === 'Yes' ? '#10B981' : '#64748B' }}>
                          {tool.freePlan === 'Yes' ? 'Yes' : '—'}
                        </div>
                        <div>
                          <span className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.5rem 1rem', fontSize: '0.8125rem', borderRadius: '0.5rem', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>Get Started →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link href={`/best/${article.meta.slug}`} style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>
                  Read Full List →
                </Link>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94A3B8', padding: '4rem 1rem' }}>
              Best-of lists coming soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
