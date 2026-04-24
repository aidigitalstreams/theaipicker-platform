import Link from 'next/link';
import { getAllStructuredData, getCategories } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All AI Tools — Product Catalogue',
  description: 'Browse every AI tool we\'ve reviewed, scored out of 100. Filter by category, compare scores, and find the right tool for your needs.',
};

function scoreClass(score: number): string {
  if (score >= 80) return 'score-badge score-high';
  if (score >= 60) return 'score-badge score-mid';
  return 'score-badge score-low';
}

export default async function ToolsPage() {
  const allTools = await getAllStructuredData();
  const categories = await getCategories();

  // Sort tools by overall score descending
  const sortedTools = allTools.sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>
          AI Tools Catalogue
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.0625rem' }}>
          Every tool we&apos;ve reviewed, scored out of 100. {sortedTools.length} tools across {categories.length} categories.
        </p>
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/tools/${cat.slug}`}
            style={{
              background: '#F1F5F9',
              color: '#475569',
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid #E2E8F0',
            }}
          >
            {cat.name} ({cat.count})
          </Link>
        ))}
      </div>

      {/* Tools grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {sortedTools.map(tool => (
          <div key={tool.toolName} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>
                  {tool.toolName}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>{tool.category}</p>
              </div>
              <span className={scoreClass(tool.overallScore)}>
                {tool.overallScore}/100
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
              {tool.bestFor}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748B' }}>
                From {tool.priceFrom} {tool.freePlan === 'Yes' && '· Free plan available'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {sortedTools.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94A3B8' }}>
          <p style={{ fontSize: '1.125rem' }}>No tools reviewed yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
