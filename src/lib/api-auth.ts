import { NextResponse } from 'next/server';

/**
 * Bearer-token auth for the inbox API. Returns null if the request is
 * authorised; otherwise returns a 401 response the route handler can return
 * directly.
 *
 *   const fail = requireAdminBearer(request);
 *   if (fail) return fail;
 */
export function requireAdminBearer(request: Request): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD ?? 'changeme';
  const auth = request.headers.get('authorization') ?? '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const provided = match ? match[1].trim() : '';
  if (!provided || provided !== expected) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="admin"' } },
    );
  }
  return null;
}
