'use server';

import { revalidatePath } from 'next/cache';
import {
  saveStream,
  setActiveStream,
  deleteStream,
  validateStreamId,
  type Stream,
} from '@/lib/streams';

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

  saveStream({ id, name, slug, tagline, domain, contentDirs, status }, { activate });

  revalidatePath('/admin/streams');
  revalidatePath('/admin');
  return { ok: true };
}

export async function setActiveStreamAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  setActiveStream(id);
  revalidatePath('/admin/streams');
  revalidatePath('/admin');
}

export async function deleteStreamAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  deleteStream(id);
  revalidatePath('/admin/streams');
  revalidatePath('/admin');
}
