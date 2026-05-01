// Quick check: list any meta_description currently over 160 chars.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'content');

function listMd(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listMd(p));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function getMeta(text) {
  if (!text.startsWith('---')) return null;
  const endIdx = text.indexOf('\n---', 3);
  if (endIdx === -1) return null;
  const fm = text.slice(3, endIdx);
  const lines = fm.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^meta_description:\s*(.*)$/);
    if (!m) continue;
    let raw = m[1];
    if (raw === '>-' || raw === '>' || raw === '|-' || raw === '|') {
      const folded = raw.startsWith('>');
      const buf = [];
      for (let j = i + 1; j < lines.length; j++) {
        const l = lines[j];
        if (/^\S/.test(l)) break;
        if (l.trim() === '') { buf.push(''); continue; }
        buf.push(l.replace(/^\s+/, ''));
      }
      return folded ? buf.join(' ').replace(/\s+/g, ' ').trim() : buf.join('\n').trim();
    }
    raw = raw.trim();
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      raw = raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return raw;
  }
  return null;
}

const over = [];
for (const f of listMd(ROOT)) {
  const txt = fs.readFileSync(f, 'utf8');
  const v = getMeta(txt);
  if (v && v.length > 160) {
    over.push({ rel: path.relative(path.resolve(__dirname, '..'), f).replace(/\\/g, '/'), len: v.length, value: v });
  }
}
console.log(`Files over 160: ${over.length}`);
for (const r of over) console.log(`${r.len}\t${r.rel}\n  ${r.value}`);
