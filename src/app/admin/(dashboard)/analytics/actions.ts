'use server';

import { revalidatePath } from 'next/cache';
import { saveRevenueEntry, deleteRevenueEntry, getRevenueEntries } from '@/lib/affiliate-data';
import { getActiveStreamId } from '@/lib/streams';
import { logActivity } from '@/lib/activity';

export interface RevenueFormState {
  ok?: boolean;
  error?: string;
}

export async function saveRevenueAction(
  _prev: RevenueFormState | null,
  formData: FormData,
): Promise<RevenueFormState> {
  const date = String(formData.get('date') ?? '').trim();
  const toolName = String(formData.get('toolName') ?? '').trim();
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const currency = String(formData.get('currency') ?? 'GBP').trim().toUpperCase() || 'GBP';
  const notes = String(formData.get('notes') ?? '').trim();

  if (!date) return { error: 'Date is required.' };
  if (!toolName) return { error: 'Tool name is required.' };
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) return { error: 'Amount must be a positive number.' };

  const streamId = await getActiveStreamId();
  await saveRevenueEntry({
    streamId,
    date,
    toolName,
    amount,
    currency,
    notes: notes || undefined,
  });

  await logActivity({
    streamId,
    kind: 'revenue-added',
    subject: `${toolName} · ${currency} ${amount.toFixed(2)}`,
    detail: date,
    href: '/admin/analytics',
  });

  revalidatePath('/admin/analytics');
  return { ok: true };
}

export async function deleteRevenueAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  const streamId = await getActiveStreamId();
  const entries = await getRevenueEntries(streamId);
  const target = entries.find(r => r.id === id);
  await deleteRevenueEntry(id);
  if (target) {
    await logActivity({
      streamId,
      kind: 'revenue-deleted',
      subject: `${target.toolName} · ${target.currency} ${target.amount.toFixed(2)}`,
      detail: target.date,
    });
  }
  revalidatePath('/admin/analytics');
}
