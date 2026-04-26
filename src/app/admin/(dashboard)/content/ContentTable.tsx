'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdminArticle, ArticleType } from '@/lib/admin-content';
import { isScheduledForFuture } from '@/lib/article-status';

type StatusFilter = 'all' | 'draft' | 'in-review' | 'ready' | 'publish';

const TYPE_FILTERS: { type: ArticleType | 'all'; label: string }[] = [
  { type: 'all', label: 'All' },
  { type: 'review', label: 'Review' },
  { type: 'comparison', label: 'Comparison' },
  { type: 'best-of', label: 'Best-of' },
  { type: 'guide', label: 'Guide' },
  { type: 'ranking', label: 'Ranking' },
];

const STATUS_FILTERS: { status: StatusFilter; label: string }[] = [
  { status: 'all', label: 'All' },
  { status: 'draft', label: 'Draft' },
  { status: 'in-review', label: 'In Review' },
  { status: 'ready', label: 'Ready' },
  { status: 'publish', label: 'Published' },
];

function scoreClass(score: number | null): string {
  if (score === null) return 'admin-score empty';
  if (score >= 80) return 'admin-score high';
  if (score >= 65) return 'admin-score mid';
  return 'admin-score low';
}

function statusLabel(status: string): string {
  if (!status || status === 'unknown') return 'unknown';
  if (status === 'publish' || status === 'published') return 'published';
  if (status === 'in-review' || status === 'review') return 'in review';
  if (status === 'ready' || status === 'ready-to-publish') return 'ready';
  return status;
}

export default function ContentTable({ articles }: { articles: AdminArticle[] }) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<ArticleType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter(a => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q)
      );
    });
  }, [articles, typeFilter, statusFilter, search]);

  return (
    <>
      <div className="admin-filter-stack">
        <div className="admin-filter-group">
          <span className="admin-filter-label">Type</span>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.type}
              className={`admin-filter${typeFilter === f.type ? ' active' : ''}`}
              onClick={() => setTypeFilter(f.type)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="admin-filter-group">
          <span className="admin-filter-label">Status</span>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.status}
              className={`admin-filter${statusFilter === f.status ? ' active' : ''}`}
              onClick={() => setStatusFilter(f.status)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search by title, slug, or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-search"
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-table-clickable">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '2rem' }}>
                  No articles match these filters.
                </td>
              </tr>
            )}
            {filtered.map(a => {
              const href = `/admin/content/${a.slug}`;
              return (
                <tr
                  key={`${a.subdir}/${a.filename}`}
                  onClick={() => router.push(href)}
                  className="admin-row-clickable"
                >
                  <td>
                    <Link
                      href={href}
                      className="admin-title-link"
                      onClick={e => e.stopPropagation()}
                    >
                      <span className="admin-title-cell">{a.title}</span>
                      <span className="admin-slug-cell">{a.slug}</span>
                    </Link>
                  </td>
                  <td>
                    <span className={`admin-pill ${a.type}`}>{a.type.replace('-', ' ')}</span>
                  </td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                    {a.category || '—'}
                  </td>
                  <td>
                    {isScheduledForFuture(a.publishAt) ? (
                      <span className="admin-pill status-scheduled">Scheduled</span>
                    ) : (
                      <span className={`admin-pill status-${a.status}`}>{statusLabel(a.status)}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={scoreClass(a.topScore)}>
                      {a.topScore !== null ? a.topScore : '—'}
                    </span>
                    {a.toolCount > 1 && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                        top of {a.toolCount}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
