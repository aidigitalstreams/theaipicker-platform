'use server';

import { revalidatePath } from 'next/cache';
import { saveRevenueEntry, deleteRevenueEntry } from '@/lib/affiliate-data';

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

  saveRevenueEntry({
    date,
    toolName,
    amount,
    currency,
    notes: notes || undefined,
  });

  revalidatePath('/admin/analytics');
  return { ok: true };
}

export async function deleteRevenueAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;
  deleteRevenueEntry(id);
  revalidatePath('/admin/analytics');
}
