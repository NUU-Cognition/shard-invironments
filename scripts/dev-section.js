#!/usr/bin/env node
// Create a managed mesh section: scaffold (Section) <Name>/ + its header under
// Mesh/Sections/ (optionally at a display path — display only, no semantics).
// Section names are flat and unique across the mesh; the tags are authoritative.
// Invocation: flint shard ie section "<Name>" [display/path]
// Outputs: the path of the created header file.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const flintRoot = process.env.FLINT_ROOT || process.cwd();
const meshDir = path.join(flintRoot, 'Mesh');

function cleanName(raw) {
  return String(raw).replace(/^\(Section\)\s*/, '').trim();
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function* walkMarkdown(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMarkdown(full);
    else if (entry.name.endsWith('.md')) yield full;
  }
}

function frontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : '';
}

function main() {
  const raw = process.argv[2];
  const displayPath = (process.argv[3] || '').trim().replace(/^\/+|\/+$/g, '');
  if (!raw || !raw.trim()) {
    process.stderr.write('usage: flint shard ie section "<Name>" [display/path]\n');
    process.exit(1);
  }
  const name = cleanName(raw);
  const slug = slugify(name);

  // Flat-name guards: no header with this name, no section tag with this slug.
  if (fs.existsSync(meshDir)) {
    const slugTag = new RegExp(`#ie/sections/${slug}(?![a-z0-9-])`);
    for (const file of walkMarkdown(meshDir)) {
      if (path.basename(file) === `(Section) ${name}.md`) {
        process.stderr.write(`section already exists: ${file}\n`);
        process.exit(1);
      }
      const fm = frontmatter(fs.readFileSync(file, 'utf8'));
      if (fm.includes('"#ie"') && slugTag.test(fm)) {
        process.stderr.write(`section slug ie/sections/${slug} already headed by: ${file}\n`);
        process.exit(1);
      }
    }
  }

  const folder = path.join(meshDir, 'Sections', ...(displayPath ? displayPath.split('/') : []), `(Section) ${name}`);
  const headerPath = path.join(folder, `(Section) ${name}.md`);

  const today = new Date().toISOString().slice(0, 10);
  const uuid = crypto.randomUUID();
  const header = `---
id: ${uuid}
tags:
  - "#ie"
  - "#ie/sections/${slug}"
description:
orbh-sessions:
template: "[[tmp-ie-section-v0.1]]"
created: ${today}
modified: ${today}
---

# ${name}

> Context envelope: what a mind must already hold to read this section's members.

## Navigation

`;

  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(headerPath, header, 'utf8');
  console.log(headerPath);
}

main();
