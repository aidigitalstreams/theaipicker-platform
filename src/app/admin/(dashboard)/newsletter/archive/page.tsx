import Link from 'next/link';
import { getNewsletters } from '@/lib/newsletters';
import { getActiveStream } from '@/lib/streams';

export const dynamic = 'force-dynamic';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function NewsletterArchivePage() {
  const stream = getActiveStream();
  const sent = getNewsletters(stream.id)
    .filter(n => n.status === 'sent')
    .sort((a, b) => (b.sentAt ?? b.updatedAt).localeCompare(a.sentAt ?? a.updatedAt));

  const totalRecipients = sent.reduce((acc, n) => acc + (n.recipientCount ?? 0), 0);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">
            {stream.name} ·{' '}
            <Link href="/admin/newsletter/compose" className="admin-breadcrumb-link">Newsletter</Link>
          </div>
          <h1>Archive</h1>
        </div>
        <div className="admin-topbar-meta">
          {sent.length} sent · {totalRecipients.toLocaleString()} total recipient{totalRecipients === 1 ? '' : 's'}
        </div>
      </div>

      <div className="admin-content">
        {sent.length === 0 ? (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">No newsletters sent yet</h2>
                <div className="admin-card-sub">
                  When you mark a draft as sent on the compose page, it'll show up here with the recipient count snapshot.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Sent</th>
                  <th style={{ textAlign: 'right' }}>Recipients</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {sent.map(n => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/admin/newsletter/compose/${n.id}`} className="admin-title-link">
                        <span className="admin-title-cell">{n.subject || '(untitled)'}</span>
                        {n.preview && <span className="admin-slug-cell">{n.preview}</span>}
                      </Link>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(n.sentAt)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {(n.recipientCount ?? 0).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/newsletter/compose/${n.id}`} className="admin-button-ghost" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
                        View
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
