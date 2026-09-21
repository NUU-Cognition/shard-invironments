#!/usr/bin/env node
// Create a note beside its section header. The section tag defines membership.
// Invocation: flint shard ie note "<Title>" [--section <name>] [options]

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { parseArgs } = require('util');

const flintRoot = process.env.FLINT_ROOT || process.cwd();
const meshDir = path.join(flintRoot, 'Mesh');
const args = process.argv.slice(2);
const optionArgs = args.includes('--') ? args.slice(0, args.indexOf('--')) : args;
const json = optionArgs.includes('--json');
const usage = 'Usage: flint shard ie note "<Title>" [--section <name>] [--description <text>] [--body-file <path>] [--author <Name>] [--session <id>] [--json]';
const help = `${usage}
       flint shard ie note <section> "<Title>" [options]
       flint shard ie note --title "<Title>" [options]

The default section is New. The note goes beside its section header.
The default author is name in $NUU_HOME/config.toml (or ~/.nuucognition/config.toml).
The default session is ORBH_SESSION_ID. Use --help or -h to show this help.`;

function fail(code, reason, next = []) {
  if (json) {
    console.log(JSON.stringify({ ok: false, kind: 'note', code, reason, created: [], next }));
  } else {
    console.error(reason);
    for (const command of next) console.error(command);
  }
  process.exit(1);
}

function usageError(reason) {
  fail('USAGE', `${reason}\n${usage}`);
}

function cleanName(raw) {
  return String(raw).replace(/^\(Section\)\s*/, '').trim();
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function* walkMarkdown(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMarkdown(full);
    else if (entry.name.toLowerCase().endsWith('.md')) yield full;
  }
}

function frontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}

// Find a section header by name or slug.
function findHeader(files, nameOrSlug) {
  const name = cleanName(nameOrSlug);
  const wantSlug = slugify(name);
  for (const file of files) {
    const base = path.basename(file);
    if (!base.startsWith('(Section) ')) continue;
    const fm = frontmatter(fs.readFileSync(file, 'utf8'));
    const m = fm.match(/#ie\/sections\/([a-z0-9-]+)/);
    if (!m) continue;
    if (base === `(Section) ${name}.md` || m[1] === wantSlug) {
      return { file, slug: m[1], name: cleanName(base.slice(0, -3)) };
    }
  }
  return null;
}

// Read the top-level TOML Name string without a package dependency.
// Ignore names in tables. Support basic and literal strings and comments.
function operatorName() {
  try {
    const home = process.env.NUU_HOME || path.join(os.homedir(), '.nuucognition');
    const config = fs.readFileSync(path.join(home, 'config.toml'), 'utf8');
    for (const line of config.split(/\r?\n/)) {
      if (/^\s*\[/.test(line)) break;
      const match = line.match(/^\s*(?:name|"name"|'name')\s*=\s*("(?:[^"\\]|\\.)*"|'[^']*')\s*(?:#.*)?$/);
      if (!match) continue;
      const value = match[1];
      if (value.startsWith("'")) return value.slice(1, -1).trim();
      // TOML also supports eight-digit Unicode escapes.
      const decoded = value.replace(/\\(?:U([0-9a-fA-F]{8})|u([0-9a-fA-F]{4})|([btnfr"\\]))/g,
        (_, wide, narrow, escape) => {
          if (wide || narrow) return String.fromCodePoint(parseInt(wide || narrow, 16));
          return { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', '"': '"', '\\': '\\' }[escape];
        });
      return decoded.slice(1, -1).trim();
    }
  } catch {
    // Match flint whoami: an absent or unreadable Name has no author.
  }
  return '';
}

// JSON strings are YAML double-quoted scalars. Escape YAML line separators too.
function quote(value) {
  return JSON.stringify(value).replace(/[\u0085\u2028\u2029]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

function main() {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      options: {
        title: { type: 'string' },
        section: { type: 'string' },
        description: { type: 'string' },
        'body-file': { type: 'string' },
        author: { type: 'string' },
        session: { type: 'string' },
        json: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (error) {
    usageError(error.message);
  }
  const { values, positionals } = parsed;
  if (values.help) {
    console.log(help);
    return;
  }
  if (values.title !== undefined ? positionals.length !== 0 : positionals.length < 1 || positionals.length > 2) {
    usageError('Supply one title, or a section and a title. Do not add extra positional arguments.');
  }
  if (positionals.length === 2 && values.section !== undefined) {
    usageError('Use either a positional section or --section.');
  }
  const sectionArg = values.section ?? (positionals.length === 2 ? positionals[0] : 'New');
  const title = (values.title ?? positionals[positionals.length - 1]).trim();
  if (!title || /[\x00-\x1f\x7f]/.test(title)) usageError('The title must have text and no control characters.');
  if (!cleanName(sectionArg)) usageError('The section name must have text.');
  for (const key of ['body-file', 'author', 'session']) {
    if (values[key] !== undefined && !values[key].trim()) usageError(`--${key} needs a value with text.`);
  }

  const files = [...walkMarkdown(meshDir)];
  const found = findHeader(files, sectionArg);
  if (!found) {
    fail('SECTION_NOT_FOUND', `No such section: ${sectionArg}.`,
      [`flint shard ie section ${quote(cleanName(sectionArg))}`]);
  }

  // Keep the old filename rule. Compare filenames in every Mesh directory.
  const safeTitle = title.replace(/[\/\\]/g, '-');
  const filename = `${safeTitle}.md`;
  const existing = files.find((file) => path.basename(file).toLowerCase() === filename.toLowerCase());
  if (existing) fail('NOTE_EXISTS', `Note already exists: ${path.relative(flintRoot, existing)}`);

  let body = '';
  if (values['body-file'] !== undefined) {
    try {
      body = fs.readFileSync(values['body-file'], 'utf8');
    } catch (error) {
      fail('BODY_READ_FAILED', `Cannot read body file: ${error.message}`);
    }
  }
  const author = values.author === undefined ? operatorName() : values.author.trim();
  const session = values.session ?? process.env.ORBH_SESSION_ID;
  const today = new Date().toISOString().slice(0, 10);
  const id = crypto.randomUUID();
  const lines = [
    '---',
    `id: ${quote(id)}`,
    'tags:',
    '  - "#note"',
    `  - ${quote(`#ie/sections/${found.slug}`)}`,
    `description: ${quote(values.description ?? '')}`,
  ];
  if (author) lines.push('authors:', `  - ${quote(`[[@${author}]]`)}`);
  if (session) lines.push('orbh-sessions:', `  - ${quote(`[[${session}]]`)}`);
  lines.push('template: "[[tmp-ie-note-v0.1]]"', `created: ${today}`, `modified: ${today}`, '---', '', `# ${title}`, '', '');
  const note = lines.join('\n') + body;
  const notePath = path.join(path.dirname(found.file), filename);
  try {
    fs.writeFileSync(notePath, note, { encoding: 'utf8', flag: 'wx' });
  } catch (error) {
    if (error.code === 'EEXIST') fail('NOTE_EXISTS', `Note already exists: ${path.relative(flintRoot, notePath)}`);
    throw error;
  }
  if (json) {
    console.log(JSON.stringify({
      ok: true, kind: 'note', name: title,
      created: [path.relative(flintRoot, notePath).split(path.sep).join('/')],
      updated: [], warnings: [], next: [], section: found.name, id,
    }));
  } else {
    console.log(notePath);
  }
}

try {
  main();
} catch (error) {
  fail('NOTE_CREATE_FAILED', error.message);
}
