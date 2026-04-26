import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsletter } from '@/lib/newsletters';
import { getSubscribers } from '@/lib/subscribers';
import { getActiveStream } from '@/lib/streams';
import NewsletterForm from '../../NewsletterForm';
import { markSentAction, deleteNewsletterAction } from '../../actions';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function ComposeNewsletterPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;
  const newsletter = await getNewsletter(id);
  if (!newsletter) notFound();

  const stream = await getActiveStream();
  if (newsletter.streamId !== stream.id) notFound();

  const subs = await getSubscribers(stream.id);
  const activeSubs = subs.filter(s => s.status === 'active').length;
  const isSent = newsletter.status === 'sent';

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">
            {stream.name} ·{' '}
            <Link href="/admin/newsletter/compose" className="admin-breadcrumb-link">Newsletter</Link>
          </div>
          <h1>{newsletter.subject || 'Untitled draft'}</h1>
        </div>
        <div className="admin-topbar-actions">
          {!isSent && (
            <form action={markSentAction}>
              <input type="hidden" name="id" value={newsletter.id} />
              <button type="submit" className="admin-button-success">
                Mark as sent ({activeSubs} recipient{activeSubs === 1 ? '' : 's'})
              </button>
            </form>
          )}
          <Link href="/admin/newsletter/archive" className="admin-button-ghost">Archive</Link>
        </div>
      </div>

      <div className="admin-content">
        {saved === '1' && (
          <div className="admin-form-success" role="status" style={{ marginBottom: '1rem' }}>Saved.</div>
        )}

        {isSent ? (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Sent</h2>
                <div className="admin-card-sub">
                  Sent {newsletter.sentAt && new Date(newsletter.sentAt).toLocaleString('en-GB')} · {newsletter.recipientCount ?? 0} recipient{newsletter.recipientCount === 1 ? '' : 's'}.
                </div>
              </div>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem' }}>{newsletter.subject}</h3>
            {newsletter.preview && (
              <p className="admin-form-help" style={{ marginBottom: '0.75rem' }}>{newsletter.preview}</p>
            )}
            <pre className="admin-newsletter-body">{newsletter.body}</pre>
          </div>
        ) : (
          <NewsletterForm existing={newsletter} />
        )}

        <div className="admin-form-section admin-form-section-wide admin-form-danger" style={{ marginTop: '1.25rem' }}>
          <h2 className="admin-form-section-title">Danger zone</h2>
          <form action={deleteNewsletterAction}>
            <input type="hidden" name="id" value={newsletter.id} />
            <button type="submit" className="admin-button-danger">Delete newsletter</button>
          </form>
        </div>
      </div>
    </>
  );
}
