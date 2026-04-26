'use client';

import { useState } from 'react';
import type { Stream } from '@/lib/streams';

interface Props {
  streams: Stream[];
  activeStreamId: string;
}

export default function StreamSelector({ streams, activeStreamId }: Props) {
  const [open, setOpen] = useState(false);
  const active = streams.find(s => s.id === activeStreamId) ?? streams[0];
  const others = streams.filter(s => s.id !== activeStreamId);

  return (
    <div className={`admin-stream-selector${open ? ' open' : ''}`}>
      <button
        type="button"
        className="admin-stream-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="admin-stream-trigger-label">Stream</span>
        <span className="admin-stream-trigger-name">{active.name}</span>
        <span className="admin-stream-trigger-chevron" aria-hidden>▾</span>
      </button>

      {open && (
        <div className="admin-stream-menu" role="menu">
          <div className="admin-stream-menu-active">
            <div className="admin-stream-menu-name">{active.name}</div>
            <div className="admin-stream-menu-meta">
              {active.domain} · {active.status}
            </div>
          </div>

          {others.length > 0 ? (
            <div className="admin-stream-menu-list">
              {others.map(s => (
                <div key={s.id} className="admin-stream-menu-item disabled">
                  <span>{s.name}</span>
                  <span className="admin-stream-menu-meta">{s.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-stream-menu-empty">
              No other streams yet. Add a Stream #2 from the AI Digital Streams pipeline when ready.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
