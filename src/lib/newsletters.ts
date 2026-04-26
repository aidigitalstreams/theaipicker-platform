import { eq, desc } from 'drizzle-orm';
import { getDb, schema } from './db';
import type { Newsletter as DbNewsletter } from './db';

export type NewsletterStatus = 'draft' | 'scheduled' | 'sent';

export interface Newsletter {
  id: string;
  streamId: string;
  subject: string;
  body: string;
  preview?: string;
  status: NewsletterStatus;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount?: number;
  createdAt: string;
  updatedAt: string;
}

const VALID_STATUS: NewsletterStatus[] = ['draft', 'scheduled', 'sent'];

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function rowToNewsletter(row: DbNewsletter): Newsletter {
  return {
    id: row.id,
    streamId: row.streamId,
    subject: row.subject,
    body: row.body,
    preview: row.preview ?? undefined,
    status: row.status as NewsletterStatus,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : undefined,
    sentAt: row.sentAt ? row.sentAt.toISOString() : undefined,
    recipientCount: row.recipientCount ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function isNewsletterStatus(v: string): v is NewsletterStatus {
  return (VALID_STATUS as string[]).includes(v);
}

export async function getNewsletters(streamId?: string): Promise<Newsletter[]> {
  const db = getDb();
  const rows = streamId
    ? await db.select().from(schema.newsletters)
        .where(eq(schema.newsletters.streamId, streamId))
        .orderBy(desc(schema.newsletters.updatedAt))
    : await db.select().from(schema.newsletters).orderBy(desc(schema.newsletters.updatedAt));
  return rows.map(rowToNewsletter);
}

export async function getNewsletter(id: string): Promise<Newsletter | undefined> {
  const db = getDb();
  const [row] = await db.select().from(schema.newsletters)
    .where(eq(schema.newsletters.id, id)).limit(1);
  return row ? rowToNewsletter(row) : undefined;
}

export interface SaveNewsletterInput {
  id?: string;
  streamId: string;
  subject: string;
  body: string;
  preview?: string;
  status: NewsletterStatus;
  scheduledAt?: string;
}

export async function saveNewsletter(input: SaveNewsletterInput): Promise<Newsletter> {
  const db = getDb();
  const now = new Date();
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;

  if (input.id) {
    const [updated] = await db.update(schema.newsletters)
      .set({
        subject: input.subject,
        body: input.body,
        preview: input.preview ?? null,
        status: input.status,
        scheduledAt,
        updatedAt: now,
      })
      .where(eq(schema.newsletters.id, input.id))
      .returning();
    if (updated) return rowToNewsletter(updated);
  }
  const [created] = await db.insert(schema.newsletters).values({
    id: genId(),
    streamId: input.streamId,
    subject: input.subject,
    body: input.body,
    preview: input.preview ?? null,
    status: input.status,
    scheduledAt,
  }).returning();
  return rowToNewsletter(created);
}

export async function markSent(id: string, recipientCount: number): Promise<Newsletter | undefined> {
  const db = getDb();
  const now = new Date();
  const [updated] = await db.update(schema.newsletters)
    .set({
      status: 'sent',
      sentAt: now,
      recipientCount,
      updatedAt: now,
    })
    .where(eq(schema.newsletters.id, id))
    .returning();
  return updated ? rowToNewsletter(updated) : undefined;
}

export async function deleteNewsletter(id: string): Promise<void> {
  const db = getDb();
  await db.delete(schema.newsletters).where(eq(schema.newsletters.id, id));
}
