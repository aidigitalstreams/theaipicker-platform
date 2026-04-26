import { isAuthenticated } from '@/lib/admin-auth';
import { getSubscribers, subscribersToCsv } from '@/lib/subscribers';
import { getActiveStreamId } from '@/lib/streams';

export async function GET() {
  if (!(await isAuthenticated())) {
    return new Response('Unauthorized', { status: 401 });
  }
  const streamId = getActiveStreamId();
  const rows = getSubscribers(streamId);
  const csv = subscribersToCsv(rows);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscribers-${streamId}-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
