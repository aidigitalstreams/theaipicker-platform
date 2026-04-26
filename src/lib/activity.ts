import { eq, and, gte, inArray, desc } from 'drizzle-orm';
import { getDb, schema } from './db';
import type { ActivityEntry as DbActivityEntry } from './db';

export type ActivityKind =
  | 'article-saved'
  | 'article-deleted'
  | 'article-published'
  | 'article-unpublished'
  | 'affiliate-saved'
  | 'affiliate-deleted'
  | 'revenue-added'
  | 'revenue-deleted'
  | 'stream-saved'
  | 'stream-activated'
  | 'stream-deleted'
  | 'research-saved'
  | 'research-deleted'
  | 'newsletter-saved'
  | 'newsletter-sent'
  | 'newsletter-deleted'
  | 'subscriber-added'
  | 'subscriber-unsubscribed'
  | 'subscriber-deleted';

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  'article-saved': 'Article saved',
  'article-deleted': 'Article deleted',
  'article-published': 'Article published',
  'article-unpublished': 'Article unpublished',
  'affiliate-saved': 'Affiliate program saved',
  'affiliate-deleted': 'Affiliate program deleted',
  'revenue-added': 'Revenue entry added',
  'revenue-deleted': 'Revenue entry deleted',
  'stream-saved': 'Stream saved',
  'stream-activated': 'Stream activated',
  'stream-deleted': 'Stream deleted',
  'research-saved': 'Research note saved',
  'research-deleted': 'Research note deleted',
  'newsletter-saved': 'Newsletter draft saved',
  'newsletter-sent': 'Newsletter sent',
  'newsletter-deleted': 'Newsletter deleted',
  'subscriber-added': 'New subscriber',
  'subscriber-unsubscribed': 'Subscriber opted out',
  'subscriber-deleted': 'Subscriber deleted',
};

export const ACTIVITY_GROUPS: { kind: ActivityKind; group: string }[] = [
  { kind: 'article-saved', group: 'Content' },
  { kind: 'article-deleted', group: 'Content' },
  { kind: 'article-published', group: 'Content' },
  { kind: 'article-unpublished', group: 'Content' },
  { kind: 'affiliate-saved', group: 'Revenue' },
  { kind: 'affiliate-deleted', group: 'Revenue' },
  { kind: 'revenue-added', group: 'Revenue' },
  { kind: 'revenue-deleted', group: 'Revenue' },
  { kind: 'stream-saved', group: 'Streams' },
  { kind: 'stream-activated', group: 'Streams' },
  { kind: 'stream-deleted', group: 'Streams' },
  { kind: 'research-saved', group: 'Intelligence' },
  { kind: 'research-deleted', group: 'Intelligence' },
  { kind: 'newsletter-saved', group: 'Audience' },
  { kind: 'newsletter-sent', group: 'Audience' },
  { kind: 'newsletter-deleted', group: 'Audience' },
  { kind: 'subscriber-added', group: 'Audience' },
  { kind: 'subscriber-unsubscribed', group: 'Audience' },
  { kind: 'subscriber-deleted', group: 'Audience' },
];

export interface ActivityEntry {
  id: string;
  streamId?: string;
  kind: ActivityKind;
  subject: string;
  detail?: string;
  href?: string;
  at: string;
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function rowToEntry(row: DbActivityEntry): ActivityEntry {
  return {
    id: row.id,
    streamId: row.streamId ?? undefined,
    kind: row.kind as ActivityKind,
    subject: row.subject,
    detail: row.detail ?? undefined,
    href: row.href ?? undefined,
    at: row.at.toISOString(),
  };
}

export interface LogInput {
  streamId?: string;
  kind: ActivityKind;
  subject: string;
  detail?: string;
  href?: string;
}

/**
 * Append a row to the activity log. Fail-soft — logs the error but never
 * throws, so a DB hiccup can't break a save action.
 */
export async function logActivity(input: LogInput): Promise<void> {
  try {
    const db = getDb();
    await db.insert(schema.activityEntries).values({
      id: genId(),
      streamId: input.streamId ?? null,
      kind: input.kind,
      subject: input.subject,
      detail: input.detail ?? null,
      href: input.href ?? null,
    });
  } catch (err) {
    console.error('logActivity failed:', err);
  }
}

export interface GetActivityOptions {
  limit?: number;
  kinds?: ActivityKind[];
  group?: string;
  sinceIso?: string;
}

export async function getActivity(streamId?: string, opts: GetActivityOptions = {}): Promise<ActivityEntry[]> {
  const db = getDb();
  const conditions = [];
  if (streamId) {
    // Match rows belonging to this stream OR with no stream attached.
    conditions.push(eq(schema.activityEntries.streamId, streamId));
  }
  let kinds = opts.kinds;
  if (opts.group) {
    const groupKinds = ACTIVITY_GROUPS.filter(g => g.group === opts.group).map(g => g.kind);
    kinds = kinds ? kinds.filter(k => groupKinds.includes(k)) : groupKinds;
  }
  if (kinds && kinds.length > 0) {
    conditions.push(inArray(schema.activityEntries.kind, kinds));
  }
  if (opts.sinceIso) {
    conditions.push(gte(schema.activityEntries.at, new Date(opts.sinceIso)));
  }

  const where = conditions.length === 1 ? conditions[0] : conditions.length > 1 ? and(...conditions) : undefined;
  const limit = opts.limit ?? 500;

  const rows = await (where
    ? db.select().from(schema.activityEntries).where(where).orderBy(desc(schema.activityEntries.at)).limit(limit)
    : db.select().from(schema.activityEntries).orderBy(desc(schema.activityEntries.at)).limit(limit));

  return rows.map(rowToEntry);
}

export function getActivityGroups(): string[] {
  return Array.from(new Set(ACTIVITY_GROUPS.map(g => g.group)));
}
