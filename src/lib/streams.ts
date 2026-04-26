export interface Stream {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  domain: string;
  contentDirs: string[];
  status: 'active' | 'planned' | 'archived';
}

export const STREAMS: Stream[] = [
  {
    id: 'theaipicker',
    name: 'The AI Picker',
    slug: 'theaipicker',
    tagline: 'We research AI tools so you don\'t have to.',
    domain: 'theaipicker.com',
    contentDirs: ['reviews', 'comparisons', 'best-of', 'guides', 'rankings'],
    status: 'active',
  },
];

export const ACTIVE_STREAM_ID = 'theaipicker';

export function getActiveStream(): Stream {
  const stream = STREAMS.find(s => s.id === ACTIVE_STREAM_ID);
  if (!stream) throw new Error(`Active stream "${ACTIVE_STREAM_ID}" not configured.`);
  return stream;
}

export function getStream(id: string): Stream | undefined {
  return STREAMS.find(s => s.id === id);
}

export function listStreams(): Stream[] {
  return STREAMS;
}
