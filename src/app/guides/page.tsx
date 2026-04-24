import Link from 'next/link';
import { getAllArticles } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Tool Guides — Buyer\'s Guides & Resources',
  description: 'In-depth guides to help you choose the right AI tool. Alternatives, pricing breakdowns, and decision frameworks.',
};

export default async function GuidesHub() {
  const articles = await getAllArticles('guides');
  const sorted = articles.sort((a, b) => a.meta.title.localeCompare(b.meta.title));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto 2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>
          Guides
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.0625rem' }}>
          Buyer&apos;s guides, alternatives roundups, and decision frameworks to help you pick the right AI tool.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {sorted.map(article => (
          <Link
            key={article.meta.slug}
            href={`/guides/${article.meta.slug}`}
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
    </div>
  );
}
