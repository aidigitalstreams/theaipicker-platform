'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav({
  href,
  label,
  exact = false,
  badge,
}: {
  href: string;
  label: string;
  exact?: boolean;
  badge?: number;
}) {
  const pathname = usePathname() || '';
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link href={href} className={`admin-nav-link${active ? ' active' : ''}`}>
      <span className="admin-nav-link-label">{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span className="admin-nav-badge">{badge}</span>
      )}
    </Link>
  );
}
