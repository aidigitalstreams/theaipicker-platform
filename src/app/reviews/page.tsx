import Link from 'next/link';
import { getAllArticles } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Tool Reviews — Single Tool Deep Dives',
  description: 'In-depth reviews of individual AI tools, each scored out of 100 across five weighted factors. Honest research, transparent methodology.',
};

export default async function ReviewsHub() {
  const articles = await getAllArticles('reviews');
  const sorted = articles.sort((a, b) => a.meta.title.localeCompare(b.meta.title));

  // Group by category
  const byCategory = new Map<string, typeof sorted>();
  for (const article of sorted) {
    const cat = article.meta.category || 'Uncategorised';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(article);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto 2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>
          Reviews
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.0625rem' }}>
          {sorted.length} individual tool reviews, each scored out of 100 across five weighted factors.
        </p>
      </div>

      {Array.from(byCategory.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, articles]) => (
          <div key={category} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem' }}>
              {category}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
              {articles.map(article => (
                <Link
                  key={article.meta.slug}
                  href={`/reviews/${article.meta.slug}`}
                  className="card"
                  style={{ textDecoration: 'none', color: 'inherit', padding: '1rem' }}
                >
                  <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1E293B' }}>
                    {article.meta.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
