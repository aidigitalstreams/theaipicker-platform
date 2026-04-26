'use server';

import { revalidatePath } from 'next/cache';
import {
  saveResearchNote,
  deleteResearchNote,
  isResearchKind,
  isResearchStatus,
} from '@/lib/research';
import { getActiveStreamId } from '@/lib/streams';

export interface ResearchFormState {
  ok?: boolean;
  error?: string;
}

export async function saveNoteAction(
  _prev: ResearchFormState | null,
  formData: FormData,
): Promise<ResearchFormState> {
  const id = String(formData.get('id') ?? '').trim();
  const kind = String(formData.get('kind') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const source = String(formData.get('source') ?? '').trim();
  const status = String(formData.get('status') ?? 'open');

  if (!title) return { error: 'Title is required.' };
  if (!isResearchKind(kind)) return { error: 'Invalid kind.' };
  if (!isResearchStatus(status)) return { error: 'Invalid status.' };

  saveResearchNote({
    id: id || undefined,
    streamId: getActiveStreamId(),
    kind,
    title,
    body,
    source: source || undefined,
    status,
  });

  revalidatePath('/admin/research');
  return { ok: true };
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  deleteResearchNote(id);
  revalidatePath('/admin/research');
}
