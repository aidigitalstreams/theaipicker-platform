export type ResearchKind = 'market-brief' | 'competitor-watch' | 'new-tool' | 'trend' | 'note';

export const RESEARCH_KINDS: { value: ResearchKind; label: string }[] = [
  { value: 'market-brief', label: 'Market brief' },
  { value: 'competitor-watch', label: 'Competitor watch' },
  { value: 'new-tool', label: 'New tool' },
  { value: 'trend', label: 'Trend' },
  { value: 'note', label: 'Note' },
];

export function isResearchKind(v: string): v is ResearchKind {
  return RESEARCH_KINDS.some(k => k.value === v);
}
