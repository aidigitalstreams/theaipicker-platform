'use server';

import { revalidatePath } from 'next/cache';
import {
  saveAffiliate,
  deleteAffiliate,
  getAffiliates,
  type AffiliateProgram,
} from '@/lib/affiliate-data';
import { getActiveStreamId } from '@/lib/streams';
import { logActivity } from '@/lib/activity';

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

  const streamId = getActiveStreamId();
  saveAffiliate({
    id: id || undefined,
    streamId,
    toolName,
    commissionRate,
    cookieDuration,
    signupUrl,
    status,
    notes: notes || undefined,
  });

  logActivity({
    streamId,
    kind: 'affiliate-saved',
    subject: toolName,
    detail: `${status}${commissionRate ? ` · ${commissionRate}` : ''}`,
    href: '/admin/affiliates',
  });

  revalidatePath('/admin/affiliates');
  return { ok: true };
}

export async function deleteAffiliateAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  const streamId = getActiveStreamId();
  const target = getAffiliates(streamId).find(a => a.id === id);
  deleteAffiliate(id);
  if (target) {
    logActivity({
      streamId,
      kind: 'affiliate-deleted',
      subject: target.toolName,
    });
  }
  revalidatePath('/admin/affiliates');
}
