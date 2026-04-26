import {
  listImageAssets,
  BRAND_PALETTE,
  BRAND_TYPE,
  VOICE_RULES,
} from '@/lib/design-assets';

export const dynamic = 'force-dynamic';

function formatKb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DesignCentrePage() {
  const images = listImageAssets();
  const orphaned = images.filter(i => i.usedBy.length === 0);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="breadcrumb">Brand</div>
          <h1>Design Centre</h1>
        </div>
        <div className="admin-topbar-meta">
          {images.length} image{images.length === 1 ? '' : 's'} · {orphaned.length} unused
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-grid-2">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Palette</h2>
                <div className="admin-card-sub">Hex codes used across the public site and admin shell.</div>
              </div>
            </div>
            <div className="admin-design-palette">
              {BRAND_PALETTE.map(p => (
                <div key={p.hex} className="admin-design-swatch">
                  <span className="admin-design-swatch-color" style={{ background: p.hex }} aria-hidden />
                  <div>
                    <div className="admin-design-swatch-name">{p.name}</div>
                    <code className="admin-design-swatch-hex">{p.hex}</code>
                    <div className="admin-design-swatch-role">{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Typography</h2>
                <div className="admin-card-sub">{BRAND_TYPE.primaryFamily} primary, system stack fallback.</div>
              </div>
            </div>
            <div className="admin-design-type">
              <div className="admin-design-type-sample" style={{ fontFamily: BRAND_TYPE.primaryFamily }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Display</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Heading</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--admin-text-muted)' }}>
                  Body — research-based, opinionated, evidence-backed.
                </div>
              </div>
              <div>
                <div className="admin-form-label">Scale</div>
                <ul className="admin-design-scale">
                  {BRAND_TYPE.scale.map(s => <li key={s}><code>{s}</code></li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Voice & tone rules</h2>
              <div className="admin-card-sub">Hard rules every Content Writer follows — see CLAUDE.md Principle 6.</div>
            </div>
          </div>
          <ul className="admin-design-voice">
            {VOICE_RULES.map((v, i) => (
              <li key={i}>
                <strong>{v.rule}.</strong> <span>{v.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-card" style={{ marginTop: '1.25rem' }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Image library</h2>
              <div className="admin-card-sub">
                Files in <code>/public/images/</code> with usage cross-referenced against article frontmatter.
              </div>
            </div>
          </div>
          {images.length === 0 ? (
            <div className="admin-form-help" style={{ padding: '0.5rem 0' }}>
              No images yet. Drop files into <code>public/images/</code> and reference them via the featured image field on each article.
            </div>
          ) : (
            <div className="admin-design-image-grid">
              {images.map(img => (
                <div key={img.filename} className="admin-design-image">
                  <div className="admin-design-image-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.path} alt={img.filename} />
                  </div>
                  <div className="admin-design-image-meta">
                    <code className="admin-design-image-name">{img.filename}</code>
                    <div className="admin-design-image-stats">
                      {formatKb(img.sizeBytes)} ·{' '}
                      {img.usedBy.length === 0
                        ? <span style={{ color: 'var(--admin-warning)' }}>unused</span>
                        : `${img.usedBy.length} use${img.usedBy.length === 1 ? '' : 's'}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
