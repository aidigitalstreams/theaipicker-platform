'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  saveArticle,
  validateSlug,
  slugIsTaken,
  deleteArticle,
  getAdminArticleBySlug,
  applyStructuredDataUpdates,
  isArticleStatus,
  type ArticleStatus,
  type EditableArticleType,
  type StructuredDataUpdate,
} from '@/lib/admin-content';

const VALID_TYPES: EditableArticleType[] = ['review', 'comparison', 'best-of', 'guide', 'ranking'];

export interface UpdateState {
  ok?: boolean;
  error?: string;
  redirectSlug?: string;
}

function isEditableType(t: string): t is EditableArticleType {
  return (VALID_TYPES as string[]).includes(t);
}

function clampScore(raw: FormDataEntryValue | null): number {
  const n = Number(String(raw ?? ''));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function parseStructuredUpdates(formData: FormData): StructuredDataUpdate[] {
  const count = Number(formData.get('sd_count') ?? 0);
  if (!Number.isFinite(count) || count <= 0) return [];
  const updates: StructuredDataUpdate[] = [];
  for (let i = 0; i < count; i++) {
    updates.push({
      corePerformance: clampScore(formData.get(`sd_${i}_corePerformance`)),
      easeOfUse: clampScore(formData.get(`sd_${i}_easeOfUse`)),
      valueForMoney: clampScore(formData.get(`sd_${i}_valueForMoney`)),
      outputQuality: clampScore(formData.get(`sd_${i}_outputQuality`)),
      supportReliability: clampScore(formData.get(`sd_${i}_supportReliability`)),
      bestFor: String(formData.get(`sd_${i}_bestFor`) ?? '').trim(),
      priceFrom: String(formData.get(`sd_${i}_priceFrom`) ?? '').trim(),
      freePlan: String(formData.get(`sd_${i}_freePlan`) ?? '').trim() === 'Yes' ? 'Yes' : 'No',
    });
  }
  return updates;
}

export async function updateArticleAction(_prev: UpdateState | null, formData: FormData): Promise<UpdateState> {
  const originalSlug = String(formData.get('originalSlug') ?? '');
  const article = getAdminArticleBySlug(originalSlug);
  if (!article) return { error: 'Article not found.' };
  if (!isEditableType(article.meta.type)) return { error: 'Article type is not editable.' };

  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase();
  const category = String(formData.get('category') ?? '').trim();
  const status = String(formData.get('status') ?? 'draft');
  const targetKeyword = String(formData.get('targetKeyword') ?? '').trim();
  const metaTitle = String(formData.get('metaTitle') ?? '').trim();
  const metaDescription = String(formData.get('metaDescription') ?? '').trim();
  const featuredImage = String(formData.get('featuredImage') ?? '').trim();
  const rawBody = String(formData.get('body') ?? '');

  if (!title) return { error: 'Title is required.' };
  const slugError = validateSlug(slug);
  if (slugError) return { error: slugError };

  if (slug !== originalSlug && slugIsTaken(slug)) {
    return { error: `Slug "${slug}" is already used by another article.` };
  }
  if (!isArticleStatus(status)) {
    return { error: 'Status must be draft, in-review, ready, or publish.' };
  }
  const validStatus: ArticleStatus = status;

  const structuredUpdates = parseStructuredUpdates(formData);
  const body = applyStructuredDataUpdates(rawBody, structuredUpdates);

  saveArticle({
    type: article.meta.type as EditableArticleType,
    slug,
    title,
    category,
    status: validStatus,
    targetKeyword,
    metaTitle,
    metaDescription,
    featuredImage,
    body,
    preserveFrontmatter: article.frontmatter,
    existing: { subdir: article.meta.subdir, filename: article.meta.filename },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/content');
  revalidatePath('/admin/pipeline');
  revalidatePath(`/admin/content/${originalSlug}`);
  if (slug !== originalSlug) {
    revalidatePath(`/admin/content/${slug}`);
    redirect(`/admin/content/${slug}?saved=1`);
  }

  return { ok: true };
}

export async function togglePublishAction(formData: FormData): Promise<void> {
  const originalSlug = String(formData.get('originalSlug') ?? '');
  const article = getAdminArticleBySlug(originalSlug);
  if (!article) return;
  if (!isEditableType(article.meta.type)) return;

  const nextStatus = article.meta.status === 'publish' ? 'draft' : 'publish';

  saveArticle({
    type: article.meta.type as EditableArticleType,
    slug: article.meta.slug,
    title: article.meta.title,
    category: article.meta.category,
    status: nextStatus,
    targetKeyword: article.meta.targetKeyword,
    metaTitle: String(article.frontmatter.meta_title ?? ''),
    metaDescription: String(article.frontmatter.meta_description ?? ''),
    body: article.body,
    preserveFrontmatter: article.frontmatter,
    existing: { subdir: article.meta.subdir, filename: article.meta.filename },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/content');
  revalidatePath('/admin/pipeline');
  revalidatePath(`/admin/content/${originalSlug}`);
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  const originalSlug = String(formData.get('originalSlug') ?? '');
  const article = getAdminArticleBySlug(originalSlug);
  if (!article) return;

  deleteArticle(article.meta.subdir, article.meta.filename);
  revalidatePath('/admin');
  revalidatePath('/admin/content');
  redirect('/admin/content');
}
