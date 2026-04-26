import Link from 'next/link';
import {
  getActivity,
  ACTIVITY_KIND_LABELS,
  ACTIVITY_GROUPS,
  type ActivityEntry,
} from '@/lib/activity';
import { getActiveStream } from '@/lib/streams';

export const dynamic = 'force-dynamic';

const GROUPS = Array.from(new Set(ACTIVITY_GROUPS.map(g => g.group)));

const KIND_TO_GROUP: Record<string, string> = Object.fromEntries(
  ACTIVITY_GROUPS.map(g => [g.kind, g.group]),
);

interface PageProps {
  searchParams: Promise<{ group?: string }>;
}

function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const min = Math.round(diff / (60 * 1000));
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const d = new Date(t);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function bucketByDay(entries: ActivityEntry[]): { day: string; entries: ActivityEntry[] }[] {
  const buckets = new Map<string, ActivityEntry[]>();
  for (const e of entries) {
    const key = (e.at || '').slice(0, 10) || 'unknown';
    const list = buckets.get(key) ?? [];
    list.push(e);
    buckets.set(key, list);
  }
  return Array.from(buckets.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, entries]) => ({ day, entries }));
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function ActivityPage({ searchParams }: PageProps) {
  const { group: groupRaw } = await searchParams;
  const group = groupRaw && GROUPS.includes(groupRaw) ? groupRaw : undefined;

  const stream = await getActiveStream();
  const entries = await getActivity(stream.id, { limit: 500, group });
  const days = bucketByDay(entries);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">{stream.name} · Operations</div>
          <h1>Activity log</h1>
        </div>
        <div className="admin-topbar-meta">
          {entries.length} event{entries.length === 1 ? '' : 's'}{group ? ` in ${group}` : ''}
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-filter-stack">
          <div className="admin-filter-group">
            <span className="admin-filter-label">Group</span>
            <Link
              href="/admin/activity"
              className={`admin-filter${!group ? ' active' : ''}`}
            >
              All
            </Link>
            {GROUPS.map(g => (
              <Link
                key={g}
                href={`/admin/activity?group=${encodeURIComponent(g)}`}
                className={`admin-filter${group === g ? ' active' : ''}`}
              >
                {g}
              </Link>
            ))}
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Nothing yet</h2>
                <div className="admin-card-sub">
                  Saves, publishes, deletes, signups, and sends will start appearing here as soon as they happen.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-activity-list">
            {days.map(({ day, entries }) => (
              <div key={day} className="admin-activity-day">
                <div className="admin-activity-day-head">{formatDay(day)}</div>
                <ul className="admin-activity-entries">
                  {entries.map(e => (
                    <li key={e.id} className="admin-activity-entry">
                      <div className="admin-activity-entry-time">{relativeTime(e.at)}</div>
                      <div className="admin-activity-entry-body">
                        <div className="admin-activity-entry-head">
                          <span className={`admin-pill kind-${KIND_TO_GROUP[e.kind]?.toLowerCase() ?? 'other'}`}>
                            {ACTIVITY_KIND_LABELS[e.kind] ?? e.kind}
                          </span>
                          <strong className="admin-activity-entry-subject">{e.subject}</strong>
                        </div>
                        {e.detail && <div className="admin-activity-entry-detail">{e.detail}</div>}
                        {e.href && (
                          <Link href={e.href} className="admin-affiliate-link">View →</Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
