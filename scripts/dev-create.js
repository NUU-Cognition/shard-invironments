#!/usr/bin/env node
// Create a new map: scaffold Mesh/Maps/(Map) <Name>/ and its index skeleton.
// Invocation: flint shard map create "<Name>"
// Outputs: the path of the created index file.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const flintRoot = process.env.FLINT_ROOT || process.cwd();

function cleanName(raw) {
  return String(raw).replace(/^\(Map\)\s*/, '').trim();
}

function main() {
  const raw = process.argv[2];
  if (!raw || !raw.trim()) {
    process.stderr.write('usage: flint shard map create "<Name>"\n');
    process.exit(1);
  }
  const name = cleanName(raw);
  const folder = path.join(flintRoot, 'Mesh', 'Maps', `(Map) ${name}`);
  const indexPath = path.join(folder, `(Map) ${name}.md`);

  if (fs.existsSync(indexPath)) {
    process.stderr.write(`map already exists: ${indexPath}\n`);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const uuid = crypto.randomUUID();
  const index = `---
id: ${uuid}
tags:
  - "#map"
orbh-sessions:
template: "[[tmp-map-map-v0.1]]"
created: ${today}
modified: ${today}
---

# ${name}

> Information Environment: what a mind must already hold to read this map's notes.

## Navigation

`;

  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(indexPath, index, 'utf8');
  console.log(indexPath);
}

main();
