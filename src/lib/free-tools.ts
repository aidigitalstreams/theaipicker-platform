import { getAllStructuredData, type StructuredData } from './content';

export interface FreeToolListing extends StructuredData {
  reviewSlug?: string;
}

function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function isYes(value: string): boolean {
  return value.trim().toLowerCase().startsWith('y');
}

function deriveReviewSlug(toolName: string): string {
  const slugBase = toolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${slugBase}-review`;
}

export async function getFreeTools(): Promise<FreeToolListing[]> {
  const all = await getAllStructuredData();
  return all
    .filter(t => isYes(t.freePlan))
    .map(t => ({ ...t, reviewSlug: deriveReviewSlug(t.toolName) }))
    .sort((a, b) => {
      if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
      return a.toolName.localeCompare(b.toolName);
    });
}

export interface FreeToolCategory {
  name: string;
  slug: string;
  count: number;
  tools: FreeToolListing[];
  averageScore: number;
}

export async function getFreeToolCategories(): Promise<FreeToolCategory[]> {
  const all = await getFreeTools();
  const buckets = new Map<string, FreeToolListing[]>();
  for (const t of all) {
    if (!t.category) continue;
    const list = buckets.get(t.category) ?? [];
    list.push(t);
    buckets.set(t.category, list);
  }
  return Array.from(buckets.entries())
    .map(([name, tools]) => {
      const avg = tools.reduce((acc, t) => acc + t.overallScore, 0) / tools.length;
      return {
        name,
        slug: categorySlug(name),
        count: tools.length,
        tools,
        averageScore: Math.round(avg),
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getFreeToolsByCategorySlug(slug: string): Promise<FreeToolCategory | null> {
  const cats = await getFreeToolCategories();
  return cats.find(c => c.slug === slug) ?? null;
}

export function freeToolCategorySlug(name: string): string {
  return categorySlug(name);
}
