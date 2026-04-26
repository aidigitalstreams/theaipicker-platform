import fs from 'fs';
import path from 'path';

export interface Stream {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  domain: string;
  contentDirs: string[];
  status: 'active' | 'planned' | 'archived';
}

interface StreamsConfig {
  activeStreamId: string;
  streams: Stream[];
}

const CONFIG_FILE = path.join(process.cwd(), 'content', 'data', 'streams.json');

const FALLBACK_STREAM: Stream = {
  id: 'theaipicker',
  name: 'The AI Picker',
  slug: 'theaipicker',
  tagline: "We research AI tools so you don't have to.",
  domain: 'theaipicker.com',
  contentDirs: ['reviews', 'comparisons', 'best-of', 'guides', 'rankings'],
  status: 'active',
};

const FALLBACK_CONFIG: StreamsConfig = {
  activeStreamId: FALLBACK_STREAM.id,
  streams: [FALLBACK_STREAM],
};

function readConfig(): StreamsConfig {
  if (!fs.existsSync(CONFIG_FILE)) return FALLBACK_CONFIG;
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8').trim();
    if (!raw) return FALLBACK_CONFIG;
    const parsed = JSON.parse(raw) as Partial<StreamsConfig>;
    const streams = Array.isArray(parsed.streams) && parsed.streams.length > 0 ? parsed.streams as Stream[] : FALLBACK_CONFIG.streams;
    const activeStreamId =
      typeof parsed.activeStreamId === 'string' && streams.some(s => s.id === parsed.activeStreamId)
        ? parsed.activeStreamId
        : streams[0].id;
    return { activeStreamId, streams };
  } catch {
    return FALLBACK_CONFIG;
  }
}

function writeConfig(config: StreamsConfig): void {
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export function listStreams(): Stream[] {
  return readConfig().streams;
}

export function getActiveStreamId(): string {
  return readConfig().activeStreamId;
}

export function getActiveStream(): Stream {
  const cfg = readConfig();
  return cfg.streams.find(s => s.id === cfg.activeStreamId) ?? cfg.streams[0];
}

export function getStream(id: string): Stream | undefined {
  return readConfig().streams.find(s => s.id === id);
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

export function saveStream(input: SaveStreamInput, opts: { activate?: boolean } = {}): Stream {
  const cfg = readConfig();
  const dirs = input.contentDirs.filter(d => VALID_SUBDIRS.includes(d));
  const stream: Stream = {
    id: input.id,
    name: input.name,
    slug: input.slug || input.id,
    tagline: input.tagline,
    domain: input.domain,
    contentDirs: dirs,
    status: input.status,
  };
  const existingIdx = cfg.streams.findIndex(s => s.id === input.id);
  if (existingIdx >= 0) {
    cfg.streams[existingIdx] = stream;
  } else {
    cfg.streams.push(stream);
  }
  if (opts.activate) {
    cfg.activeStreamId = stream.id;
  }
  writeConfig(cfg);
  return stream;
}

export function setActiveStream(id: string): void {
  const cfg = readConfig();
  if (!cfg.streams.some(s => s.id === id)) return;
  cfg.activeStreamId = id;
  writeConfig(cfg);
}

export function deleteStream(id: string): void {
  const cfg = readConfig();
  if (cfg.streams.length <= 1) return;
  cfg.streams = cfg.streams.filter(s => s.id !== id);
  if (cfg.activeStreamId === id) {
    cfg.activeStreamId = cfg.streams[0].id;
  }
  writeConfig(cfg);
}
