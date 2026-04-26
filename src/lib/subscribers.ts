import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'content', 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

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

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readAll(): EmailSubscriber[] {
  ensureDir();
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    fs.writeFileSync(SUBSCRIBERS_FILE, '[]\n', 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EmailSubscriber[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: EmailSubscriber[]): void {
  ensureDir();
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(rows, null, 2) + '\n', 'utf-8');
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidSource(value: string): value is SubscriberSource {
  return (VALID_SOURCES as string[]).includes(value);
}

export function getSubscribers(streamId?: string): EmailSubscriber[] {
  const all = readAll();
  return streamId ? all.filter(s => s.streamId === streamId) : all;
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

export function addSubscriber(input: AddSubscriberInput): AddSubscriberResult {
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) return { ok: false, reason: 'invalid-email' };
  if (!isValidSource(input.source)) return { ok: false, reason: 'invalid-source' };

  const all = readAll();
  const existing = all.find(s => s.email === email && s.streamId === input.streamId);
  if (existing) {
    if (existing.status === 'unsubscribed') {
      // Reactivate
      existing.status = 'active';
      existing.unsubscribedAt = undefined;
      existing.source = input.source;
      if (input.context) existing.context = input.context;
      writeAll(all);
      return { ok: true, subscriber: existing };
    }
    return { ok: false, reason: 'already-subscribed', subscriber: existing };
  }

  const created: EmailSubscriber = {
    id: genId(),
    streamId: input.streamId,
    email,
    source: input.source,
    status: 'active',
    context: input.context,
    createdAt: new Date().toISOString(),
  };
  all.push(created);
  writeAll(all);
  return { ok: true, subscriber: created };
}

export function unsubscribe(id: string): void {
  const all = readAll();
  const target = all.find(s => s.id === id);
  if (!target) return;
  target.status = 'unsubscribed';
  target.unsubscribedAt = new Date().toISOString();
  writeAll(all);
}

export function deleteSubscriber(id: string): void {
  const all = readAll().filter(s => s.id !== id);
  writeAll(all);
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
