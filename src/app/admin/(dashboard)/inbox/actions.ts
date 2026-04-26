'use server';

import { revalidatePath } from 'next/cache';
import {
  addInboxItem,
  requestExecution,
  reorderInbox,
  completeInboxItem,
  deleteInboxItem,
  isPriority,
  CATEGORIES,
} from '@/lib/inbox';

export interface AddInboxFormState {
  ok?: boolean;
  error?: string;
}

const VALID_CATEGORY_VALUES = new Set(CATEGORIES.map(c => c.value));

export async function addInboxItemAction(
  _prev: AddInboxFormState | null,
  formData: FormData,
): Promise<AddInboxFormState> {
  const title = String(formData.get('title') ?? '').trim();
  const priority = String(formData.get('priority') ?? 'medium');
  const categoryRaw = String(formData.get('category') ?? '').trim();
  const instructions = String(formData.get('instructions') ?? '').trim();

  if (!title) return { error: 'Title is required.' };
  if (!isPriority(priority)) return { error: 'Invalid priority.' };
  const category = VALID_CATEGORY_VALUES.has(categoryRaw) ? categoryRaw : null;

  await addInboxItem({
    title,
    priority,
    category: category ?? undefined,
    instructions,
  });

  revalidatePath('/admin/inbox');
  revalidatePath('/admin');
  return { ok: true };
}

export async function executeSelectedAction(formData: FormData): Promise<void> {
  const ids = formData.getAll('id').map(v => Number(v)).filter(n => Number.isFinite(n) && n > 0);
  if (ids.length === 0) return;
  await requestExecution(ids);
  revalidatePath('/admin/inbox');
  revalidatePath('/admin');
}

export async function reorderInboxAction(formData: FormData): Promise<void> {
  const ids = formData.getAll('orderedId').map(v => Number(v)).filter(n => Number.isFinite(n) && n > 0);
  if (ids.length === 0) return;
  await reorderInbox(ids);
  revalidatePath('/admin/inbox');
}

export async function completeInboxItemAction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!Number.isFinite(id) || id <= 0) return;
  const resultNotes = String(formData.get('resultNotes') ?? '').trim();
  await completeInboxItem(id, resultNotes || undefined);
  revalidatePath('/admin/inbox');
  revalidatePath('/admin');
}

export async function deleteInboxItemAction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!Number.isFinite(id) || id <= 0) return;
  await deleteInboxItem(id);
  revalidatePath('/admin/inbox');
  revalidatePath('/admin');
}
