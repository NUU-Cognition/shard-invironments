#!/usr/bin/env node
// List every mesh section and mesh group with member counts — assembled
// entirely from frontmatter tags (flat mesh; folders are display only).
// Invocation: flint shard ie list
// Outputs: sections (headed and unmanaged), then groups.

const fs = require('fs');
const path = require('path');

const flintRoot = process.env.FLINT_ROOT || process.cwd();
const meshDir = path.join(flintRoot, 'Mesh');

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
  if (!fs.existsSync(meshDir)) return;

  const headers = {}; // slug -> display name
  const groupDefs = {}; // slug -> display name
  const sectionCounts = {}; // slug -> member count
  const groupCounts = {}; // slug -> member count

  for (const file of walkMarkdown(meshDir)) {
    const content = fs.readFileSync(file, 'utf8');
    const fm = frontmatter(content);
    if (!fm) continue;
    const base = path.basename(file, '.md');

    for (const m of fm.matchAll(/#ie\/sections\/([a-z0-9-]+)/g)) {
      sectionCounts[m[1]] = (sectionCounts[m[1]] || 0) + 1;
      if (fm.includes('"#ie"') && base.startsWith('(Section) ')) {
        headers[m[1]] = base.replace(/^\(Section\)\s*/, '');
      }
    }
    for (const m of fm.matchAll(/#ie\/groups\/([a-z0-9-]+)/g)) {
      groupCounts[m[1]] = (groupCounts[m[1]] || 0) + 1;
      if (base.startsWith('(Group) ')) {
        groupDefs[m[1]] = base.replace(/^\(Group\)\s*/, '');
      }
    }
  }

  const sectionSlugs = Object.keys(sectionCounts).sort();
  if (sectionSlugs.length) {
    console.log('Sections');
    for (const slug of sectionSlugs) {
      const label = headers[slug] ? headers[slug] : `${slug} (unmanaged)`;
      const n = sectionCounts[slug] - (headers[slug] ? 1 : 0); // exclude the header itself
      console.log(`  ${label} [ie/sections/${slug}] — ${n} member${n === 1 ? '' : 's'}`);
    }
  }

  const groupSlugs = Object.keys(groupCounts).sort();
  if (groupSlugs.length) {
    console.log('Groups');
    for (const slug of groupSlugs) {
      const label = groupDefs[slug] ? groupDefs[slug] : `${slug} (undefined)`;
      const n = groupCounts[slug] - (groupDefs[slug] ? 1 : 0); // exclude the definition itself
      console.log(`  ${label} [ie/groups/${slug}] — ${n} member${n === 1 ? '' : 's'}`);
    }
  }
}

main();
