import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'content', 'data');
const AFFILIATES_FILE = path.join(DATA_DIR, 'affiliates.json');
const REVENUE_FILE = path.join(DATA_DIR, 'revenue.json');

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

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(file: string): T[] {
  ensureDir();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]\n', 'utf-8');
    return [];
  }
  const raw = fs.readFileSync(file, 'utf-8').trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJson(file: string, data: unknown[]): void {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function withStreamFilter<T extends { streamId?: string }>(rows: T[], streamId?: string): T[] {
  if (!streamId) return rows;
  return rows.filter(r => r.streamId === streamId);
}

export function getAffiliates(streamId?: string): AffiliateProgram[] {
  const all = readJson<AffiliateProgram>(AFFILIATES_FILE);
  return withStreamFilter(all, streamId);
}

export function saveAffiliate(
  input: Omit<AffiliateProgram, 'id' | 'createdAt' | 'streamId'> & { id?: string; streamId: string },
): AffiliateProgram {
  const all = readJson<AffiliateProgram>(AFFILIATES_FILE);
  if (input.id) {
    const idx = all.findIndex(a => a.id === input.id);
    if (idx >= 0) {
      const merged: AffiliateProgram = { ...all[idx], ...input, id: input.id };
      all[idx] = merged;
      writeJson(AFFILIATES_FILE, all);
      return merged;
    }
  }
  const created: AffiliateProgram = {
    id: genId(),
    streamId: input.streamId,
    toolName: input.toolName,
    commissionRate: input.commissionRate,
    cookieDuration: input.cookieDuration,
    signupUrl: input.signupUrl,
    status: input.status,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
  all.push(created);
  writeJson(AFFILIATES_FILE, all);
  return created;
}

export function deleteAffiliate(id: string): void {
  const all = readJson<AffiliateProgram>(AFFILIATES_FILE).filter(a => a.id !== id);
  writeJson(AFFILIATES_FILE, all);
}

export function getRevenueEntries(streamId?: string): RevenueEntry[] {
  const all = readJson<RevenueEntry>(REVENUE_FILE);
  return withStreamFilter(all, streamId);
}

export function saveRevenueEntry(
  input: Omit<RevenueEntry, 'id' | 'createdAt' | 'streamId'> & { streamId: string },
): RevenueEntry {
  const all = readJson<RevenueEntry>(REVENUE_FILE);
  const created: RevenueEntry = {
    id: genId(),
    streamId: input.streamId,
    date: input.date,
    toolName: input.toolName,
    amount: input.amount,
    currency: input.currency,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
  all.push(created);
  writeJson(REVENUE_FILE, all);
  return created;
}

export function deleteRevenueEntry(id: string): void {
  const all = readJson<RevenueEntry>(REVENUE_FILE).filter(e => e.id !== id);
  writeJson(REVENUE_FILE, all);
}

export interface RevenueSummary {
  totalAllTime: number;
  thisMonth: number;
  byTool: { toolName: string; total: number }[];
  currency: string;
}

export function getRevenueSummary(streamId?: string): RevenueSummary {
  const entries = getRevenueEntries(streamId);
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
