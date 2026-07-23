#!/usr/bin/env node
// Create a mesh group: scaffold its definition file (Group) <Name>.md in
// Mesh/Groups/. The definition carries the group's own tag, so it surfaces
// alongside its members.
// Invocation: flint shard ie group "<Name>"
// Outputs: the path of the created definition file.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const flintRoot = process.env.FLINT_ROOT || process.cwd();
const groupsDir = path.join(flintRoot, 'Mesh', 'Groups');

function cleanName(raw) {
  return String(raw).replace(/^\(Group\)\s*/, '').trim();
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function main() {
  const raw = process.argv[2];
  if (!raw || !raw.trim()) {
    process.stderr.write('usage: flint shard ie group "<Name>"\n');
    process.exit(1);
  }
  const name = cleanName(raw);
  const slug = slugify(name);
  const defPath = path.join(groupsDir, `(Group) ${name}.md`);

  if (fs.existsSync(defPath)) {
    process.stderr.write(`group already exists: ${defPath}\n`);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const uuid = crypto.randomUUID();
  const def = `---
id: ${uuid}
tags:
  - "#ie/groups/${slug}"
description:
orbh-sessions:
template: "[[tmp-ie-group-v0.1]]"
created: ${today}
modified: ${today}
---

# ${name}

`;

  fs.mkdirSync(groupsDir, { recursive: true });
  fs.writeFileSync(defPath, def, 'utf8');
  console.log(defPath);
}

main();
