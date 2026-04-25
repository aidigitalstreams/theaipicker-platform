import Link from 'next/link';
import { getAllStructuredData, getAllArticles } from '@/lib/content';
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

function ScorePick({ score, size = 24 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#10B981' : score >= 75 ? '#2563EB' : score >= 65 ? '#F59E0B' : '#EF4444';
  return (
    <svg viewBox="0 0 36 44" width={size} height={size * 1.22} style={{ flexShrink: 0 }}>
      <path d="M18 1 C27 1 34 8.5 34 17.5 C34 29 23 40 18 44 C13 40 2 29 2 17.5 C2 8.5 9 1 18 1 Z" fill={`${color}18`} stroke={color} strokeWidth="1.8"/>
      <text x="18" y="20" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="800" fill={color} textAnchor="middle" dominantBaseline="middle">{score}</text>
    </svg>
  );
}

function scoreColor(s: number) {
  return s >= 85 ? '#10B981' : s >= 75 ? '#2563EB' : s >= 65 ? '#F59E0B' : '#EF4444';
}

export default async function RankingsHub() {
  const allTools = await getAllStructuredData();
  const reviews = await getAllArticles('reviews');

  // Group tools by category
  const byCategory = new Map<string, typeof allTools>();
  for (const tool of allTools) {
    if (!tool.category) continue;
    if (!byCategory.has(tool.category)) byCategory.set(tool.category, []);
    byCategory.get(tool.category)!.push(tool);
  }

  // Sort categories alphabetically, sort tools by score within each
  const categories = Array.from(byCategory.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, tools]) => ({
      name,
      tools: tools.sort((a, b) => b.overallScore - a.overallScore),
    }));

  const totalTools = allTools.length;

  return (
    <>
      <PageHero
        label="LEADERBOARDS"
        title="AI Tool Rankings"
        subtitle={`Every tool we've reviewed, ranked by category. ${totalTools} tools across ${categories.length} categories — updated when scores change.`}
      />

      <section style={{ background: '#FFFFFF', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {categories.map(cat => {
            const color = catColors[cat.name] || '#64748B';
            return (
              <div key={cat.name} style={{ marginBottom: '3.5rem' }}>
                {/* Category header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}40`, flexShrink: 0 }} />
                  <h2 style={{ fontFamily: 'Inter,system-ui,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{cat.name}</h2>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', border: '1.5px solid #2563EB' }}>{cat.tools.length} reviewed</span>
                </div>

                {/* Leaderboard table */}
                <div style={{ borderRadius: '0.875rem', border: '1px solid #E2E8F0', overflow: 'hidden', overflowX: 'auto' }}>
                  <div style={{ minWidth: '850px' }}>
                    {/* Header row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '0.3fr 1.2fr 0.8fr 0.7fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.8fr', padding: '0.75rem 1rem', background: '#0F172A', gap: '0.375rem' }}>
                      {['#', 'Tool', '', 'Overall', 'Perf', 'Ease', 'Value', 'Output', 'Support', ''].map((h, i) => (
                        <div key={`${h}-${i}`} style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
                      ))}
                    </div>
                    {/* Tool rows */}
                    {cat.tools.map((tool, i) => {
                      const review = reviews.find(r =>
                        r.meta.title.toLowerCase().includes(tool.toolName.toLowerCase())
                      );
                      return (
                        <div key={tool.toolName} style={{
                          display: 'grid', gridTemplateColumns: '0.3fr 1.2fr 0.8fr 0.7fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.8fr',
                          padding: '0.75rem 1rem',
                          background: i === 0 ? 'rgba(16,185,129,0.03)' : i % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          borderTop: '1px solid #E2E8F0', gap: '0.375rem', alignItems: 'center',
                        }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: i === 0 ? '#10B981' : '#64748B' }}>{i + 1}</div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>{tool.toolName}</div>
                          <div>
                            {review && (
                              <Link href={`/reviews/${review.meta.slug}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>
                                Read Review →
                              </Link>
                            )}
                          </div>
                          <div><ScorePick score={tool.overallScore} size={24} /></div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor(tool.corePerformance) }}>{tool.corePerformance}</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor(tool.easeOfUse) }}>{tool.easeOfUse}</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor(tool.valueForMoney) }}>{tool.valueForMoney}</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor(tool.outputQuality) }}>{tool.outputQuality}</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor(tool.supportReliability) }}>{tool.supportReliability}</div>
                          <div>
                            <span className="btn-primary" style={{ padding: '0.375rem 0.625rem', fontSize: '0.6875rem', borderRadius: '0.375rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>Get Started →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {categories.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94A3B8', padding: '4rem 1rem' }}>
              Rankings coming soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
