'use client';

import { deleteArticleAction } from './actions';

export default function DeleteArticleButton({ slug, title }: { slug: string; title: string }) {
  return (
    <form
      action={deleteArticleAction}
      onSubmit={e => {
        if (!confirm(`Delete "${title}"? This removes the file permanently.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="originalSlug" value={slug} />
      <button type="submit" className="admin-button-danger">Delete article</button>
    </form>
  );
}
