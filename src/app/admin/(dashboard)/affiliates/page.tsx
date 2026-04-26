import Link from 'next/link';
import { getAffiliates } from '@/lib/affiliate-data';
import { getActiveStream } from '@/lib/streams';
import AffiliateForm from './AffiliateForm';
import { deleteAffiliateAction } from './actions';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  rejected: 'Rejected',
  paused: 'Paused',
};

export default function AffiliatesPage() {
  const stream = getActiveStream();
  const programs = getAffiliates(stream.id);
  const active = programs.filter(p => p.status === 'active').length;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Revenue</div>
          <h1>Affiliate programs</h1>
        </div>
        <div className="admin-topbar-meta">
          {programs.length} program{programs.length === 1 ? '' : 's'} · {active} active
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-affiliate-actions" style={{ gap: '0.5rem' }}>
          <Link href="/admin/affiliates/audit" className="admin-button-ghost">Run audit</Link>
          <AffiliateForm />
        </div>

        {programs.length === 0 ? (
          <div className="admin-card" style={{ marginTop: '1.25rem' }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">No programs yet</h2>
                <div className="admin-card-sub">
                  Add the affiliate programs you've applied to or are running. Status tracks each one through application → active.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-affiliate-list">
            {programs.map(p => (
              <div key={p.id} className="admin-card admin-affiliate-card">
                <div className="admin-affiliate-card-head">
                  <div>
                    <h2 className="admin-card-title">{p.toolName}</h2>
                    <div className="admin-card-sub">
                      {p.commissionRate || 'No commission noted'}
                      {p.cookieDuration && <> · {p.cookieDuration} cookie</>}
                    </div>
                  </div>
                  <span className={`admin-pill status-${p.status}`}>{STATUS_LABELS[p.status] ?? p.status}</span>
                </div>

                {(p.signupUrl || p.notes) && (
                  <div className="admin-affiliate-card-body">
                    {p.signupUrl && (
                      <a href={p.signupUrl} target="_blank" rel="noreferrer" className="admin-affiliate-link">
                        {p.signupUrl}
                      </a>
                    )}
                    {p.notes && <p className="admin-affiliate-notes">{p.notes}</p>}
                  </div>
                )}

                <details className="admin-affiliate-edit">
                  <summary>Edit</summary>
                  <div style={{ marginTop: '0.75rem' }}>
                    <AffiliateForm existing={p} />
                    <form action={deleteAffiliateAction} style={{ marginTop: '0.625rem' }}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="admin-button-danger">Delete program</button>
                    </form>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
