'use client';

import { useState } from 'react';

const BRIDGE_COMMAND = `cd "C:\\Users\\John\\My Drive\\Business Operations\\theaipicker-platform" && node tools/execute-bridge.js`;

export default function StartBridgeButton({ bridgeOnline }: { bridgeOnline: boolean }) {
  const [copied, setCopied] = useState(false);

  if (bridgeOnline) return null;

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(BRIDGE_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = BRIDGE_COMMAND;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <button
      type="button"
      className="admin-button-primary"
      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
      onClick={handleClick}
    >
      {copied ? 'Copied ✓' : 'Start Bridge'}
    </button>
  );
}
