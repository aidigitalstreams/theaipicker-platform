'use client';

import Link from 'next/link';
import { useState } from 'react';

function Logo() {
  return (
    <svg viewBox="26 10 170 56" width={153} height={50}>
      <defs>
        <linearGradient id="lgd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
        <linearGradient id="ltd" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
      </defs>
      <path d="M48 14 C58 14 66 22 66 33 C66 46 54 58 48 62 C42 58 30 46 30 33 C30 22 38 14 48 14 Z" fill="url(#lgd)"/>
      <text x="48" y="42" fontFamily="Inter,system-ui,sans-serif" fontSize="17" fontWeight="800" fill="#FFF" textAnchor="middle">AI</text>
      <text x="84" y="31" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="600" fill="url(#ltd)" letterSpacing="4">THE AI</text>
      <text x="84" y="58" fontFamily="Inter,system-ui,sans-serif" fontSize="30" fontWeight="800" fill="#F8FAFC">Picker</text>
    </svg>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/compare', label: 'Compare' },
    { href: '/best', label: 'Best Of' },
    { href: '/rankings', label: 'Rankings' },
    { href: '/tools', label: 'All Tools' },
    { href: '/guides', label: 'Guides' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10,15,30,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <Logo />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: '#94A3B8',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  padding: '0.4375rem 1rem',
                  borderRadius: '0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden" style={{ paddingBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '0.75rem' }}>
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem', padding: '0.625rem 0' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
