'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  saveNewsletter,
  deleteNewsletter,
  markSent,
  isNewsletterStatus,
  getNewsletter,
} from '@/lib/newsletters';
import { getActiveStreamId } from '@/lib/streams';
import { getSubscribers } from '@/lib/subscribers';
import { logActivity } from '@/lib/activity';

export interface NewsletterFormState {
  ok?: boolean;
  error?: string;
  redirectTo?: string;
}

export async function saveNewsletterAction(
  _prev: NewsletterFormState | null,
  formData: FormData,
): Promise<NewsletterFormState> {
  const id = String(formData.get('id') ?? '').trim();
  const subject = String(formData.get('subject') ?? '').trim();
  const preview = String(formData.get('preview') ?? '').trim();
  const body = String(formData.get('body') ?? '');
  const status = String(formData.get('status') ?? 'draft');
  const scheduledAt = String(formData.get('scheduledAt') ?? '').trim();

  if (!subject) return { error: 'Subject is required.' };
  if (!isNewsletterStatus(status)) return { error: 'Invalid status.' };
  if (status === 'scheduled' && !scheduledAt) return { error: 'Scheduled status needs a date/time.' };

  const streamId = getActiveStreamId();
  const saved = saveNewsletter({
    id: id || undefined,
    streamId,
    subject,
    body,
    preview: preview || undefined,
    status,
    scheduledAt: scheduledAt || undefined,
  });

  logActivity({
    streamId,
    kind: 'newsletter-saved',
    subject,
    detail: status,
    href: `/admin/newsletter/compose/${saved.id}`,
  });

  revalidatePath('/admin/newsletter/compose');
  revalidatePath('/admin/newsletter/archive');
  if (!id) {
    redirect(`/admin/newsletter/compose/${saved.id}?saved=1`);
  }
  return { ok: true };
}

export async function markSentAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  const newsletter = getNewsletter(id);
  if (!newsletter) return;
  const subs = getSubscribers(newsletter.streamId).filter(s => s.status === 'active');
  markSent(id, subs.length);
  logActivity({
    streamId: newsletter.streamId,
    kind: 'newsletter-sent',
    subject: newsletter.subject,
    detail: `${subs.length} recipient${subs.length === 1 ? '' : 's'}`,
    href: `/admin/newsletter/compose/${newsletter.id}`,
  });
  revalidatePath('/admin/newsletter/archive');
  revalidatePath(`/admin/newsletter/compose/${id}`);
}

export async function deleteNewsletterAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  const target = getNewsletter(id);
  deleteNewsletter(id);
  if (target) {
    logActivity({
      streamId: target.streamId,
      kind: 'newsletter-deleted',
      subject: target.subject,
    });
  }
  revalidatePath('/admin/newsletter/archive');
  revalidatePath('/admin/newsletter/compose');
}
