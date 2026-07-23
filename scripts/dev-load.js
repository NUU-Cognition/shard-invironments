#!/usr/bin/env node
// Load a mesh section into context: print its header (if managed), then the
// member scent-list assembled from frontmatter across the whole mesh (flat
// mesh — membership is the #ie/sections/<name> tag, never the folder).
// Invocation: flint shard ie load "<Section>"
// Outputs: the header body (when one exists), then a generated "## Members" section.

const fs = require('fs');
const path = require('path');

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

function scalarField(fm, field) {
  const line = fm.split('\n').find((l) => l.startsWith(`${field}:`));
  if (!line) return '';
  return line.slice(field.length + 1).trim().replace(/^["']|["']$/g, '');
}

function main() {
  const raw = process.argv[2];
  if (!raw || !raw.trim()) {
    process.stderr.write('usage: flint shard ie load "<Section>"\n');
    process.exit(1);
  }
  const name = cleanName(raw);
  const slug = slugify(name);
  const slugTag = new RegExp(`#ie/sections/${slug}(?![a-z0-9-])`);

  // Single scan: find the header (if any) and collect members.
  let headerFile = null;
  const members = []; // { title, desc }
  for (const file of walkMarkdown(meshDir)) {
    const content = fs.readFileSync(file, 'utf8');
    const fm = frontmatter(content);
    if (!fm || !slugTag.test(fm)) continue;
    const base = path.basename(file);
    if (base === `(Section) ${name}.md` || (fm.includes('"#ie"') && base.startsWith('(Section) '))) {
      headerFile = file;
    } else {
      members.push({ title: base.replace(/\.md$/, ''), desc: scalarField(fm, 'description') });
    }
  }

  if (!headerFile && members.length === 0) {
    process.stderr.write(`no such section: ${name} (no header and no members tagged ie/sections/${slug})\n`);
    process.exit(1);
  }

  if (headerFile) {
    process.stdout.write(fs.readFileSync(headerFile, 'utf8').trimEnd() + '\n');
  } else {
    console.log(`# ${name}\n\n_(unmanaged section — no header; members assembled from ie/sections/${slug} tags)_`);
  }

  members.sort((a, b) => a.title.localeCompare(b.title));
  console.log('\n## Members\n');
  if (members.length === 0) {
    console.log('_(no members yet)_');
    return;
  }
  for (const m of members) {
    console.log(m.desc ? `- [[${m.title}]] — ${m.desc}` : `- [[${m.title}]]`);
  }
}

main();
