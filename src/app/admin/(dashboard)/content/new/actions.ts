'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  saveArticle,
  validateSlug,
  slugIsTaken,
  type EditableArticleType,
} from '@/lib/admin-content';
import { logActivity } from '@/lib/activity';
import { getActiveStreamId } from '@/lib/streams';

const VALID_TYPES: EditableArticleType[] = ['review', 'comparison', 'best-of', 'guide', 'ranking'];

export interface CreateState {
  error?: string;
  values?: {
    type: string;
    title: string;
    slug: string;
    category: string;
    status: string;
    targetKeyword: string;
    metaTitle: string;
    metaDescription: string;
    body: string;
  };
}

export async function createArticleAction(_prev: CreateState | null, formData: FormData): Promise<CreateState> {
  const type = String(formData.get('type') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase();
  const category = String(formData.get('category') ?? '').trim();
  const status = String(formData.get('status') ?? 'draft');
  const targetKeyword = String(formData.get('targetKeyword') ?? '').trim();
  const metaTitle = String(formData.get('metaTitle') ?? '').trim();
  const metaDescription = String(formData.get('metaDescription') ?? '').trim();
  const body = String(formData.get('body') ?? '');

  const values = { type, title, slug, category, status, targetKeyword, metaTitle, metaDescription, body };

  if (!VALID_TYPES.includes(type as EditableArticleType)) {
    return { error: 'Pick a valid article type.', values };
  }
  if (!title) {
    return { error: 'Title is required.', values };
  }
  const slugError = validateSlug(slug);
  if (slugError) {
    return { error: slugError, values };
  }
  if (slugIsTaken(slug)) {
    return { error: `Slug "${slug}" already exists. Pick another.`, values };
  }
  if (status !== 'draft' && status !== 'publish') {
    return { error: 'Status must be draft or publish.', values };
  }

  saveArticle({
    type: type as EditableArticleType,
    slug,
    title,
    category,
    status,
    targetKeyword,
    metaTitle,
    metaDescription,
    body,
  });

  await logActivity({
    streamId: await getActiveStreamId(),
    kind: status === 'publish' ? 'article-published' : 'article-saved',
    subject: title,
    detail: `${type} · created`,
    href: `/admin/content/${slug}`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/content');
  redirect(`/admin/content/${slug}`);
}
