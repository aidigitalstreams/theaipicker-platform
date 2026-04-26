import { eq, desc } from 'drizzle-orm';
import { getDb, schema } from './db';
import type { ResearchNote as DbResearchNote } from './db';
import { RESEARCH_KINDS, isResearchKind, type ResearchKind } from './research-kinds';

export { RESEARCH_KINDS, isResearchKind } from './research-kinds';
export type { ResearchKind } from './research-kinds';

export interface ResearchNote {
  id: string;
  streamId: string;
  kind: ResearchKind;
  title: string;
  body: string;
  source?: string;
  status: 'open' | 'actioned' | 'archived';
  createdAt: string;
  updatedAt: string;
}

const VALID_STATUS: ResearchNote['status'][] = ['open', 'actioned', 'archived'];

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function rowToNote(row: DbResearchNote): ResearchNote {
  return {
    id: row.id,
    streamId: row.streamId,
    kind: row.kind as ResearchKind,
    title: row.title,
    body: row.body,
    source: row.source ?? undefined,
    status: row.status as ResearchNote['status'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function isResearchStatus(v: string): v is ResearchNote['status'] {
  return (VALID_STATUS as string[]).includes(v);
}

export async function getResearchNotes(streamId?: string): Promise<ResearchNote[]> {
  const db = getDb();
  const rows = streamId
    ? await db.select().from(schema.researchNotes)
        .where(eq(schema.researchNotes.streamId, streamId))
        .orderBy(desc(schema.researchNotes.updatedAt))
    : await db.select().from(schema.researchNotes).orderBy(desc(schema.researchNotes.updatedAt));
  return rows.map(rowToNote);
}

export interface SaveNoteInput {
  id?: string;
  streamId: string;
  kind: ResearchKind;
  title: string;
  body: string;
  source?: string;
  status: ResearchNote['status'];
}

export async function saveResearchNote(input: SaveNoteInput): Promise<ResearchNote> {
  const db = getDb();
  const now = new Date();
  if (input.id) {
    const [updated] = await db.update(schema.researchNotes)
      .set({
        kind: input.kind,
        title: input.title,
        body: input.body,
        source: input.source ?? null,
        status: input.status,
        updatedAt: now,
      })
      .where(eq(schema.researchNotes.id, input.id))
      .returning();
    if (updated) return rowToNote(updated);
  }
  const [created] = await db.insert(schema.researchNotes).values({
    id: genId(),
    streamId: input.streamId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    source: input.source ?? null,
    status: input.status,
  }).returning();
  return rowToNote(created);
}

export async function deleteResearchNote(id: string): Promise<void> {
  const db = getDb();
  await db.delete(schema.researchNotes).where(eq(schema.researchNotes.id, id));
}
