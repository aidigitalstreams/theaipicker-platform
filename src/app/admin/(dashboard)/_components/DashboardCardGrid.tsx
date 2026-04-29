'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export type DashboardSubLink = {
  href: string;
  label: string;
};

export type DashboardCardData = {
  id: string;
  title: string;
  icon: string;
  stat?: {
    value: string;
    label: string;
    tone?: 'default' | 'success' | 'warning' | 'danger';
  };
  links: DashboardSubLink[];
};

const ORDER_KEY = 'aids-dashboard-card-order-v1';

function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function applyStoredOrder(cards: DashboardCardData[], stored: string[] | null): DashboardCardData[] {
  if (!stored || stored.length === 0) return cards;
  const byId = new Map(cards.map(c => [c.id, c]));
  const ordered: DashboardCardData[] = [];
  for (const id of stored) {
    const card = byId.get(id);
    if (card) {
      ordered.push(card);
      byId.delete(id);
    }
  }
  // Append any new cards not in stored order
  for (const card of byId.values()) ordered.push(card);
  return ordered;
}

export default function DashboardCardGrid({ cards }: { cards: DashboardCardData[] }) {
  const [order, setOrder] = useState<DashboardCardData[]>(cards);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDER_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : null;
      setOrder(applyStoredOrder(cards, parsed));
    } catch {
      setOrder(cards);
    }
    setHydrated(true);
  }, [cards]);

  const persist = (next: DashboardCardData[]) => {
    setOrder(next);
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(next.map(c => c.id)));
    } catch {
      // ignore quota / privacy mode failures
    }
  };

  const ids = useMemo(() => order.map(c => c.id).join(','), [order]);

  return (
    <div className="admin-dashboard-grid" data-card-order={ids}>
      {order.map((card, index) => (
        <div
          key={card.id}
          className={`admin-dashboard-card${
            dragIndex === index ? ' dragging' : ''
          }${overIndex === index && dragIndex !== null && dragIndex !== index ? ' drag-over' : ''}`}
          draggable={hydrated}
          onDragStart={e => {
            setDragIndex(index);
            e.dataTransfer.effectAllowed = 'move';
            // Required for Firefox to start the drag
            e.dataTransfer.setData('text/plain', card.id);
          }}
          onDragOver={e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (overIndex !== index) setOverIndex(index);
          }}
          onDragLeave={() => {
            if (overIndex === index) setOverIndex(null);
          }}
          onDrop={e => {
            e.preventDefault();
            if (dragIndex === null || dragIndex === index) {
              setDragIndex(null);
              setOverIndex(null);
              return;
            }
            persist(reorder(order, dragIndex, index));
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
        >
          <div className="admin-dashboard-card-head">
            <div className="admin-dashboard-card-icon" aria-hidden="true">
              {card.icon}
            </div>
            <div className="admin-dashboard-card-title-block">
              <h2 className="admin-dashboard-card-title">{card.title}</h2>
              {card.stat && (
                <div className={`admin-dashboard-card-stat tone-${card.stat.tone ?? 'default'}`}>
                  <span className="admin-dashboard-card-stat-value">{card.stat.value}</span>
                  <span className="admin-dashboard-card-stat-label">{card.stat.label}</span>
                </div>
              )}
            </div>
            <div className="admin-dashboard-card-grip" aria-hidden="true" title="Drag to reorder">
              ⋮⋮
            </div>
          </div>

          <ul className="admin-dashboard-card-links">
            {card.links.map(link => (
              <li key={link.href}>
                <Link href={link.href} className="admin-dashboard-card-link">
                  <span>{link.label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
