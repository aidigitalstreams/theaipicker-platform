import { NextResponse } from 'next/server';
import { addSubscriber, isValidSource, type SubscriberSource } from '@/lib/subscribers';
import { getActiveStreamId } from '@/lib/streams';

interface SubscribeBody {
  email?: string;
  source?: string;
  context?: string;
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

  const result = addSubscriber({
    streamId: getActiveStreamId(),
    email,
    source,
    context,
  });

  if (!result.ok) {
    if (result.reason === 'invalid-email') {
      return NextResponse.json(
        { ok: false, error: 'That email address looks invalid.' },
        { status: 400 },
      );
    }
    if (result.reason === 'already-subscribed') {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    return NextResponse.json({ ok: false, error: 'Could not save subscription.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
