import Link from 'next/link';
import { getAllStructuredData, getCategories } from '@/lib/content';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

function scoreClass(score: number): string {
  if (score >= 80) return 'score-badge score-high';
  if (score >= 60) return 'score-badge score-mid';
  return 'score-badge score-low';
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
        <a href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</a>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <Link href="/tools" style={{ color: '#94A3B8', textDecoration: 'none' }}>All Tools</Link>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span>{cat.name}</span>
      </nav>

      {/* Header */}
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>
        {cat.name}
      </h1>
      <p style={{ color: '#64748B', fontSize: '1.0625rem', marginBottom: '2rem' }}>
        {tools.length} tools reviewed and scored out of 100.
      </p>

      {/* Tools table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>Rank</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>Tool</th>
              <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>Score</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>Best For</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>Price From</th>
              <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>Free Plan</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool, i) => (
              <tr key={tool.toolName} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#1E293B' }}>#{i + 1}</td>
                <td style={{ padding: '0.75rem', fontWeight: 600, color: '#1E293B' }}>{tool.toolName}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <span className={scoreClass(tool.overallScore)}>{tool.overallScore}/100</span>
                </td>
                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569' }}>{tool.bestFor}</td>
                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569' }}>{tool.priceFrom}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>
                  {tool.freePlan === 'Yes' ? '✓' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tools.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94A3B8' }}>
          <p>No tools reviewed in this category yet.</p>
        </div>
      )}
    </div>
  );
}
