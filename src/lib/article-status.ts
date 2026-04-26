export function isScheduledForFuture(publishAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!publishAt) return false;
  const t = Date.parse(publishAt);
  if (Number.isNaN(t)) return false;
  return t > now.getTime();
}
