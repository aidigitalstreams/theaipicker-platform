import { desc } from 'drizzle-orm';
import { getDb, schema } from './db';
import type { BridgeHeartbeat as DbHeartbeat } from './db';

export interface BridgeHeartbeat {
  id: number;
  machineName: string;
  lastSeen: string;
}

const SLUG_RE = /^[A-Za-z0-9._-]{1,80}$/;

export function isValidMachineName(name: string): boolean {
  return SLUG_RE.test(name.trim());
}

function rowToHeartbeat(row: DbHeartbeat): BridgeHeartbeat {
  return {
    id: row.id,
    machineName: row.machineName,
    lastSeen: row.lastSeen.toISOString(),
  };
}

/**
 * Upsert a heartbeat for the named machine, stamping last_seen = now().
 * Uniqueness is enforced by the bridge_heartbeat_machine_idx unique index.
 */
export async function pingBridge(machineName: string): Promise<BridgeHeartbeat> {
  const db = getDb();
  const now = new Date();
  const [row] = await db.insert(schema.bridgeHeartbeat).values({
    machineName,
    lastSeen: now,
  }).onConflictDoUpdate({
    target: schema.bridgeHeartbeat.machineName,
    set: { lastSeen: now },
  }).returning();
  return rowToHeartbeat(row);
}

export async function getLatestHeartbeat(): Promise<BridgeHeartbeat | null> {
  const db = getDb();
  const [row] = await db.select().from(schema.bridgeHeartbeat)
    .orderBy(desc(schema.bridgeHeartbeat.lastSeen))
    .limit(1);
  return row ? rowToHeartbeat(row) : null;
}

export async function listHeartbeats(): Promise<BridgeHeartbeat[]> {
  const db = getDb();
  const rows = await db.select().from(schema.bridgeHeartbeat)
    .orderBy(desc(schema.bridgeHeartbeat.lastSeen));
  return rows.map(rowToHeartbeat);
}

export const BRIDGE_ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export function isBridgeOnline(heartbeat: BridgeHeartbeat | null, now: Date = new Date()): boolean {
  if (!heartbeat) return false;
  const last = Date.parse(heartbeat.lastSeen);
  if (Number.isNaN(last)) return false;
  return now.getTime() - last < BRIDGE_ONLINE_THRESHOLD_MS;
}
