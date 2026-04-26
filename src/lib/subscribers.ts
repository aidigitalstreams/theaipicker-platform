import { eq, and, desc } from 'drizzle-orm';
import { getDb, schema } from './db';
import type { Subscriber as DbSubscriber } from './db';

export type SubscriberSource = 'comparison-builder' | 'free-tools' | 'newsletter' | 'other';

export interface EmailSubscriber {
  id: string;
  streamId: string;
  email: string;
  source: SubscriberSource;
  status: 'active' | 'unsubscribed';
  context?: string;
  createdAt: string;
  unsubscribedAt?: string;
}

const VALID_SOURCES: SubscriberSource[] = ['comparison-builder', 'free-tools', 'newsletter', 'other'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidSource(value: string): value is SubscriberSource {
  return (VALID_SOURCES as string[]).includes(value);
}

function rowToSubscriber(row: DbSubscriber): EmailSubscriber {
  return {
    id: row.id,
    streamId: row.streamId,
    email: row.email,
    source: row.source as SubscriberSource,
    status: (row.status as 'active' | 'unsubscribed'),
    context: row.context ?? undefined,
    createdAt: row.createdAt.toISOString(),
    unsubscribedAt: row.unsubscribedAt ? row.unsubscribedAt.toISOString() : undefined,
  };
}

export async function getSubscribers(streamId?: string): Promise<EmailSubscriber[]> {
  const db = getDb();
  const rows = streamId
    ? await db.select().from(schema.subscribers)
        .where(eq(schema.subscribers.streamId, streamId))
        .orderBy(desc(schema.subscribers.createdAt))
    : await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
  return rows.map(rowToSubscriber);
}

export interface AddSubscriberInput {
  streamId: string;
  email: string;
  source: SubscriberSource;
  context?: string;
}

export interface AddSubscriberResult {
  ok: boolean;
  reason?: 'invalid-email' | 'invalid-source' | 'already-subscribed';
  subscriber?: EmailSubscriber;
}

export async function addSubscriber(input: AddSubscriberInput): Promise<AddSubscriberResult> {
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) return { ok: false, reason: 'invalid-email' };
  if (!isValidSource(input.source)) return { ok: false, reason: 'invalid-source' };

  const db = getDb();
  const [existing] = await db.select().from(schema.subscribers)
    .where(and(eq(schema.subscribers.email, email), eq(schema.subscribers.streamId, input.streamId)))
    .limit(1);

  if (existing) {
    if (existing.status === 'unsubscribed') {
      const [updated] = await db.update(schema.subscribers)
        .set({
          status: 'active',
          unsubscribedAt: null,
          source: input.source,
          context: input.context ?? existing.context,
        })
        .where(eq(schema.subscribers.id, existing.id))
        .returning();
      return { ok: true, subscriber: rowToSubscriber(updated) };
    }
    return { ok: false, reason: 'already-subscribed', subscriber: rowToSubscriber(existing) };
  }

  const [created] = await db.insert(schema.subscribers).values({
    id: genId(),
    streamId: input.streamId,
    email,
    source: input.source,
    status: 'active',
    context: input.context ?? null,
  }).returning();
  return { ok: true, subscriber: rowToSubscriber(created) };
}

export async function unsubscribe(id: string): Promise<void> {
  const db = getDb();
  await db.update(schema.subscribers)
    .set({ status: 'unsubscribed', unsubscribedAt: new Date() })
    .where(eq(schema.subscribers.id, id));
}

export async function deleteSubscriber(id: string): Promise<void> {
  const db = getDb();
  await db.delete(schema.subscribers).where(eq(schema.subscribers.id, id));
}

export function subscribersToCsv(rows: EmailSubscriber[]): string {
  const header = 'email,status,source,context,created_at,unsubscribed_at';
  const lines = rows.map(r => [
    r.email,
    r.status,
    r.source,
    r.context ?? '',
    r.createdAt,
    r.unsubscribedAt ?? '',
  ].map(cell => {
    const s = String(cell);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(','));
  return [header, ...lines].join('\n') + '\n';
}
