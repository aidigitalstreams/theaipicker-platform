import { getResearchNotes, RESEARCH_KINDS } from '@/lib/research';
import { getActiveStream } from '@/lib/streams';
import NoteForm from './NoteForm';
import { deleteNoteAction } from './actions';

export const dynamic = 'force-dynamic';

const KIND_LABEL: Record<string, string> = Object.fromEntries(
  RESEARCH_KINDS.map(k => [k.value, k.label]),
);

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ResearchHubPage() {
  const stream = getActiveStream();
  const notes = getResearchNotes(stream.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const open = notes.filter(n => n.status === 'open');
  const actioned = notes.filter(n => n.status === 'actioned');
  const archived = notes.filter(n => n.status === 'archived');

  const byKind = new Map<string, number>();
  for (const n of open) byKind.set(n.kind, (byKind.get(n.kind) ?? 0) + 1);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Intelligence</div>
          <h1>Research Hub</h1>
        </div>
        <div className="admin-topbar-meta">
          {open.length} open · {actioned.length} actioned · {archived.length} archived
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          {RESEARCH_KINDS.map(k => (
            <div key={k.value} className="admin-stat">
              <div className="admin-stat-label">{k.label}</div>
              <div className="admin-stat-value">{byKind.get(k.value) ?? 0}</div>
              <div className="admin-stat-delta">Open notes</div>
            </div>
          ))}
        </div>

        <div className="admin-affiliate-actions" style={{ marginTop: '0.5rem' }}>
          <NoteForm />
        </div>

        {notes.length === 0 ? (
          <div className="admin-card" style={{ marginTop: '1.25rem' }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">No notes yet</h2>
                <div className="admin-card-sub">
                  Capture market briefs, competitor moves, new tool launches, and trend signals here. Each one becomes a tracked, status-managed note.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-research-list">
            {notes.map(n => (
              <div key={n.id} className={`admin-card admin-research-card status-${n.status}`}>
                <div className="admin-research-card-head">
                  <div>
                    <div className="admin-research-tags">
                      <span className={`admin-pill kind-${n.kind}`}>{KIND_LABEL[n.kind] ?? n.kind}</span>
                      <span className={`admin-pill status-${n.status === 'open' ? 'pending' : n.status === 'actioned' ? 'active' : 'paused'}`}>
                        {n.status}
                      </span>
                    </div>
                    <h2 className="admin-card-title" style={{ marginTop: '0.4rem' }}>{n.title}</h2>
                    <div className="admin-card-sub">Updated {formatDate(n.updatedAt)}</div>
                  </div>
                </div>
                {n.body && <p className="admin-research-body">{n.body}</p>}
                {n.source && (
                  <div className="admin-research-source">
                    <span className="admin-form-help">Source:</span>{' '}
                    {/^https?:\/\//.test(n.source) ? (
                      <a href={n.source} target="_blank" rel="noreferrer" className="admin-affiliate-link">{n.source}</a>
                    ) : (
                      <span>{n.source}</span>
                    )}
                  </div>
                )}
                <details className="admin-affiliate-edit">
                  <summary>Edit</summary>
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <NoteForm existing={n} />
                    <form action={deleteNoteAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button type="submit" className="admin-button-danger">Delete note</button>
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
