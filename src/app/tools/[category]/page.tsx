import Link from 'next/link';
import { getAllStructuredData, getCategories, getAllArticles } from '@/lib/content';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map(cat => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const cat = categories.find(c => c.slug === category);
  if (!cat) return {};

  return {
    title: `${cat.name} — Reviewed & Ranked`,
    description: `Browse all ${cat.count} ${cat.name.toLowerCase()} we've reviewed, scored out of 100. Compare scores and find the best tool for your needs.`,
  };
}

function ScorePick({ score, size = 24 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#10B981' : score >= 75 ? '#2563EB' : score >= 65 ? '#F59E0B' : '#EF4444';
  return (
    <svg viewBox="0 0 36 44" width={size} height={size * 1.22} style={{ flexShrink: 0 }}>
      <path d="M18 1 C27 1 34 8.5 34 17.5 C34 29 23 40 18 44 C13 40 2 29 2 17.5 C2 8.5 9 1 18 1 Z" fill={`${color}18`} stroke={color} strokeWidth="1.8"/>
      <text x="18" y="20" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="800" fill={color} textAnchor="middle" dominantBaseline="middle">{score}</text>
    </svg>
  );
}

function FactorScore({ score }: { score: number }) {
  const color = score >= 85 ? '#10B981' : score >= 75 ? '#2563EB' : score >= 65 ? '#F59E0B' : '#EF4444';
  return <span style={{ fontSize: '0.8125rem', fontWeight: 700, color }}>{score}</span>;
}

export default async function CategoryToolsPage({ params }: Props) {
  const { category } = await params;
  const allTools = await getAllStructuredData();
  const categories = await getCategories();
  const cat = categories.find(c => c.slug === category);

  if (!cat) notFound();

  const tools = allTools
    .filter(t => t.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === category)
    .sort((a, b) => b.overallScore - a.overallScore);

  // Find review slugs for each tool
  const reviews = await getAllArticles('reviews');

  return (
    <>
      <PageHero
        label={cat.name.toUpperCase()}
        title={cat.name}
        subtitle={`${tools.length} tools reviewed and ranked. Every score broken down across 5 weighted factors.`}
      />

      <section style={{ background: '#FFFFFF', padding: '3rem 2rem 5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#2563EB', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <Link href="/tools" style={{ color: '#2563EB', textDecoration: 'none' }}>All Tools</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span style={{ color: '#64748B' }}>{cat.name}</span>
          </nav>

          {/* Rankings table with all factor columns */}
          <div style={{ borderRadius: '0.875rem', border: '1px solid #E2E8F0', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#0F172A' }}>
                  {['#', 'Tool', 'Review', 'Overall', 'Perf', 'Ease', 'Value', 'Output', 'Support', ''].map(h => (
                    <th key={h} style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0.875rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tools.map((tool, i) => {
                  const review = reviews.find(r =>
                    r.meta.title.toLowerCase().includes(tool.toolName.toLowerCase())
                  );
                  return (
                    <tr key={tool.toolName} style={{
                      background: i === 0 ? 'rgba(16,185,129,0.04)' : i % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                      borderTop: '1px solid #E2E8F0',
                    }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 800, color: i === 0 ? '#10B981' : '#64748B' }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                        {tool.toolName}
                        {i === 0 && <span style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)', color: 'white', fontSize: '0.5625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', marginLeft: '0.5rem', verticalAlign: 'middle' }}>TOP</span>}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {review && (
                          <Link href={`/reviews/${review.meta.slug}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                            Read →
                          </Link>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <ScorePick score={tool.overallScore} size={24} />
                      </td>
                      <td style={{ padding: '0.75rem' }}><FactorScore score={tool.corePerformance} /></td>
                      <td style={{ padding: '0.75rem' }}><FactorScore score={tool.easeOfUse} /></td>
                      <td style={{ padding: '0.75rem' }}><FactorScore score={tool.valueForMoney} /></td>
                      <td style={{ padding: '0.75rem' }}><FactorScore score={tool.outputQuality} /></td>
                      <td style={{ padding: '0.75rem' }}><FactorScore score={tool.supportReliability} /></td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '0.375rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                          Get Started →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {tools.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94A3B8' }}>
              <p>No tools reviewed in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
