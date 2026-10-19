#!/usr/bin/env node
// Create a note beside its section header. The section tag defines membership.
// Invocation: flint shard ie note "<Title>" [--section <name>] [options]

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { parseArgs } = require('util');
const { setTimeout: delay } = require('timers/promises');

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
The default author is FLINT_OPERATOR_NAME from the CLI.
Without it, read name in $NUU_HOME/config.toml (or ~/.nuucognition/config.toml).
The default session is ORBH_SESSION_ID. The note stamps it in orb: (flint address me).
Use --help or -h to show this help.`;

function fail(code, reason, next = []) {
  throw Object.assign(new Error(reason), { noteCode: code, next });
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

// Read one TOML string. Other values need only lexical scanning below.
function tomlString(text, start) {
  const quote = text[start];
  const multiline = text.slice(start, start + 3) === quote.repeat(3);
  let index = start + (multiline ? 3 : 1);
  let value = '';
  if (multiline && text[index] === '\r') index++;
  if (multiline && text[index] === '\n') index++;
  while (index < text.length) {
    if (text[index] === quote) {
      let count = 1;
      while (text[index + count] === quote) count++;
      if (!multiline) return { value, end: index + 1 };
      if (count >= 3) return { value: value + quote.repeat(count - 3), end: index + count };
    }
    if (quote === '"' && text[index] === '\\') {
      index++;
      const continuation = multiline && text.slice(index).match(/^[ \t]*\r?\n[ \t\r\n]*/);
      if (continuation) {
        index += continuation[0].length;
        continue;
      }
      const escape = text[index++];
      if (escape === 'u' || escape === 'U') {
        const length = escape === 'u' ? 4 : 8;
        const digits = text.slice(index, index + length);
        if (!new RegExp(`^[0-9a-fA-F]{${length}}$`).test(digits)) throw new Error('Invalid TOML Unicode escape.');
        value += String.fromCodePoint(parseInt(digits, 16));
        index += length;
      } else {
        const escapes = { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', '"': '"', '\\': '\\' };
        if (!(escape in escapes)) throw new Error('Invalid TOML escape.');
        value += escapes[escape];
      }
    } else {
      if (!multiline && /[\r\n]/.test(text[index])) throw new Error('Invalid TOML string.');
      value += text[index++];
    }
  }
  throw new Error('Unclosed TOML string.');
}

// Skip strings and nested values before looking for a top-level Name.
function nameFromToml(config) {
  let depth = 0;
  let lineStart = true;
  for (let index = 0; index < config.length;) {
    const character = config[index];
    if (character === '\n') { lineStart = true; index++; continue; }
    if (/[ \t\r]/.test(character)) { index++; continue; }
    if (character === '#') {
      const end = config.indexOf('\n', index);
      index = end < 0 ? config.length : end;
      continue;
    }
    if (lineStart && depth === 0) {
      if (character === '[') break;
      const key = config.slice(index).match(/^(?:name|"name"|'name')[ \t]*=[ \t]*/);
      if (key) {
        const start = index + key[0].length;
        return /["']/.test(config[start] || '') ? tomlString(config, start).value.trim() : '';
      }
    }
    lineStart = false;
    if (character === '"' || character === "'") index = tomlString(config, index).end;
    else {
      if (character === '[' || character === '{') depth++;
      if (character === ']' || character === '}') depth--;
      index++;
    }
  }
  return '';
}

function operatorName() {
  if (process.env.FLINT_OPERATOR_NAME !== undefined) return process.env.FLINT_OPERATOR_NAME.trim();
  try {
    const home = process.env.NUU_HOME || path.join(os.homedir(), '.nuucognition');
    return nameFromToml(fs.readFileSync(path.join(home, 'config.toml'), 'utf8'));
  } catch {
    // An absent or unreadable Name has no author.
    return '';
  }
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

// The address of the session for orb: (NUU Orbh Mission 027): the `by` of `flint address me --json`.
// A CLI with no `flint address me` gives the short form @v1/<org>/session/<uuid>. Never parse an address.
function sessionAddress(session) {
  const id = String(session).trim().toLowerCase();
  if (!SESSION_ID.test(id)) {
    process.stderr.write(`warning: session ${JSON.stringify(session)} is not a session UUID: no orb stamp\n`);
    return null;
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
  if (!result.error && result.status === 0) {
    try {
      const { by } = JSON.parse(result.stdout);
      if (typeof by === 'string' && by.startsWith('@v1/') && !/\s/.test(by)) return by;
    } catch {
      // No v1 text: use the short form.
    }
  }
  return `@v1/${flintOrg()}/session/${id}`;
}

// One key for the lock and the duplicate check. Use the complete filename:
// lower case depends on context (Greek final sigma), so "ΟΣ" and "ΟΣ.md" differ.
function titleKey(filename) {
  return filename.normalize('NFC').toLowerCase().normalize('NFC');
}

function existingNote(files, key) {
  const existing = files.find((file) => titleKey(path.basename(file)) === key);
  if (existing) fail('NOTE_EXISTS', `Note already exists: ${path.relative(flintRoot, existing)}`);
}

async function lockTitle(key) {
  const hash = crypto.createHash('sha256').update(key).digest('hex').slice(0, 32);
  const lock = path.join(flintRoot, '.flint', 'locks', `note-${hash}`);
  fs.mkdirSync(path.dirname(lock), { recursive: true });
  const deadline = Date.now() + 10000;
  while (true) {
    try {
      fs.mkdirSync(lock);
      const owned = fs.statSync(lock);
      const isOwner = () => {
        try {
          const current = fs.statSync(lock);
          return current.dev === owned.dev && current.ino === owned.ino && current.birthtimeMs === owned.birthtimeMs;
        } catch (error) {
          if (error.code === 'ENOENT') return false;
          throw error;
        }
      };
      return {
        assertHeld() {
          if (!isOwner() || Date.now() - owned.mtimeMs > 60000) {
            fail('NOTE_CREATE_FAILED', 'The note lock expired. Run the command again.');
          }
        },
        release() { if (isOwner()) fs.rmdirSync(lock); },
      };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    try {
      if (Date.now() - fs.statSync(lock).mtimeMs > 60000) {
        fs.rmdirSync(lock);
        continue;
      }
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (Date.now() >= deadline) {
      existingNote([...walkMarkdown(meshDir)], key);
      fail('NOTE_CREATE_FAILED', 'Another process is creating this note. Run the command again.');
    }
    await delay(25);
  }
}

// JSON strings are YAML double-quoted scalars. Escape YAML line separators too.
function quote(value) {
  return JSON.stringify(value).replace(/[\u0085\u2028\u2029]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

async function main() {
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

  // Ask the CLI for the address before the lock: the lock stays short.
  const session = values.session ?? process.env.ORBH_SESSION_ID;
  const address = session ? sessionAddress(session) : null;

  // Keep the old filename rule. Lock the same title in every Mesh section.
  const safeTitle = title.replace(/[/\\]/g, '-');
  const filename = `${safeTitle}.md`;
  const key = titleKey(filename);
  const lock = await lockTitle(key);
  let result;
  try {
    const files = [...walkMarkdown(meshDir)];
    const found = findHeader(files, sectionArg);
    if (!found) {
      fail('SECTION_NOT_FOUND', `No such section: ${sectionArg}.`,
        [`flint shard ie section ${quote(cleanName(sectionArg))}`]);
    }
    existingNote(files, key);

    let body = '';
    if (values['body-file'] !== undefined) {
      try {
        body = fs.readFileSync(values['body-file'], 'utf8');
      } catch (error) {
        fail('BODY_READ_FAILED', `Cannot read body file: ${error.message}`);
      }
    }
    const author = values.author === undefined ? operatorName() : values.author.trim();
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
    if (address) lines.push('orb:', `  - ${quote(address)}`);
    lines.push('template: "[[tmp-ie-note-v0.1]]"', `created: ${today}`, `modified: ${today}`, '---', '', `# ${title}`, '', '');
    const note = lines.join('\n') + body;
    const notePath = path.join(path.dirname(found.file), filename);
    try {
      lock.assertHeld();
      fs.writeFileSync(notePath, note, { encoding: 'utf8', flag: 'wx' });
    } catch (error) {
      if (error.code === 'EEXIST') fail('NOTE_EXISTS', `Note already exists: ${path.relative(flintRoot, notePath)}`);
      throw error;
    }
    if (json) {
      result = JSON.stringify({
        ok: true, kind: 'note', name: title,
        created: [path.relative(flintRoot, notePath).split(path.sep).join('/')],
        updated: [], warnings: [], next: [], section: found.name, id,
      });
    } else {
      result = notePath;
    }
  } finally {
    lock.release();
  }
  console.log(result);
}

main().catch((error) => {
  const code = error.noteCode || 'NOTE_CREATE_FAILED';
  const reason = error.message;
  const next = error.next || [];
  if (json) {
    console.log(JSON.stringify({ ok: false, kind: 'note', code, reason, created: [], next }));
  } else {
    console.error(reason);
    for (const command of next) console.error(command);
  }
  process.exitCode = 1;
});
