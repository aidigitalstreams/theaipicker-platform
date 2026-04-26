'use server';

import { revalidatePath } from 'next/cache';
import { unsubscribe, deleteSubscriber, getSubscribers } from '@/lib/subscribers';
import { logActivity } from '@/lib/activity';
import { getActiveStreamId } from '@/lib/streams';

export async function unsubscribeAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  const streamId = await getActiveStreamId();
  const subs = await getSubscribers(streamId);
  const target = subs.find(s => s.id === id);
  await unsubscribe(id);
  if (target) {
    await logActivity({
      streamId,
      kind: 'subscriber-unsubscribed',
      subject: target.email,
      href: '/admin/subscribers',
    });
  }
  revalidatePath('/admin/subscribers');
}

export async function deleteSubscriberAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  const streamId = await getActiveStreamId();
  const subs = await getSubscribers(streamId);
  const target = subs.find(s => s.id === id);
  await deleteSubscriber(id);
  if (target) {
    await logActivity({
      streamId,
      kind: 'subscriber-deleted',
      subject: target.email,
    });
  }
  revalidatePath('/admin/subscribers');
}
