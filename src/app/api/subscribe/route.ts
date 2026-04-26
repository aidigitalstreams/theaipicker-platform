import { NextResponse } from 'next/server';
import { addSubscriber, isValidSource, type SubscriberSource } from '@/lib/subscribers';
import { getActiveStreamId } from '@/lib/streams';
import { logActivity } from '@/lib/activity';

interface SubscribeBody {
  email?: string;
  source?: string;
  context?: string;
}

const FREE_TOOLS_COOKIE = 'aids_free_unlocked';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function withFreeToolsCookie<T>(response: NextResponse<T>, source: SubscriberSource): NextResponse<T> {
  if (source === 'free-tools') {
    response.cookies.set(FREE_TOOLS_COOKIE, '1', {
      maxAge: ONE_YEAR_SECONDS,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
  }
  return response;
}

export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = (body.email ?? '').trim();
  const sourceRaw = (body.source ?? 'other').trim();
  const context = body.context ? String(body.context).slice(0, 200) : undefined;

  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email is required.' }, { status: 400 });
  }

  const source: SubscriberSource = isValidSource(sourceRaw) ? sourceRaw : 'other';

  const streamId = await getActiveStreamId();
  const result = await addSubscriber({
    streamId,
    email,
    source,
    context,
  });

  if (result.ok && result.subscriber) {
    await logActivity({
      streamId,
      kind: 'subscriber-added',
      subject: email,
      detail: context ? `${source} · ${context}` : source,
      href: '/admin/subscribers',
    });
  }

  if (!result.ok) {
    if (result.reason === 'invalid-email') {
      return NextResponse.json(
        { ok: false, error: 'That email address looks invalid.' },
        { status: 400 },
      );
    }
    if (result.reason === 'already-subscribed') {
      // Existing subscribers still get the unlock cookie — they're on the list, that's the point.
      return withFreeToolsCookie(
        NextResponse.json({ ok: true, alreadySubscribed: true }),
        source,
      );
    }
    return NextResponse.json({ ok: false, error: 'Could not save subscription.' }, { status: 400 });
  }

  return withFreeToolsCookie(NextResponse.json({ ok: true }), source);
}
