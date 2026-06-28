#!/usr/bin/env node
// List every map with its note count.
// Invocation: flint shard map list
// Outputs: one line per map — "<Name> — <N> notes".

const fs = require('fs');
const path = require('path');

const flintRoot = process.env.FLINT_ROOT || process.cwd();
const mapsDir = path.join(flintRoot, 'Mesh', 'Maps');

function main() {
  if (!fs.existsSync(mapsDir)) {
    return; // no maps yet — print nothing
  }
  const entries = fs.readdirSync(mapsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith('(Map) '))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const dir of entries) {
    const name = dir.name.replace(/^\(Map\)\s*/, '');
    const indexFile = `(Map) ${name}.md`;
    const files = fs.readdirSync(path.join(mapsDir, dir.name))
      .filter((f) => f.endsWith('.md') && f !== indexFile);
    console.log(`${name} — ${files.length} note${files.length === 1 ? '' : 's'}`);
  }
}

main();
