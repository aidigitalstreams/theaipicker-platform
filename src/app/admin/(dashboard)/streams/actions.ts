'use server';

import { revalidatePath } from 'next/cache';
import {
  saveStream,
  setActiveStream,
  deleteStream,
  validateStreamId,
  getStream,
  type Stream,
} from '@/lib/streams';
import { logActivity } from '@/lib/activity';

const VALID_STATUS: Stream['status'][] = ['active', 'planned', 'archived'];
const VALID_DIRS = ['reviews', 'comparisons', 'best-of', 'guides', 'rankings'];

export interface StreamFormState {
  ok?: boolean;
  error?: string;
}

function isStreamStatus(v: string): v is Stream['status'] {
  return (VALID_STATUS as string[]).includes(v);
}

export async function saveStreamAction(
  _prev: StreamFormState | null,
  formData: FormData,
): Promise<StreamFormState> {
  const id = String(formData.get('id') ?? '').trim().toLowerCase();
  const name = String(formData.get('name') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase() || id;
  const tagline = String(formData.get('tagline') ?? '').trim();
  const domain = String(formData.get('domain') ?? '').trim().toLowerCase();
  const status = String(formData.get('status') ?? 'planned');
  const activate = formData.get('activate') === 'on';
  const contentDirs = VALID_DIRS.filter(d => formData.get(`dir_${d}`) === 'on');

  if (!name) return { error: 'Stream name is required.' };
  const idError = validateStreamId(id);
  if (idError) return { error: idError };
  if (!isStreamStatus(status)) return { error: 'Invalid status.' };
  if (contentDirs.length === 0) return { error: 'Select at least one content directory.' };

  await saveStream({ id, name, slug, tagline, domain, contentDirs, status }, { activate });

  await logActivity({
    streamId: id,
    kind: 'stream-saved',
    subject: name,
    detail: `${status}${activate ? ' · made active' : ''}`,
    href: '/admin/streams',
  });

  revalidatePath('/admin/streams');
  revalidatePath('/admin');
  return { ok: true };
}

export async function setActiveStreamAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  const target = await getStream(id);
  await setActiveStream(id);
  if (target) {
    await logActivity({
      streamId: id,
      kind: 'stream-activated',
      subject: target.name,
      href: '/admin/streams',
    });
  }
  revalidatePath('/admin/streams');
  revalidatePath('/admin');
}

export async function deleteStreamAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  const target = await getStream(id);
  await deleteStream(id);
  if (target) {
    await logActivity({
      kind: 'stream-deleted',
      subject: target.name,
    });
  }
  revalidatePath('/admin/streams');
  revalidatePath('/admin');
}
