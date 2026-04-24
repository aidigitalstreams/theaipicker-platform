import Link from 'next/link';
import { getAllArticles } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Tool Rankings — Category Leaderboards',
  description: 'Browse AI tool rankings by category. Every tool scored out of 100 across five weighted factors. Updated as we review new tools.',
};

export default async function RankingsHub() {
  const articles = await getAllArticles('rankings');

  // Sort alphabetically by title
  const sorted = articles.sort((a, b) => a.meta.title.localeCompare(b.meta.title));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto 2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>
          AI Tool Rankings
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.0625rem' }}>
          Every category has its own leaderboard, ranked by our 5-factor scoring system. Pick a category to see the full rankings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {sorted.map(article => (
          <Link
            key={article.meta.slug}
            href={`/rankings/${article.meta.slug}`}
            className="card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3 style={{ fontWeight: 600, fontSize: '1rem', color: '#1E293B', marginBottom: '0.25rem' }}>
              {article.meta.title}
            </h3>
            {article.meta.category && (
              <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>{article.meta.category}</p>
            )}
          </Link>
        ))}
      </div>

      {sorted.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94A3B8', padding: '4rem 1rem' }}>
          Rankings coming soon.
        </p>
      )}
    </div>
  );
}
