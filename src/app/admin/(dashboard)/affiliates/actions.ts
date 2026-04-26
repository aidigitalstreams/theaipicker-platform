'use server';

import { revalidatePath } from 'next/cache';
import {
  saveAffiliate,
  deleteAffiliate,
  type AffiliateProgram,
} from '@/lib/affiliate-data';
import { getActiveStreamId } from '@/lib/streams';

const VALID_STATUS: AffiliateProgram['status'][] = ['active', 'pending', 'rejected', 'paused'];

export interface AffiliateFormState {
  ok?: boolean;
  error?: string;
}

function isStatus(v: string): v is AffiliateProgram['status'] {
  return (VALID_STATUS as string[]).includes(v);
}

export async function saveAffiliateAction(
  _prev: AffiliateFormState | null,
  formData: FormData,
): Promise<AffiliateFormState> {
  const id = String(formData.get('id') ?? '').trim();
  const toolName = String(formData.get('toolName') ?? '').trim();
  const commissionRate = String(formData.get('commissionRate') ?? '').trim();
  const cookieDuration = String(formData.get('cookieDuration') ?? '').trim();
  const signupUrl = String(formData.get('signupUrl') ?? '').trim();
  const status = String(formData.get('status') ?? 'pending');
  const notes = String(formData.get('notes') ?? '').trim();

  if (!toolName) return { error: 'Tool name is required.' };
  if (!isStatus(status)) return { error: 'Invalid status.' };

  saveAffiliate({
    id: id || undefined,
    streamId: getActiveStreamId(),
    toolName,
    commissionRate,
    cookieDuration,
    signupUrl,
    status,
    notes: notes || undefined,
  });

  revalidatePath('/admin/affiliates');
  return { ok: true };
}

export async function deleteAffiliateAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  deleteAffiliate(id);
  revalidatePath('/admin/affiliates');
}
