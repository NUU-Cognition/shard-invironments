#!/usr/bin/env node
// Create a note inside a map: scaffold <Title>.md with the note frontmatter.
// Invocation: flint shard map note "<Map>" "<Title>"
// Outputs: the path of the created note file.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const flintRoot = process.env.FLINT_ROOT || process.cwd();

function cleanName(raw) {
  return String(raw).replace(/^\(Map\)\s*/, '').trim();
}

function main() {
  const rawMap = process.argv[2];
  const rawTitle = process.argv[3];
  if (!rawMap || !rawTitle || !rawMap.trim() || !rawTitle.trim()) {
    process.stderr.write('usage: flint shard map note "<Map>" "<Title>"\n');
    process.exit(1);
  }
  const map = cleanName(rawMap);
  const title = String(rawTitle).trim();
  const folder = path.join(flintRoot, 'Mesh', 'Maps', `(Map) ${map}`);
  const indexPath = path.join(folder, `(Map) ${map}.md`);

  if (!fs.existsSync(indexPath)) {
    process.stderr.write(`no such map: ${map} (run: flint shard map create "${map}")\n`);
    process.exit(1);
  }

  // Note title must not collide with the index or another note.
  const safeTitle = title.replace(/[\/\\]/g, '-');
  const notePath = path.join(folder, `${safeTitle}.md`);
  if (fs.existsSync(notePath)) {
    process.stderr.write(`note already exists: ${notePath}\n`);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const uuid = crypto.randomUUID();
  const note = `---
id: ${uuid}
tags:
  - "#note"
map: "[[(Map) ${map}]]"
description:
contact:
orbh-sessions:
template: "[[tmp-map-note-v0.1]]"
created: ${today}
modified: ${today}
---

# ${title}

`;

  fs.writeFileSync(notePath, note, 'utf8');
  console.log(notePath);
}

main();
