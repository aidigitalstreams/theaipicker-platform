import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'content', 'data');
const RESEARCH_FILE = path.join(DATA_DIR, 'research.json');

export type ResearchKind = 'market-brief' | 'competitor-watch' | 'new-tool' | 'trend' | 'note';

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

export const RESEARCH_KINDS: { value: ResearchKind; label: string }[] = [
  { value: 'market-brief', label: 'Market brief' },
  { value: 'competitor-watch', label: 'Competitor watch' },
  { value: 'new-tool', label: 'New tool' },
  { value: 'trend', label: 'Trend' },
  { value: 'note', label: 'Note' },
];

const VALID_KINDS = RESEARCH_KINDS.map(k => k.value);
const VALID_STATUS: ResearchNote['status'][] = ['open', 'actioned', 'archived'];

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readAll(): ResearchNote[] {
  ensureDir();
  if (!fs.existsSync(RESEARCH_FILE)) {
    fs.writeFileSync(RESEARCH_FILE, '[]\n', 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(RESEARCH_FILE, 'utf-8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ResearchNote[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: ResearchNote[]): void {
  ensureDir();
  fs.writeFileSync(RESEARCH_FILE, JSON.stringify(rows, null, 2) + '\n', 'utf-8');
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isResearchKind(v: string): v is ResearchKind {
  return (VALID_KINDS as string[]).includes(v);
}

export function isResearchStatus(v: string): v is ResearchNote['status'] {
  return (VALID_STATUS as string[]).includes(v);
}

export function getResearchNotes(streamId?: string): ResearchNote[] {
  const all = readAll();
  return streamId ? all.filter(n => n.streamId === streamId) : all;
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

export function saveResearchNote(input: SaveNoteInput): ResearchNote {
  const all = readAll();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = all.findIndex(n => n.id === input.id);
    if (idx >= 0) {
      const merged: ResearchNote = {
        ...all[idx],
        kind: input.kind,
        title: input.title,
        body: input.body,
        source: input.source,
        status: input.status,
        updatedAt: now,
      };
      all[idx] = merged;
      writeAll(all);
      return merged;
    }
  }
  const created: ResearchNote = {
    id: genId(),
    streamId: input.streamId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    source: input.source,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };
  all.push(created);
  writeAll(all);
  return created;
}

export function deleteResearchNote(id: string): void {
  const all = readAll().filter(n => n.id !== id);
  writeAll(all);
}
