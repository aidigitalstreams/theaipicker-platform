// Scans every .md file under content/ and reports the meta_description length.
// Outputs JSON: array of { file, length, meta_description, format }
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'content');

function listMd(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMd(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function parseFrontmatter(text) {
  // Very small front-matter parser focused on extracting meta_description.
  if (!text.startsWith('---')) return null;
  const endIdx = text.indexOf('\n---', 3);
  if (endIdx === -1) return null;
  const fm = text.slice(3, endIdx).replace(/^\r?\n/, '');
  const lines = fm.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^meta_description:\s*(.*)$/);
    if (!m) continue;
    let raw = m[1];
    // Folded / literal scalar
    if (raw === '>-' || raw === '>' || raw === '|-' || raw === '|') {
      const folded = raw.startsWith('>');
      const buf = [];
      for (let j = i + 1; j < lines.length; j++) {
        const l = lines[j];
        if (/^\S/.test(l)) break; // next top-level key
        if (l.trim() === '') {
          buf.push('');
          continue;
        }
        buf.push(l.replace(/^\s+/, ''));
      }
      let value;
      if (folded) {
        value = buf.join(' ').replace(/\s+/g, ' ').trim();
      } else {
        value = buf.join('\n').trim();
      }
      return { value, format: 'folded' };
    }
    // Inline scalar — may be quoted
    raw = raw.trim();
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      raw = raw.slice(1, -1);
    }
    return { value: raw, format: 'inline' };
  }
  return null;
}

const files = listMd(ROOT);
const rows = [];
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const md = parseFrontmatter(text);
  if (!md) continue;
  rows.push({
    file: path.relative(path.resolve(__dirname, '..'), f).replace(/\\/g, '/'),
    length: md.value.length,
    format: md.format,
    meta_description: md.value,
  });
}

rows.sort((a, b) => a.length - b.length);

const short = rows.filter((r) => r.length < 150);
console.log(`Total files with meta_description: ${rows.length}`);
console.log(`Under 150 chars: ${short.length}`);
console.log(`---`);
for (const r of short) {
  console.log(`${r.length}\t${r.format}\t${r.file}`);
  console.log(`  ${r.meta_description}`);
}
