import Link from 'next/link';
import { getAllStructuredData, getCategories } from '@/lib/content';
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

function ScorePick({ score, size = 30 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#10B981' : score >= 75 ? '#2563EB' : score >= 65 ? '#F59E0B' : '#EF4444';
  return (
    <svg viewBox="0 0 36 44" width={size} height={size * 1.2} style={{ flexShrink: 0 }}>
      <path d="M18 1 C27 1 34 8.5 34 17.5 C34 29 23 40 18 44 C13 40 2 29 2 17.5 C2 8.5 9 1 18 1 Z" fill={`${color}18`} stroke={color} strokeWidth="1.8"/>
      <text x="18" y="20" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="800" fill={color} textAnchor="middle" dominantBaseline="middle">{score}</text>
    </svg>
  );
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

  return (
    <>
      <PageHero
        label={cat.name.toUpperCase()}
        title={cat.name}
        subtitle={`${tools.length} tools reviewed and ranked. Every score broken down across 5 weighted factors.`}
      />

      <section style={{ background: '#FFFFFF', padding: '3rem 2rem 5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#2563EB', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <Link href="/tools" style={{ color: '#2563EB', textDecoration: 'none' }}>All Tools</Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span style={{ color: '#64748B' }}>{cat.name}</span>
          </nav>

          {/* Rankings table */}
          <div style={{ borderRadius: '0.875rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1.5fr 0.8fr 2.5fr 1fr 0.6fr', padding: '0.875rem 1.25rem', background: '#0F172A', gap: '0.5rem' }}>
              {['#', 'Tool', 'Score', 'Best For', 'Price', 'Free'].map(h => (
                <div key={h} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
              ))}
            </div>
            {tools.map((tool, i) => (
              <div key={tool.toolName} style={{
                display: 'grid', gridTemplateColumns: '0.4fr 1.5fr 0.8fr 2.5fr 1fr 0.6fr',
                padding: '0.875rem 1.25rem',
                background: i === 0 ? 'rgba(16,185,129,0.04)' : i % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                borderTop: '1px solid #E2E8F0', gap: '0.5rem', alignItems: 'center',
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: i === 0 ? '#10B981' : '#64748B' }}>{i + 1}</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>
                  {tool.toolName}
                  {i === 0 && <span style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)', color: 'white', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', marginLeft: '0.5rem' }}>TOP</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ScorePick score={tool.overallScore} size={28} />
                </div>
                <div style={{ fontSize: '0.875rem', color: '#475569' }}>{tool.bestFor}</div>
                <div style={{ fontSize: '0.875rem', color: '#475569' }}>{tool.priceFrom}</div>
                <div style={{ fontSize: '0.875rem', color: tool.freePlan === 'Yes' ? '#10B981' : '#64748B' }}>
                  {tool.freePlan === 'Yes' ? 'Yes' : '—'}
                </div>
              </div>
            ))}
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
