'use server';

import { revalidatePath } from 'next/cache';
import { unsubscribe, deleteSubscriber } from '@/lib/subscribers';

export async function unsubscribeAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  unsubscribe(id);
  revalidatePath('/admin/subscribers');
}

export async function deleteSubscriberAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  deleteSubscriber(id);
  revalidatePath('/admin/subscribers');
}
