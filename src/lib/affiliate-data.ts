import { eq, desc } from 'drizzle-orm';
import { getDb, schema } from './db';
import type { Affiliate as DbAffiliate, RevenueEntry as DbRevenueEntry } from './db';

export interface AffiliateProgram {
  id: string;
  streamId: string;
  toolName: string;
  commissionRate: string;
  cookieDuration: string;
  signupUrl: string;
  status: 'active' | 'pending' | 'rejected' | 'paused';
  notes?: string;
  createdAt: string;
}

export interface RevenueEntry {
  id: string;
  streamId: string;
  date: string;
  toolName: string;
  amount: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function rowToAffiliate(row: DbAffiliate): AffiliateProgram {
  return {
    id: row.id,
    streamId: row.streamId,
    toolName: row.toolName,
    commissionRate: row.commissionRate,
    cookieDuration: row.cookieDuration,
    signupUrl: row.signupUrl,
    status: row.status as AffiliateProgram['status'],
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToRevenue(row: DbRevenueEntry): RevenueEntry {
  return {
    id: row.id,
    streamId: row.streamId,
    date: row.date,
    toolName: row.toolName,
    amount: Number(row.amount),
    currency: row.currency,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getAffiliates(streamId?: string): Promise<AffiliateProgram[]> {
  const db = getDb();
  const rows = streamId
    ? await db.select().from(schema.affiliates)
        .where(eq(schema.affiliates.streamId, streamId))
        .orderBy(desc(schema.affiliates.createdAt))
    : await db.select().from(schema.affiliates).orderBy(desc(schema.affiliates.createdAt));
  return rows.map(rowToAffiliate);
}

export async function saveAffiliate(
  input: Omit<AffiliateProgram, 'id' | 'createdAt' | 'streamId'> & { id?: string; streamId: string },
): Promise<AffiliateProgram> {
  const db = getDb();
  if (input.id) {
    const [updated] = await db.update(schema.affiliates)
      .set({
        toolName: input.toolName,
        commissionRate: input.commissionRate,
        cookieDuration: input.cookieDuration,
        signupUrl: input.signupUrl,
        status: input.status,
        notes: input.notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.affiliates.id, input.id))
      .returning();
    if (updated) return rowToAffiliate(updated);
  }
  const [created] = await db.insert(schema.affiliates).values({
    id: genId(),
    streamId: input.streamId,
    toolName: input.toolName,
    commissionRate: input.commissionRate,
    cookieDuration: input.cookieDuration,
    signupUrl: input.signupUrl,
    status: input.status,
    notes: input.notes ?? null,
  }).returning();
  return rowToAffiliate(created);
}

export async function deleteAffiliate(id: string): Promise<void> {
  const db = getDb();
  await db.delete(schema.affiliates).where(eq(schema.affiliates.id, id));
}

export async function getRevenueEntries(streamId?: string): Promise<RevenueEntry[]> {
  const db = getDb();
  const rows = streamId
    ? await db.select().from(schema.revenueEntries)
        .where(eq(schema.revenueEntries.streamId, streamId))
        .orderBy(desc(schema.revenueEntries.date))
    : await db.select().from(schema.revenueEntries).orderBy(desc(schema.revenueEntries.date));
  return rows.map(rowToRevenue);
}

export async function saveRevenueEntry(
  input: Omit<RevenueEntry, 'id' | 'createdAt' | 'streamId'> & { streamId: string },
): Promise<RevenueEntry> {
  const db = getDb();
  const [created] = await db.insert(schema.revenueEntries).values({
    id: genId(),
    streamId: input.streamId,
    date: input.date,
    toolName: input.toolName,
    amount: input.amount.toFixed(2),
    currency: input.currency,
    notes: input.notes ?? null,
  }).returning();
  return rowToRevenue(created);
}

export async function deleteRevenueEntry(id: string): Promise<void> {
  const db = getDb();
  await db.delete(schema.revenueEntries).where(eq(schema.revenueEntries.id, id));
}

export interface RevenueSummary {
  totalAllTime: number;
  thisMonth: number;
  byTool: { toolName: string; total: number }[];
  currency: string;
}

export async function getRevenueSummary(streamId?: string): Promise<RevenueSummary> {
  const entries = await getRevenueEntries(streamId);
  if (entries.length === 0) {
    return { totalAllTime: 0, thisMonth: 0, byTool: [], currency: 'GBP' };
  }
  const currency = entries[0].currency || 'GBP';
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let total = 0;
  let monthTotal = 0;
  const byTool = new Map<string, number>();
  for (const e of entries) {
    total += e.amount;
    if (e.date.startsWith(monthKey)) monthTotal += e.amount;
    byTool.set(e.toolName, (byTool.get(e.toolName) || 0) + e.amount);
  }
  return {
    totalAllTime: total,
    thisMonth: monthTotal,
    byTool: Array.from(byTool.entries())
      .map(([toolName, total]) => ({ toolName, total }))
      .sort((a, b) => b.total - a.total),
    currency,
  };
}
