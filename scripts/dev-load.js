#!/usr/bin/env node
// Load a map into context: print its index, then the note scent-list assembled
// from each note's `description` frontmatter (single source of truth).
// Invocation: flint shard map load "<Map>"
// Outputs: the index body, then a generated "## Notes" section.

const fs = require('fs');
const path = require('path');

const flintRoot = process.env.FLINT_ROOT || process.cwd();

function cleanName(raw) {
  return String(raw).replace(/^\(Map\)\s*/, '').trim();
}

// Read a single scalar frontmatter field (first occurrence).
function frontmatterField(content, field) {
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return '';
  const line = fm[1].split('\n').find((l) => l.startsWith(`${field}:`));
  if (!line) return '';
  return line.slice(field.length + 1).trim();
}

function main() {
  const raw = process.argv[2];
  if (!raw || !raw.trim()) {
    process.stderr.write('usage: flint shard map load "<Map>"\n');
    process.exit(1);
  }
  const name = cleanName(raw);
  const folder = path.join(flintRoot, 'Mesh', 'Maps', `(Map) ${name}`);
  const indexFile = `(Map) ${name}.md`;
  const indexPath = path.join(folder, indexFile);

  if (!fs.existsSync(indexPath)) {
    process.stderr.write(`no such map: ${name}\n`);
    process.exit(1);
  }

  // 1. Print the index verbatim (context + navigation).
  process.stdout.write(fs.readFileSync(indexPath, 'utf8').trimEnd() + '\n');

  // 2. Assemble the note list from each note's description.
  const notes = fs.readdirSync(folder)
    .filter((f) => f.endsWith('.md') && f !== indexFile)
    .sort((a, b) => a.localeCompare(b));

  console.log('\n## Notes\n');
  if (notes.length === 0) {
    console.log('_(no notes yet)_');
    return;
  }
  for (const file of notes) {
    const title = file.replace(/\.md$/, '');
    const desc = frontmatterField(fs.readFileSync(path.join(folder, file), 'utf8'), 'description');
    console.log(desc ? `- [[${title}]] — ${desc}` : `- [[${title}]]`);
  }
}

main();
