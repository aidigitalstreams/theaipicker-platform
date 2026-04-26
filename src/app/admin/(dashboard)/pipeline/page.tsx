import Link from 'next/link';
import {
  getAllAdminArticles,
  typeLabel,
  isScheduledForFuture,
  type AdminArticle,
} from '@/lib/admin-content';
import { getActiveStream } from '@/lib/streams';

export const dynamic = 'force-dynamic';

type ColumnKey = 'draft' | 'in-review' | 'ready' | 'published';

interface Column {
  key: ColumnKey;
  label: string;
  match: (status: string) => boolean;
}

const COLUMNS: Column[] = [
  {
    key: 'draft',
    label: 'Draft',
    match: s => s === 'draft' || s === '' || s === 'unknown',
  },
  {
    key: 'in-review',
    label: 'In Review',
    match: s => s === 'in-review' || s === 'review',
  },
  {
    key: 'ready',
    label: 'Ready to Publish',
    match: s => s === 'ready-to-publish' || s === 'ready',
  },
  {
    key: 'published',
    label: 'Published',
    match: s => s === 'publish' || s === 'published',
  },
];

function bucketArticles(articles: AdminArticle[]): Record<ColumnKey, AdminArticle[]> {
  const buckets: Record<ColumnKey, AdminArticle[]> = {
    'draft': [],
    'in-review': [],
    'ready': [],
    'published': [],
  };
  for (const article of articles) {
    const normalized = (article.status ?? '').toLowerCase();
    const column = COLUMNS.find(c => c.match(normalized));
    if (column) buckets[column.key].push(article);
    else buckets.draft.push(article);
  }
  return buckets;
}

function scoreClass(score: number | null): string {
  if (score === null) return 'admin-score empty';
  if (score >= 80) return 'admin-score high';
  if (score >= 65) return 'admin-score mid';
  return 'admin-score low';
}

function formatScheduled(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} at ${timeStr}`;
}

export default async function PipelinePage() {
  const stream = await getActiveStream();
  const articles = getAllAdminArticles(stream);
  const buckets = bucketArticles(articles);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Content</div>
          <h1>Pipeline</h1>
        </div>
        <div className="admin-topbar-meta">
          {articles.length} article{articles.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-pipeline-board">
          {COLUMNS.map(col => {
            const items = buckets[col.key];
            return (
              <div key={col.key} className={`admin-pipeline-column status-${col.key}`}>
                <div className="admin-pipeline-column-head">
                  <h2 className="admin-pipeline-column-title">{col.label}</h2>
                  <span className="admin-pipeline-column-count">{items.length}</span>
                </div>
                <div className="admin-pipeline-cards">
                  {items.length === 0 && (
                    <div className="admin-pipeline-empty">No articles in this stage.</div>
                  )}
                  {items.map(article => {
                    const scheduled = isScheduledForFuture(article.publishAt);
                    return (
                      <Link
                        key={`${article.subdir}-${article.filename}`}
                        href={`/admin/content/${article.slug}`}
                        className="admin-pipeline-card"
                      >
                        <div className="admin-pipeline-card-head">
                          <span className={`admin-pill ${article.type}`}>
                            {typeLabel(article.type).toLowerCase()}
                          </span>
                          {article.topScore !== null && (
                            <span className={scoreClass(article.topScore)}>{article.topScore}</span>
                          )}
                        </div>
                        <div className="admin-pipeline-card-title">{article.title}</div>
                        {scheduled && article.publishAt && (
                          <div className="admin-pipeline-scheduled">
                            <span className="admin-pill status-scheduled">Scheduled</span>
                            <span className="admin-pipeline-card-meta">{formatScheduled(article.publishAt)}</span>
                          </div>
                        )}
                        {article.category && (
                          <div className="admin-pipeline-card-meta">{article.category}</div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
