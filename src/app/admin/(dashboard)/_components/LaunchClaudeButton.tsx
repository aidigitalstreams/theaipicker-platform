'use client';

import { useState } from 'react';

const LAUNCH_COMMAND = `cd "C:\\Users\\John\\My Drive\\Business Operations\\theaipicker-platform" && claude`;

export default function LaunchClaudeButton() {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(LAUNCH_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = LAUNCH_COMMAND;
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
      className="admin-sidebar-launch"
      onClick={handleClick}
    >
      <span className="admin-nav-link-label">
        {copied ? 'Copied ✓' : 'Launch Claude Code'}
      </span>
    </button>
  );
}
