import { listStreams, getActiveStreamId } from '@/lib/streams';
import StreamForm from './StreamForm';
import { setActiveStreamAction, deleteStreamAction } from './actions';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  planned: 'Planned',
  archived: 'Archived',
};

export default function StreamsPage() {
  const streams = listStreams();
  const activeId = getActiveStreamId();
  const onlyOne = streams.length <= 1;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">AI Digital Streams</div>
          <h1>Streams</h1>
        </div>
        <div className="admin-topbar-meta">
          {streams.length} stream{streams.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-affiliate-actions">
          <StreamForm />
        </div>

        <div className="admin-stream-list">
          {streams.map(s => {
            const isActive = s.id === activeId;
            return (
              <div key={s.id} className={`admin-card admin-stream-card${isActive ? ' active' : ''}`}>
                <div className="admin-stream-card-head">
                  <div>
                    <h2 className="admin-card-title">{s.name}</h2>
                    <div className="admin-card-sub">
                      <code>{s.id}</code>
                      {s.domain && <> · {s.domain}</>}
                    </div>
                  </div>
                  <div className="admin-stream-card-pills">
                    <span className={`admin-pill status-${s.status}`}>{STATUS_LABELS[s.status] ?? s.status}</span>
                    {isActive && <span className="admin-pill status-active">Active</span>}
                  </div>
                </div>

                {s.tagline && <p className="admin-affiliate-notes">{s.tagline}</p>}

                <div className="admin-stream-card-meta">
                  <span className="admin-form-help">Content folders:</span>
                  <div className="admin-stream-dir-pills">
                    {s.contentDirs.map(d => (
                      <span key={d} className="admin-pill">{d}</span>
                    ))}
                  </div>
                </div>

                <details className="admin-affiliate-edit">
                  <summary>Edit</summary>
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <StreamForm existing={s} />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {!isActive && (
                        <form action={setActiveStreamAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="admin-button-ghost">Make active</button>
                        </form>
                      )}
                      {!onlyOne && (
                        <form action={deleteStreamAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="admin-button-danger">Delete stream</button>
                        </form>
                      )}
                    </div>
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
