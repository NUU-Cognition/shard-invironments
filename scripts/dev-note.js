#!/usr/bin/env node
// Create a note in a mesh section, stamping the authoritative section tag.
// With no section given, the note is dumped into New (Mesh/Main/).
// The section's location is found by scanning frontmatter (flat mesh) — the
// note is placed beside the header only as the visual default.
// Invocation: flint shard ie note ["<Section>"] "<Title>"
// Outputs: the path of the created note file.

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

// Find a section header by name or slug. Returns { file, slug } or null.
function findHeader(nameOrSlug) {
  const name = cleanName(nameOrSlug);
  const wantSlug = slugify(name);
  for (const file of walkMarkdown(meshDir)) {
    const base = path.basename(file);
    if (!base.startsWith('(Section) ')) continue;
    const fm = frontmatter(fs.readFileSync(file, 'utf8'));
    const m = fm.match(/#ie\/sections\/([a-z0-9-]+)/);
    if (!m) continue;
    if (base === `(Section) ${name}.md` || m[1] === wantSlug) {
      return { file, slug: m[1] };
    }
  }
  return null;
}

function main() {
  const args = process.argv.slice(2).filter((a) => a && a.trim());
  if (args.length === 0) {
    process.stderr.write('usage: flint shard ie note ["<Section>"] "<Title>"\n');
    process.exit(1);
  }
  const sectionArg = args.length > 1 ? args[0] : 'New';
  const title = String(args[args.length - 1]).trim();

  const found = findHeader(sectionArg);
  if (!found) {
    process.stderr.write(`no such section: ${sectionArg} (run: flint shard ie section "${cleanName(sectionArg)}")\n`);
    process.exit(1);
  }

  const safeTitle = title.replace(/[\/\\]/g, '-');
  const notePath = path.join(path.dirname(found.file), `${safeTitle}.md`);
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
  - "#ie/sections/${found.slug}"
description:
contact:
orbh-sessions:
template: "[[tmp-ie-note-v0.1]]"
created: ${today}
modified: ${today}
---

# ${title}

`;

  fs.writeFileSync(notePath, note, 'utf8');
  console.log(notePath);
}

main();
