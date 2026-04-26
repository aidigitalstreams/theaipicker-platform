'use server';

import { revalidatePath } from 'next/cache';
import { unsubscribe, deleteSubscriber, getSubscribers } from '@/lib/subscribers';
import { logActivity } from '@/lib/activity';
import { getActiveStreamId } from '@/lib/streams';

export async function unsubscribeAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  const streamId = getActiveStreamId();
  const target = getSubscribers(streamId).find(s => s.id === id);
  unsubscribe(id);
  if (target) {
    logActivity({
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
  const streamId = getActiveStreamId();
  const target = getSubscribers(streamId).find(s => s.id === id);
  deleteSubscriber(id);
  if (target) {
    logActivity({
      streamId,
      kind: 'subscriber-deleted',
      subject: target.email,
    });
  }
  revalidatePath('/admin/subscribers');
}
