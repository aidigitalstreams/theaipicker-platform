import Link from 'next/link';
import { getNewsletters } from '@/lib/newsletters';
import { getActiveStream } from '@/lib/streams';
import NewsletterForm from '../NewsletterForm';

export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function NewsletterComposePage() {
  const stream = getActiveStream();
  const drafts = getNewsletters(stream.id)
    .filter(n => n.status !== 'sent')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Newsletter</div>
          <h1>Compose</h1>
        </div>
        <div className="admin-topbar-actions">
          <Link href="/admin/newsletter/archive" className="admin-button-ghost">View archive</Link>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">New newsletter</h2>
              <div className="admin-card-sub">Draft below — saving redirects to the editor for the new draft.</div>
            </div>
          </div>
          <NewsletterForm />
        </div>

        {drafts.length > 0 && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Drafts &amp; scheduled</h2>
                <div className="admin-card-sub">{drafts.length} in progress.</div>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {drafts.map(n => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/admin/newsletter/compose/${n.id}`} className="admin-title-link">
                        <span className="admin-title-cell">{n.subject || '(untitled)'}</span>
                        {n.preview && <span className="admin-slug-cell">{n.preview}</span>}
                      </Link>
                    </td>
                    <td>
                      <span className={`admin-pill status-${n.status === 'draft' ? 'draft' : 'scheduled'}`}>
                        {n.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                      {formatDate(n.updatedAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/newsletter/compose/${n.id}`} className="admin-button-ghost" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
