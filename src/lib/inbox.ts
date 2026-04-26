import { eq, gte, asc, desc, inArray, sql } from 'drizzle-orm';
import { getDb, schema } from './db';
import type { InboxItem as DbInboxItem } from './db';

export type InboxStatus =
  | 'queued'
  | 'execute-requested'
  | 'in-progress'
  | 'done'
  | 'failed';

export type InboxPriority = 'high' | 'medium' | 'low';

export interface InboxItem {
  id: number;
  title: string;
  priority: InboxPriority;
  category: string | null;
  instructions: string;
  status: InboxStatus;
  executionOrder: number;
  createdDate: string;
  completedDate: string | null;
  resultNotes: string | null;
}

export const PRIORITIES: { value: InboxPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'content', label: 'Content' },
  { value: 'seo', label: 'SEO' },
  { value: 'research', label: 'Research' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'operations', label: 'Operations' },
  { value: 'design', label: 'Design' },
  { value: 'other', label: 'Other' },
];

const VALID_PRIORITIES: InboxPriority[] = ['high', 'medium', 'low'];
const VALID_STATUSES: InboxStatus[] = ['queued', 'execute-requested', 'in-progress', 'done', 'failed'];
const COMPLETED_STATUSES: InboxStatus[] = ['done', 'failed'];

export function isPriority(v: string): v is InboxPriority {
  return (VALID_PRIORITIES as string[]).includes(v);
}

export function isStatus(v: string): v is InboxStatus {
  return (VALID_STATUSES as string[]).includes(v);
}

function rowToItem(row: DbInboxItem): InboxItem {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority as InboxPriority,
    category: row.category,
    instructions: row.instructions,
    status: row.status as InboxStatus,
    executionOrder: row.executionOrder,
    createdDate: row.createdDate.toISOString(),
    completedDate: row.completedDate ? row.completedDate.toISOString() : null,
    resultNotes: row.resultNotes,
  };
}

/** Open items — anything that's not done/failed. Ordered by execution_order then id. */
export async function getOpenInbox(): Promise<InboxItem[]> {
  const db = getDb();
  const rows = await db.select().from(schema.inbox)
    .where(sql`${schema.inbox.status} NOT IN ('done', 'failed')`)
    .orderBy(asc(schema.inbox.executionOrder), asc(schema.inbox.id));
  return rows.map(rowToItem);
}

/** Completed items (done/failed) — most recent first. */
export async function getCompletedInbox(limit = 50): Promise<InboxItem[]> {
  const db = getDb();
  const rows = await db.select().from(schema.inbox)
    .where(inArray(schema.inbox.status, COMPLETED_STATUSES as unknown as string[]))
    .orderBy(desc(schema.inbox.completedDate), desc(schema.inbox.id))
    .limit(limit);
  return rows.map(rowToItem);
}

export interface InboxCounts {
  queued: number;
  inProgress: number;
  executeRequested: number;
  completedToday: number;
  totalOpen: number;
}

export async function getInboxCounts(): Promise<InboxCounts> {
  const db = getDb();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [counts] = await db
    .select({
      queued: sql<number>`COUNT(*) FILTER (WHERE ${schema.inbox.status} = 'queued')::int`,
      inProgress: sql<number>`COUNT(*) FILTER (WHERE ${schema.inbox.status} = 'in-progress')::int`,
      executeRequested: sql<number>`COUNT(*) FILTER (WHERE ${schema.inbox.status} = 'execute-requested')::int`,
      totalOpen: sql<number>`COUNT(*) FILTER (WHERE ${schema.inbox.status} NOT IN ('done', 'failed'))::int`,
    })
    .from(schema.inbox);

  const [completedTodayRow] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(schema.inbox)
    .where(sql`${schema.inbox.status} IN ('done', 'failed') AND ${schema.inbox.completedDate} >= ${startOfDay}`);

  return {
    queued: counts?.queued ?? 0,
    inProgress: counts?.inProgress ?? 0,
    executeRequested: counts?.executeRequested ?? 0,
    completedToday: completedTodayRow?.count ?? 0,
    totalOpen: counts?.totalOpen ?? 0,
  };
}

