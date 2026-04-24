'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
      <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563EB' }}>The AI Picker</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden md:flex">
            <Link href="/rankings" style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem' }}>Rankings</Link>
            <Link href="/tools" style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem' }}>All Tools</Link>
            <Link href="/compare" style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem' }}>Compare</Link>
            <Link href="/guides" style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem' }}>Guides</Link>
            <Link href="/about" style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem' }}>About</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden" style={{ paddingBottom: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.75rem' }}>
              <Link href="/rankings" onClick={() => setMenuOpen(false)} style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0' }}>Rankings</Link>
              <Link href="/tools" onClick={() => setMenuOpen(false)} style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0' }}>All Tools</Link>
              <Link href="/compare" onClick={() => setMenuOpen(false)} style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0' }}>Compare</Link>
              <Link href="/guides" onClick={() => setMenuOpen(false)} style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0' }}>Guides</Link>
              <Link href="/about" onClick={() => setMenuOpen(false)} style={{ color: '#1E293B', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0' }}>About</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
