import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'content', 'data');
const NEWSLETTERS_FILE = path.join(DATA_DIR, 'newsletters.json');

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

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readAll(): Newsletter[] {
  ensureDir();
  if (!fs.existsSync(NEWSLETTERS_FILE)) {
    fs.writeFileSync(NEWSLETTERS_FILE, '[]\n', 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(NEWSLETTERS_FILE, 'utf-8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Newsletter[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: Newsletter[]): void {
  ensureDir();
  fs.writeFileSync(NEWSLETTERS_FILE, JSON.stringify(rows, null, 2) + '\n', 'utf-8');
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isNewsletterStatus(v: string): v is NewsletterStatus {
  return (VALID_STATUS as string[]).includes(v);
}

export function getNewsletters(streamId?: string): Newsletter[] {
  const all = readAll();
  return streamId ? all.filter(n => n.streamId === streamId) : all;
}

export function getNewsletter(id: string): Newsletter | undefined {
  return readAll().find(n => n.id === id);
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

export function saveNewsletter(input: SaveNewsletterInput): Newsletter {
  const all = readAll();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = all.findIndex(n => n.id === input.id);
    if (idx >= 0) {
      const merged: Newsletter = {
        ...all[idx],
        subject: input.subject,
        body: input.body,
        preview: input.preview,
        status: input.status,
        scheduledAt: input.scheduledAt,
        updatedAt: now,
      };
      all[idx] = merged;
      writeAll(all);
      return merged;
    }
  }
  const created: Newsletter = {
    id: genId(),
    streamId: input.streamId,
    subject: input.subject,
    body: input.body,
    preview: input.preview,
    status: input.status,
    scheduledAt: input.scheduledAt,
    createdAt: now,
    updatedAt: now,
  };
  all.push(created);
  writeAll(all);
  return created;
}

export function markSent(id: string, recipientCount: number): Newsletter | undefined {
  const all = readAll();
  const target = all.find(n => n.id === id);
  if (!target) return undefined;
  target.status = 'sent';
  target.sentAt = new Date().toISOString();
  target.recipientCount = recipientCount;
  target.updatedAt = target.sentAt;
  writeAll(all);
  return target;
}

export function deleteNewsletter(id: string): void {
  const all = readAll().filter(n => n.id !== id);
  writeAll(all);
}
