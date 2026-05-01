// Applies a JSON manifest of new meta_description values to .md files.
// Usage: node tools/apply-meta-descriptions.js tools/meta-manifest.json [--dry]
//
// Manifest shape: { "content/path/file.md": "new meta description text" }
//
// Behaviour:
//   * Reads each target file
//   * Replaces the existing meta_description block (inline OR folded YAML)
//     with: meta_description: "TEXT"  (double-quoted, internal " escaped)
//   * Validates that every new value is between 150 and 160 chars (inclusive)
//   * Refuses to write if any value is out of range
//
// The replacement always uses inline quoted form for predictability, which is
// valid YAML for the consumers in this repo (they use the gray-matter parser).

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = process.argv[2];
const dry = process.argv.includes('--dry');

if (!manifestPath) {
  console.error('Usage: node tools/apply-meta-descriptions.js <manifest.json> [--dry]');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.resolve(manifestPath), 'utf8'));

const errors = [];
for (const [rel, value] of Object.entries(manifest)) {
  if (typeof value !== 'string') {
    errors.push(`${rel}: value is not a string`);
    continue;
  }
  if (value.length < 150 || value.length > 160) {
    errors.push(`${rel}: length ${value.length} (must be 150-160)`);
  }
  if (!/2026/.test(value)) {
    errors.push(`${rel}: missing 2026`);
  }
}
if (errors.length) {
  console.error(`Validation failed (${errors.length}):`);
  for (const e of errors) console.error('  ' + e);
  process.exit(2);
}

function replaceMetaDescription(text, newValue) {
  if (!text.startsWith('---')) throw new Error('No frontmatter');
  const endIdx = text.indexOf('\n---', 3);
  if (endIdx === -1) throw new Error('Unterminated frontmatter');
  const fmStart = 3;
  const fmEnd = endIdx;
  const fm = text.slice(fmStart, fmEnd);
  const body = text.slice(fmEnd);
  const lines = fm.split(/\r?\n/);

  let i = 0;
  let foundIdx = -1;
  while (i < lines.length) {
    if (/^meta_description:\s*/.test(lines[i])) {
      foundIdx = i;
      break;
    }
    i++;
  }
  if (foundIdx === -1) throw new Error('meta_description not found');

  const header = lines[foundIdx];
  const after = header.replace(/^meta_description:\s*/, '');
  let blockEnd = foundIdx + 1;
  if (after === '>-' || after === '>' || after === '|-' || after === '|') {
    while (blockEnd < lines.length && (/^\s/.test(lines[blockEnd]) || lines[blockEnd].trim() === '')) {
      blockEnd++;
    }
  }

  const escaped = newValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const newLine = `meta_description: "${escaped}"`;
  const newLines = [...lines.slice(0, foundIdx), newLine, ...lines.slice(blockEnd)];
  const newFm = newLines.join('\n');
  return text.slice(0, fmStart) + newFm + body;
}

let updated = 0;
for (const [rel, value] of Object.entries(manifest)) {
  const abs = path.join(root, rel);
  const original = fs.readFileSync(abs, 'utf8');
  const next = replaceMetaDescription(original, value);
  if (next === original) {
    console.log(`SKIP (no change): ${rel}`);
    continue;
  }
  if (!dry) fs.writeFileSync(abs, next);
  updated++;
  console.log(`OK ${value.length}\t${rel}`);
}

console.log(`\n${dry ? 'Dry run' : 'Applied'}: ${updated} files updated.`);
