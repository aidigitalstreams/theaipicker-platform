'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav({
  href,
  label,
  exact = false,
}: {
  href: string;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname() || '';
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link href={href} className={`admin-nav-link${active ? ' active' : ''}`}>
      {label}
    </Link>
  );
}
