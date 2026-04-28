const NODE_W = 180;
const NODE_H = 64;
const HW = NODE_W / 2;
const HH = NODE_H / 2;

type NodeTone = 'user' | 'db';

type SystemNode = {
  id: string;
  label: string;
  cx: number;
  cy: number;
  sub?: string;
  tone?: NodeTone;
};

const NODES: SystemNode[] = [
  { id: 'user',      label: 'User',            cx: 500, cy: 60,  sub: 'Browser / Desktop', tone: 'user' },
  { id: 'cowork',    label: 'Cowork',          cx: 250, cy: 200, sub: 'Claude Desktop' },
  { id: 'dashboard', label: 'Admin Dashboard', cx: 750, cy: 200, sub: '/admin/*' },
  { id: 'drive',     label: 'Google Drive',    cx: 110, cy: 360, sub: 'Mounted FS' },
  { id: 'bridge',    label: 'Bridge',          cx: 400, cy: 360, sub: 'Inbox watcher' },
  { id: 'cc',        label: 'Claude Code',     cx: 400, cy: 510, sub: 'CLI agent' },
  { id: 'vercel',    label: 'Vercel API',      cx: 750, cy: 440, sub: 'Next.js routes' },
  { id: 'neon',      label: 'Neon DB',         cx: 750, cy: 600, sub: 'Postgres', tone: 'db' },
];

const NODE_MAP: Record<string, SystemNode> = Object.fromEntries(NODES.map(n => [n.id, n]));

type Edge = { from: string; to: string; label: string | string[] };

const EDGES: Edge[] = [
  { from: 'user',      to: 'cowork',    label: 'chat' },
  { from: 'user',      to: 'dashboard', label: 'browse' },
  { from: 'cowork',    to: 'drive',     label: 'file drop (cowork-jobs.json)' },
  { from: 'drive',     to: 'bridge',    label: 'file sync' },
  { from: 'bridge',    to: 'vercel',    label: ['REST API', '(poll/heartbeat/results)'] },
  { from: 'bridge',    to: 'cc',        label: 'spawn with tasks.md' },
  { from: 'cc',        to: 'vercel',    label: 'git push → deploy' },
  { from: 'dashboard', to: 'vercel',    label: 'Next.js' },
  { from: 'vercel',    to: 'neon',      label: 'queries' },
];

function edgePoint(from: SystemNode, to: SystemNode) {
  const dx = from.cx - to.cx;
  const dy = from.cy - to.cy;
  const adx = Math.abs(dx) || 0.0001;
  const ady = Math.abs(dy) || 0.0001;
  const scale = adx * HH > ady * HW ? HW / adx : HH / ady;
  return { x: to.cx + dx * scale, y: to.cy + dy * scale };
}

export default function SystemMapPage() {
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
                The pieces that move data and prompts between Cowork, Claude Code, and the live site.
              </div>
            </div>
          </div>

          <div className="admin-system-map-canvas">
            <svg viewBox="0 0 1000 700" role="img" aria-label="AIDS system architecture diagram">
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

              {NODES.map(node => {
                const x = node.cx - HW;
                const y = node.cy - HH;
                const toneClass = node.tone ? ` tone-${node.tone}` : '';
                return (
                  <g key={node.id} className={`admin-system-map-node${toneClass}`}>
                    <rect
                      className="admin-system-map-node-rect"
                      x={x}
                      y={y}
                      width={NODE_W}
                      height={NODE_H}
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
        </div>
      </div>
    </>
  );
}
