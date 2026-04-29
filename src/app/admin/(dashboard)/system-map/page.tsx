const DEFAULT_W = 180;
const DEFAULT_H = 64;

type NodeTone = 'user' | 'db' | 'storage' | 'code' | 'cloud';
type NodeShape = 'box' | 'container';

type SystemNode = {
  id: string;
  label: string;
  cx: number;
  cy: number;
  sub?: string;
  tone?: NodeTone;
  shape?: NodeShape;
  width?: number;
  height?: number;
};

const NODES: SystemNode[] = [
  { id: 'cowork',    label: 'Cowork',         cx: 170, cy: 70,  sub: 'Claude Desktop' },
  { id: 'user',      label: 'User',           cx: 500, cy: 70,  sub: 'Browser / Laptop',           tone: 'user' },
  { id: 'dashboard', label: 'AIDS Dashboard', cx: 830, cy: 70,  sub: 'Main interface' },

  { id: 'drive',     label: 'Google Drive',   cx: 170, cy: 180, sub: 'File-drop only',             tone: 'storage', width: 150, height: 52 },

  { id: 'homepc',    label: 'Home PC',        cx: 170, cy: 410,                                    shape: 'container', width: 220, height: 280, tone: 'cloud', sub: '24/7 always-on' },
  { id: 'bridge',    label: 'Bridge',         cx: 170, cy: 340, sub: 'Inbox watcher',              width: 160, height: 52 },
  { id: 'cc',        label: 'Claude Code',    cx: 170, cy: 470, sub: 'CLI agent',                  width: 160, height: 52 },

  { id: 'github',    label: 'GitHub',         cx: 170, cy: 640, sub: 'Platform code only',         tone: 'code' },

  { id: 'vercel',    label: 'Vercel API',     cx: 830, cy: 400, sub: 'Next.js routes',             tone: 'cloud' },
  { id: 'neon',      label: 'Neon DB',        cx: 830, cy: 620, sub: 'All business data + jobs',   tone: 'db' },
];

const NODE_MAP: Record<string, SystemNode> = Object.fromEntries(NODES.map(n => [n.id, n]));

function nodeW(n: SystemNode): number { return n.width ?? DEFAULT_W; }
function nodeH(n: SystemNode): number { return n.height ?? DEFAULT_H; }

type Edge = { from: string; to: string; label: string | string[] };

const EDGES: Edge[] = [
  { from: 'user',      to: 'cowork',    label: 'chat' },
  { from: 'user',      to: 'dashboard', label: 'browse' },
  { from: 'user',      to: 'homepc',    label: 'VPN + Remote Desktop' },
  { from: 'cowork',    to: 'drive',     label: 'file drop' },
  { from: 'drive',     to: 'bridge',    label: 'file sync' },
  { from: 'bridge',    to: 'cc',        label: 'spawn tasks.md' },
  { from: 'bridge',    to: 'vercel',    label: ['REST API', '(poll · heartbeat · results)'] },
  { from: 'cc',        to: 'github',    label: 'git push' },
  { from: 'github',    to: 'vercel',    label: 'auto deploy' },
  { from: 'dashboard', to: 'vercel',    label: 'Next.js API' },
  { from: 'vercel',    to: 'neon',      label: 'queries' },
];

function edgePoint(from: SystemNode, to: SystemNode) {
  const dx = from.cx - to.cx;
  const dy = from.cy - to.cy;
  const adx = Math.abs(dx) || 0.0001;
  const ady = Math.abs(dy) || 0.0001;
  const hw = nodeW(to) / 2;
  const hh = nodeH(to) / 2;
  const scale = adx * hh > ady * hw ? hw / adx : hh / ady;
  return { x: to.cx + dx * scale, y: to.cy + dy * scale };
}

export default function SystemMapPage() {
  const containers = NODES.filter(n => n.shape === 'container');
  const boxes = NODES.filter(n => n.shape !== 'container');

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">Operations</div>
          <h1>System map</h1>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-card admin-system-map">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">How AIDS connects</h2>
              <div className="admin-card-sub">
                <span className="admin-system-map-status">Target Architecture</span>
                <span className="admin-system-map-status-sep" aria-hidden="true">—</span>
                <span>Migration In Progress</span>
              </div>
            </div>
          </div>

          <div className="admin-system-map-canvas">
            <svg viewBox="0 0 1000 740" role="img" aria-label="AIDS target system architecture diagram">
              <defs>
                <marker
                  id="aids-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0 L10,5 L0,10 z" className="admin-system-map-arrow" />
                </marker>
              </defs>

              {containers.map(node => {
                const w = nodeW(node);
                const h = nodeH(node);
                const x = node.cx - w / 2;
                const y = node.cy - h / 2;
                const toneClass = node.tone ? ` tone-${node.tone}` : '';
                return (
                  <g key={node.id} className={`admin-system-map-container${toneClass}`}>
                    <rect
                      className="admin-system-map-container-rect"
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx={14}
                    />
                    <text
                      className="admin-system-map-container-label"
                      x={x + 14}
                      y={y + 18}
                    >
                      {node.label}
                    </text>
                    {node.sub && (
                      <text
                        className="admin-system-map-container-sub"
                        x={x + 14}
                        y={y + 32}
                      >
                        {node.sub}
                      </text>
                    )}
                  </g>
                );
              })}

              {EDGES.map((edge, idx) => {
                const from = NODE_MAP[edge.from];
                const to = NODE_MAP[edge.to];
                const start = edgePoint(to, from);
                const end = edgePoint(from, to);
                const mx = (start.x + end.x) / 2;
                const my = (start.y + end.y) / 2;
                const lines = Array.isArray(edge.label) ? edge.label : [edge.label];
                const lineHeight = 13;
                return (
                  <g key={idx}>
                    <line
                      className="admin-system-map-edge"
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      markerEnd="url(#aids-arrow)"
                    />
                    {lines.map((line, i) => (
                      <text
                        key={i}
                        className="admin-system-map-edge-label"
                        x={mx}
                        y={my + (i - (lines.length - 1) / 2) * lineHeight}
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                );
              })}

              {boxes.map(node => {
                const w = nodeW(node);
                const h = nodeH(node);
                const x = node.cx - w / 2;
                const y = node.cy - h / 2;
                const toneClass = node.tone ? ` tone-${node.tone}` : '';
                return (
                  <g key={node.id} className={`admin-system-map-node${toneClass}`}>
                    <rect
                      className="admin-system-map-node-rect"
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx={10}
                    />
                    <text
                      className="admin-system-map-node-label"
                      x={node.cx}
                      y={node.cy - (node.sub ? 8 : 0)}
                    >
                      {node.label}
                    </text>
                    {node.sub && (
                      <text
                        className="admin-system-map-node-sub"
                        x={node.cx}
                        y={node.cy + 12}
                      >
                        {node.sub}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="admin-system-map-legend">
            <div className="admin-system-map-legend-row">
              <span className="admin-system-map-swatch tone-user" aria-hidden="true" /> Operator
            </div>
            <div className="admin-system-map-legend-row">
              <span className="admin-system-map-swatch tone-cloud" aria-hidden="true" /> Compute
            </div>
            <div className="admin-system-map-legend-row">
              <span className="admin-system-map-swatch tone-storage" aria-hidden="true" /> Transport
            </div>
            <div className="admin-system-map-legend-row">
              <span className="admin-system-map-swatch tone-code" aria-hidden="true" /> Code
            </div>
            <div className="admin-system-map-legend-row">
              <span className="admin-system-map-swatch tone-db" aria-hidden="true" /> Source of truth
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