export interface AddInboxInput {
  title: string;
  priority: InboxPriority;
  category?: string;
  instructions: string;
}

export async function addInboxItem(input: AddInboxInput): Promise<InboxItem> {
  const db = getDb();
  // Append at the end of the queue.
  const [maxRow] = await db
    .select({ max: sql<number>`COALESCE(MAX(${schema.inbox.executionOrder}), -1)::int` })
    .from(schema.inbox);
  const nextOrder = (maxRow?.max ?? -1) + 1;

  const [row] = await db.insert(schema.inbox).values({
    title: input.title,
    priority: input.priority,
    category: input.category ?? null,
    instructions: input.instructions,
    status: 'queued',
    executionOrder: nextOrder,
  }).returning();
  return rowToItem(row);
}

export async function requestExecution(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const db = getDb();
  await db.update(schema.inbox)
    .set({ status: 'execute-requested' })
    .where(inArray(schema.inbox.id, ids));
}

/**
 * Persist a new ordering by writing the index of each id as its
 * execution_order. Caller passes the ids in their desired order.
 */
export async function reorderInbox(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;
  const db = getDb();
  // Run inside a single batch — Drizzle's neon-http driver doesn't expose tx(),
  // so we do parallel updates. They're independent, so concurrency is fine.
  await Promise.all(
    orderedIds.map((id, idx) =>
      db.update(schema.inbox).set({ executionOrder: idx }).where(eq(schema.inbox.id, id)),
    ),
  );
}

export async function completeInboxItem(id: number, resultNotes?: string): Promise<void> {
  const db = getDb();
  await db.update(schema.inbox)
    .set({ status: 'done', completedDate: new Date(), resultNotes: resultNotes ?? null })
    .where(eq(schema.inbox.id, id));
}

export async function deleteInboxItem(id: number): Promise<void> {
  const db = getDb();
  await db.delete(schema.inbox).where(eq(schema.inbox.id, id));
}

export async function getInboxItemById(id: number): Promise<InboxItem | null> {
  const db = getDb();
  const [row] = await db.select().from(schema.inbox).where(eq(schema.inbox.id, id)).limit(1);
  return row ? rowToItem(row) : null;
}

export interface InboxFilter {
  status?: InboxStatus | InboxStatus[];
  limit?: number;
}

export async function listInboxItems(filter: InboxFilter = {}): Promise<InboxItem[]> {
  const db = getDb();
  const conditions = [] as ReturnType<typeof eq>[];
  if (filter.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    if (statuses.length > 0) {
      conditions.push(inArray(schema.inbox.status, statuses as unknown as string[]));
    }
  }
  const limit = filter.limit ?? 1000;
  const rows = conditions.length > 0
    ? await db.select().from(schema.inbox).where(conditions[0])
        .orderBy(asc(schema.inbox.executionOrder), asc(schema.inbox.id))
        .limit(limit)
    : await db.select().from(schema.inbox)
        .orderBy(asc(schema.inbox.executionOrder), asc(schema.inbox.id))
        .limit(limit);
  return rows.map(rowToItem);
}

export interface UpdateInboxStatusInput {
  status?: InboxStatus;
  resultNotes?: string | null;
}

export async function updateInboxStatus(id: number, input: UpdateInboxStatusInput): Promise<InboxItem | null> {
  const update: Record<string, unknown> = {};
  if (input.status) {
    update.status = input.status;
    if (input.status === 'done' || input.status === 'failed') {
      update.completedDate = new Date();
    }
  }
  if (input.resultNotes !== undefined) {
    update.resultNotes = input.resultNotes;
  }
  if (Object.keys(update).length === 0) {
    return getInboxItemById(id);
  }
  const db = getDb();
  const [row] = await db.update(schema.inbox).set(update).where(eq(schema.inbox.id, id)).returning();
  return row ? rowToItem(row) : null;
}

export const PRIORITY_LABELS: Record<InboxPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const STATUS_LABELS: Record<InboxStatus, string> = {
  'queued': 'Queued',
  'execute-requested': 'Execute requested',
  'in-progress': 'In progress',
  'done': 'Done',
  'failed': 'Failed',
};
