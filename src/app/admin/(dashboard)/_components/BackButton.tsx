'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BackButton() {
  const pathname = usePathname() || '';
  if (pathname === '/admin' || pathname === '/admin/') return null;

  return (
    <Link href="/admin" className="admin-back-button" aria-label="Back to dashboard">
      <span aria-hidden="true">←</span>
      <span>Dashboard</span>
    </Link>
  );
}
