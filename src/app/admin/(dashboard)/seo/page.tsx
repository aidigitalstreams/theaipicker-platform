import Link from 'next/link';
import { getArticleSeoSnapshots, summariseSeo } from '@/lib/seo-overview';
import { typeLabel } from '@/lib/admin-content';
import { getActiveStream } from '@/lib/streams';

export const dynamic = 'force-dynamic';

function ratioClass(passed: number, total: number): string {
  if (total === 0) return 'admin-score empty';
  const ratio = passed / total;
  if (ratio === 1) return 'admin-score high';
  if (ratio >= 0.7) return 'admin-score mid';
  return 'admin-score low';
}

export default function SeoWarRoomPage() {
  const stream = getActiveStream();
  const snapshots = getArticleSeoSnapshots(stream);
  const summary = summariseSeo(snapshots);

  const sorted = [...snapshots].sort((a, b) => {
    const aRatio = a.seoTotal === 0 ? 0 : a.seoPassed / a.seoTotal;
    const bRatio = b.seoTotal === 0 ? 0 : b.seoPassed / b.seoTotal;
    if (aRatio !== bRatio) return aRatio - bRatio;
    return a.title.localeCompare(b.title);
  });

  const worst = sorted.slice(0, 25);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Insights</div>
          <h1>SEO War Room</h1>
        </div>
        <div className="admin-topbar-meta">
          {summary.total} article{summary.total === 1 ? '' : 's'} scanned
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-label">Avg SEO score</div>
            <div className="admin-stat-value">{summary.averageSeoPercent}%</div>
            <div className="admin-stat-delta">Across all articles in this stream</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Avg CTA coverage</div>
            <div className="admin-stat-value">{summary.averageCtaPercent}%</div>
            <div className="admin-stat-delta">CLAUDE.md placement standard</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Fully passing</div>
            <div className="admin-stat-value">{summary.fullyPassing}</div>
            <div className="admin-stat-delta">Both SEO + CTA at 100%</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Missing keyword</div>
            <div
              className="admin-stat-value"
              style={{ color: summary.withoutTargetKeyword > 0 ? 'var(--admin-warning)' : 'var(--admin-text)' }}
            >
              {summary.withoutTargetKeyword}
            </div>
            <div className="admin-stat-delta">Empty target_keyword frontmatter</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Meta too short</div>
            <div className="admin-stat-value">{summary.shortMeta}</div>
            <div className="admin-stat-delta">Under 150 chars</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Meta too long</div>
            <div className="admin-stat-value">{summary.longMeta}</div>
            <div className="admin-stat-delta">Over 160 chars</div>
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Lowest SEO scores</h2>
              <div className="admin-card-sub">
                Bottom 25 articles by SEO checklist pass rate. Click through to fix.
              </div>
            </div>
          </div>
          {worst.length === 0 ? (
            <div className="admin-form-help">No articles to score yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Keyword</th>
                  <th style={{ textAlign: 'right' }}>SEO</th>
                  <th style={{ textAlign: 'right' }}>CTA</th>
                  <th style={{ textAlign: 'right' }}>Words</th>
                  <th style={{ textAlign: 'right' }}>Meta desc</th>
                </tr>
              </thead>
              <tbody>
                {worst.map(s => (
                  <tr key={s.slug}>
                    <td>
                      <Link href={`/admin/content/${s.slug}`} className="admin-title-link">
                        <span className="admin-title-cell">{s.title}</span>
                        <span className="admin-slug-cell">{s.slug}</span>
                      </Link>
                    </td>
                    <td>
                      <span className={`admin-pill ${s.type}`}>{typeLabel(s.type).toLowerCase()}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: s.targetKeyword ? 'var(--admin-text)' : 'var(--admin-warning)' }}>
                      {s.targetKeyword || 'missing'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={ratioClass(s.seoPassed, s.seoTotal)}>
                        {s.seoPassed}/{s.seoTotal}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={ratioClass(s.ctaPassed, s.ctaTotal)}>
                        {s.ctaPassed}/{s.ctaTotal}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: s.wordCount < 1500 ? 'var(--admin-warning)' : 'var(--admin-text-muted)' }}>
                      {s.wordCount.toLocaleString()}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        color:
                          s.metaDescriptionLength < 150 || s.metaDescriptionLength > 160
                            ? 'var(--admin-warning)'
                            : 'var(--admin-text-muted)',
                      }}
                    >
                      {s.metaDescriptionLength}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
