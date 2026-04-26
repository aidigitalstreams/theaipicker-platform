import {
  getOpenInbox,
  getCompletedInbox,
  getInboxCounts,
  PRIORITY_LABELS,
  STATUS_LABELS,
  CATEGORIES,
  type InboxItem,
} from '@/lib/inbox';
import AddInboxForm from './AddInboxForm';
import InboxBoard from './InboxBoard';
import { deleteInboxItemAction } from './actions';

export const dynamic = 'force-dynamic';

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function InboxPage() {
  const [open, completed, counts] = await Promise.all([
    getOpenInbox(),
    getCompletedInbox(50),
    getInboxCounts(),
  ]);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">Operations</div>
          <h1>Inbox</h1>
        </div>
        <div className="admin-topbar-meta">
          {counts.totalOpen} open · {counts.completedToday} done today
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-label">Queued</div>
            <div className="admin-stat-value">{counts.queued}</div>
            <div className="admin-stat-delta">Waiting in line</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Execute requested</div>
            <div className="admin-stat-value">{counts.executeRequested}</div>
            <div className="admin-stat-delta">Ready for the bridge</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">In progress</div>
            <div className="admin-stat-value">{counts.inProgress}</div>
            <div className="admin-stat-delta">Currently running</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Completed today</div>
            <div className="admin-stat-value">{counts.completedToday}</div>
            <div className="admin-stat-delta">Closed since midnight</div>
          </div>
        </div>

        <div className="admin-card admin-inbox-add" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Add a job</h2>
              <div className="admin-card-sub">Drops in at the end of the queue.</div>
            </div>
          </div>
          <AddInboxForm />
        </div>

        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Open queue</h2>
              <div className="admin-card-sub">
                Click a row to expand. Tick the checkbox to select for execute or reorder.
              </div>
            </div>
          </div>
          <InboxBoard items={open} />
        </div>

        <CompletedSection items={completed} />
      </div>
    </>
  );
}

function CompletedSection({ items }: { items: InboxItem[] }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Completed jobs</h2>
          <div className="admin-card-sub">Most recent 50.</div>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="admin-form-help">Nothing closed out yet.</div>
      ) : (
        <ul className="admin-inbox-list admin-inbox-completed-list">
          {items.map(item => (
            <li key={item.id} className={`admin-inbox-row status-${item.status}`}>
              <div className="admin-inbox-row-main">
                <div className="admin-inbox-row-head">
                  <span className={`admin-inbox-priority priority-${item.priority}`}>
                    {PRIORITY_LABELS[item.priority]}
                  </span>
                  <span className={`admin-pill ${item.status === 'failed' ? 'severity-error' : 'status-active'}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                  {item.category && (
                    <span className="admin-pill kind-other">
                      {CATEGORY_LABELS[item.category] ?? item.category}
                    </span>
                  )}
                  <span className="admin-inbox-row-title">{item.title}</span>
                </div>
                <div className="admin-inbox-row-meta">
                  <span>Closed {formatDateTime(item.completedDate)}</span>
                </div>
                {item.resultNotes && (
                  <p className="admin-inbox-result-notes">{item.resultNotes}</p>
                )}
              </div>
              <form action={deleteInboxItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="admin-button-ghost admin-inbox-row-delete">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
