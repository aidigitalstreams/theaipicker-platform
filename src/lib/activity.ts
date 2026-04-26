import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'content', 'data');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');
const MAX_ENTRIES = 5000;

export type ActivityKind =
  | 'article-saved'
  | 'article-deleted'
  | 'article-published'
  | 'article-unpublished'
  | 'affiliate-saved'
  | 'affiliate-deleted'
  | 'revenue-added'
  | 'revenue-deleted'
  | 'stream-saved'
  | 'stream-activated'
  | 'stream-deleted'
  | 'research-saved'
  | 'research-deleted'
  | 'newsletter-saved'
  | 'newsletter-sent'
  | 'newsletter-deleted'
  | 'subscriber-added'
  | 'subscriber-unsubscribed'
  | 'subscriber-deleted';

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  'article-saved': 'Article saved',
  'article-deleted': 'Article deleted',
  'article-published': 'Article published',
  'article-unpublished': 'Article unpublished',
  'affiliate-saved': 'Affiliate program saved',
  'affiliate-deleted': 'Affiliate program deleted',
  'revenue-added': 'Revenue entry added',
  'revenue-deleted': 'Revenue entry deleted',
  'stream-saved': 'Stream saved',
  'stream-activated': 'Stream activated',
  'stream-deleted': 'Stream deleted',
  'research-saved': 'Research note saved',
  'research-deleted': 'Research note deleted',
  'newsletter-saved': 'Newsletter draft saved',
  'newsletter-sent': 'Newsletter sent',
  'newsletter-deleted': 'Newsletter deleted',
  'subscriber-added': 'New subscriber',
  'subscriber-unsubscribed': 'Subscriber opted out',
  'subscriber-deleted': 'Subscriber deleted',
};

export const ACTIVITY_GROUPS: { kind: ActivityKind; group: string }[] = [
  { kind: 'article-saved', group: 'Content' },
  { kind: 'article-deleted', group: 'Content' },
  { kind: 'article-published', group: 'Content' },
  { kind: 'article-unpublished', group: 'Content' },
  { kind: 'affiliate-saved', group: 'Revenue' },
  { kind: 'affiliate-deleted', group: 'Revenue' },
  { kind: 'revenue-added', group: 'Revenue' },
  { kind: 'revenue-deleted', group: 'Revenue' },
  { kind: 'stream-saved', group: 'Streams' },
  { kind: 'stream-activated', group: 'Streams' },
  { kind: 'stream-deleted', group: 'Streams' },
  { kind: 'research-saved', group: 'Intelligence' },
  { kind: 'research-deleted', group: 'Intelligence' },
  { kind: 'newsletter-saved', group: 'Audience' },
  { kind: 'newsletter-sent', group: 'Audience' },
  { kind: 'newsletter-deleted', group: 'Audience' },
  { kind: 'subscriber-added', group: 'Audience' },
  { kind: 'subscriber-unsubscribed', group: 'Audience' },
  { kind: 'subscriber-deleted', group: 'Audience' },
];

export interface ActivityEntry {
  id: string;
  streamId?: string;
  kind: ActivityKind;
  subject: string;
  detail?: string;
  href?: string;
  at: string;
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readAll(): ActivityEntry[] {
  ensureDir();
  if (!fs.existsSync(ACTIVITY_FILE)) {
    fs.writeFileSync(ACTIVITY_FILE, '[]\n', 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(ACTIVITY_FILE, 'utf-8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: ActivityEntry[]): void {
  ensureDir();
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(rows, null, 2) + '\n', 'utf-8');
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface LogInput {
  streamId?: string;
  kind: ActivityKind;
  subject: string;
  detail?: string;
  href?: string;
}

export function logActivity(input: LogInput): void {
  try {
    const all = readAll();
    const entry: ActivityEntry = {
      id: genId(),
      streamId: input.streamId,
      kind: input.kind,
      subject: input.subject,
      detail: input.detail,
      href: input.href,
      at: new Date().toISOString(),
    };
    all.push(entry);
    // Keep file from growing unbounded.
    const trimmed = all.length > MAX_ENTRIES ? all.slice(all.length - MAX_ENTRIES) : all;
    writeAll(trimmed);
  } catch {
    // Activity log failures must never break a save action.
  }
}

export interface GetActivityOptions {
  limit?: number;
  kinds?: ActivityKind[];
  group?: string;
  sinceIso?: string;
}

export function getActivity(streamId?: string, opts: GetActivityOptions = {}): ActivityEntry[] {
  const all = readAll();
  let filtered = streamId ? all.filter(a => !a.streamId || a.streamId === streamId) : all;
  if (opts.kinds && opts.kinds.length > 0) {
    const set = new Set<string>(opts.kinds as string[]);
    filtered = filtered.filter(a => set.has(a.kind));
  }
  if (opts.group) {
    const groupKinds = new Set(ACTIVITY_GROUPS.filter(g => g.group === opts.group).map(g => g.kind));
    filtered = filtered.filter(a => groupKinds.has(a.kind));
  }
  if (opts.sinceIso) {
    filtered = filtered.filter(a => a.at >= opts.sinceIso!);
  }
  const sorted = filtered.sort((a, b) => b.at.localeCompare(a.at));
  return opts.limit ? sorted.slice(0, opts.limit) : sorted;
}

export function getActivityGroups(): string[] {
  return Array.from(new Set(ACTIVITY_GROUPS.map(g => g.group)));
}
