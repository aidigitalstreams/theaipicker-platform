import { eq } from 'drizzle-orm';
import { getDb, schema } from './db';
import type { Stream as DbStream } from './db';

export interface Stream {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  domain: string;
  contentDirs: string[];
  status: 'active' | 'planned' | 'archived';
}

const ACTIVE_STREAM_KEY = 'active_stream_id';

const FALLBACK_STREAM: Stream = {
  id: 'theaipicker',
  name: 'The AI Picker',
  slug: 'theaipicker',
  tagline: "We research AI tools so you don't have to.",
  domain: 'theaipicker.com',
  contentDirs: ['reviews', 'comparisons', 'best-of', 'guides', 'rankings'],
  status: 'active',
};

function rowToStream(row: DbStream): Stream {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    domain: row.domain,
    contentDirs: row.contentDirs,
    status: row.status as Stream['status'],
  };
}

export async function listStreams(): Promise<Stream[]> {
  const db = getDb();
  const rows = await db.select().from(schema.streams);
  if (rows.length === 0) return [FALLBACK_STREAM];
  return rows.map(rowToStream);
}

export async function getActiveStreamId(): Promise<string> {
  const db = getDb();
  const [setting] = await db.select().from(schema.appSettings)
    .where(eq(schema.appSettings.key, ACTIVE_STREAM_KEY))
    .limit(1);
  if (setting?.value) return setting.value;
  // Fall back to the first stream in the table.
  const [first] = await db.select().from(schema.streams).limit(1);
  return first?.id ?? FALLBACK_STREAM.id;
}

export async function getActiveStream(): Promise<Stream> {
  const id = await getActiveStreamId();
  const db = getDb();
  const [row] = await db.select().from(schema.streams).where(eq(schema.streams.id, id)).limit(1);
  if (row) return rowToStream(row);
  return FALLBACK_STREAM;
}

export async function getStream(id: string): Promise<Stream | undefined> {
  const db = getDb();
  const [row] = await db.select().from(schema.streams).where(eq(schema.streams.id, id)).limit(1);
  return row ? rowToStream(row) : undefined;
}

const VALID_SUBDIRS = ['reviews', 'comparisons', 'best-of', 'guides', 'rankings'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateStreamId(id: string): string | null {
  if (!id) return 'Stream id is required.';
  if (!SLUG_PATTERN.test(id)) return 'Stream id must be lowercase letters, numbers, and single hyphens.';
  return null;
}

export interface SaveStreamInput {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  domain: string;
  contentDirs: string[];
  status: Stream['status'];
}

export async function saveStream(input: SaveStreamInput, opts: { activate?: boolean } = {}): Promise<Stream> {
  const db = getDb();
  const dirs = input.contentDirs.filter(d => VALID_SUBDIRS.includes(d));
  const values = {
    id: input.id,
    name: input.name,
    slug: input.slug || input.id,
    tagline: input.tagline,
    domain: input.domain,
    contentDirs: dirs,
    status: input.status,
    updatedAt: new Date(),
  };
  const [row] = await db.insert(schema.streams).values(values)
    .onConflictDoUpdate({
      target: schema.streams.id,
      set: {
        name: values.name,
        slug: values.slug,
        tagline: values.tagline,
        domain: values.domain,
        contentDirs: values.contentDirs,
        status: values.status,
        updatedAt: values.updatedAt,
      },
    })
    .returning();
  if (opts.activate) {
    await setActiveStream(row.id);
  }
  return rowToStream(row);
}

export async function setActiveStream(id: string): Promise<void> {
  const db = getDb();
  // Verify the stream exists before pointing the active flag at it.
  const [existing] = await db.select({ id: schema.streams.id }).from(schema.streams)
    .where(eq(schema.streams.id, id)).limit(1);
  if (!existing) return;
  await db.insert(schema.appSettings).values({ key: ACTIVE_STREAM_KEY, value: id, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.appSettings.key,
      set: { value: id, updatedAt: new Date() },
    });
}

export async function deleteStream(id: string): Promise<void> {
  const db = getDb();
  const all = await db.select({ id: schema.streams.id }).from(schema.streams);
  if (all.length <= 1) return;
  await db.delete(schema.streams).where(eq(schema.streams.id, id));
  // If the deleted stream was active, point active at whatever remains.
  const activeId = await getActiveStreamId();
  if (activeId === id) {
    const [first] = await db.select({ id: schema.streams.id }).from(schema.streams).limit(1);
    if (first) await setActiveStream(first.id);
  }
}
