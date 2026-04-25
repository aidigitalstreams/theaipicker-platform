'use client';

import { useEffect, useRef } from 'react';

/**
 * Wraps rendered article HTML and enhances it:
 * - Wraps "What We Liked" / "What We Didn't Like" sections in styled boxes
 * - Could add more post-processing in future
 */
export default function ArticleContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Find all h2/h3 headings and wrap pros/cons sections
    const headings = ref.current.querySelectorAll('h2, h3');

    headings.forEach(heading => {
      const text = heading.textContent?.toLowerCase() || '';

      if (text.includes('what we liked') || text.includes('pros')) {
        wrapSection(heading as HTMLElement, 'pros-cons-liked');
      } else if (text.includes("what we didn't") || text.includes('what we didn\'t') || text.includes('cons')) {
        wrapSection(heading as HTMLElement, 'pros-cons-disliked');
      }
    });
  }, [html]);

  return (
    <div
      ref={ref}
      className="article-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function wrapSection(heading: HTMLElement, className: string) {
  // Collect the heading and following siblings until next heading or end
  const elements: Node[] = [heading];
  let sibling = heading.nextElementSibling;

  while (sibling && !['H1', 'H2', 'H3'].includes(sibling.tagName)) {
    elements.push(sibling);
    sibling = sibling.nextElementSibling;
  }

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = className;

  // Insert wrapper before heading
  heading.parentNode?.insertBefore(wrapper, heading);

  // Move elements into wrapper
  elements.forEach(el => wrapper.appendChild(el));
}
