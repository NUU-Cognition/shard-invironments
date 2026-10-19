#!/usr/bin/env node
// Create a managed mesh section: scaffold (Section) <Name>/ + its header under
// Mesh/Sections/ (optionally at a display path — display only, no semantics).
// Section names are flat and unique across the mesh; the tags are authoritative.
// Invocation: flint shard ie section "<Name>" [display/path]
// Outputs: the path of the created header file.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

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

// The shape of an Orbh session id: 8-4-4-4-12 hex.
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The org of [flint] in flint.toml, or '' when the Flint has none (a local Flint).
function flintOrg() {
  let text;
  try {
    text = fs.readFileSync(path.join(flintRoot, 'flint.toml'), 'utf8');
  } catch {
    return '';
  }
  let inFlint = false;
  for (const line of text.split(/\r?\n/)) {
    const table = /^\s*\[\[?([^\]]*)\]\]?\s*(?:#.*)?$/.exec(line);
    if (table) {
      inFlint = table[1].trim() === 'flint';
      continue;
    }
    const org = inFlint ? /^\s*org\s*=\s*(?:"([^"]*)"|'([^']*)')\s*(?:#.*)?$/.exec(line) : null;
    if (org) {
      const slug = (org[1] !== undefined ? org[1] : org[2]).trim();
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : '';
    }
  }
  return '';
}

// The orb: field of the new file (NUU Orbh Mission 027): the `by` of `flint address me --json` for
// ORBH_SESSION_ID. A CLI with no `flint address me` gives the short form @v1/<org>/session/<uuid>.
// With no session, the field is empty. Never parse an address.
function orbField() {
  const session = process.env.ORBH_SESSION_ID;
  if (!session) return 'orb:';
  const id = session.trim().toLowerCase();
  if (!SESSION_ID.test(id)) {
    process.stderr.write(`warning: ORBH_SESSION_ID ${JSON.stringify(session)} is not a session UUID: no orb stamp\n`);
    return 'orb:';
  }
  // SIGKILL: a child that ignores SIGTERM must not hold the command after the timeout.
  const result = spawnSync('flint', ['address', 'me', '--json'], {
    cwd: flintRoot,
    env: { ...process.env, ORBH_SESSION_ID: id },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 15000,
    killSignal: 'SIGKILL',
  });
  let address = `@v1/${flintOrg()}/session/${id}`;
  if (!result.error && result.status === 0) {
    try {
      const { by } = JSON.parse(result.stdout);
      if (typeof by === 'string' && by.startsWith('@v1/') && !/\s/.test(by)) address = by;
    } catch {
      // No v1 text: keep the short form.
    }
  }
  return `orb:\n  - ${JSON.stringify(address)}`;
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
${orbField()}
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
