#!/usr/bin/env node
// Create a note in the folder of its section, with the section tag, in one
// transaction of the mesh CLI (`mesh create --section`). The default section is New.
// Invocation: flint shard ie note "<Title>" [--section <section>] [options]

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { parseArgs } = require('util');

const { spawnSync } = require('child_process');

const flintRoot = process.env.FLINT_ROOT || process.cwd();

function fail(code, reason, next = []) {
  throw Object.assign(new Error(reason), { scriptCode: code, next });
}

function meshCommand() {
  const bin = (process.env.MESH_BIN || '').trim();
  if (!bin) return ['mesh'];
  return bin.endsWith('.js') ? [process.execPath, bin] : [bin];
}

function requireMeshRoot() {
  if (!fs.existsSync(path.join(flintRoot, 'mesh.json'))) {
    fail('MESH_ROOT_MISSING', `This Flint has no mesh root (no mesh.json in ${flintRoot}).`, [`mesh init ${JSON.stringify(flintRoot)}`]);
  }
}

// Run one mesh command with --json. Returns the parsed output lines.
function mesh(args, input) {
  requireMeshRoot();
  const [command, ...prefix] = meshCommand();
  const run = spawnSync(command, [...prefix, ...args, '--root', flintRoot, '--json'], {
    encoding: 'utf8',
    input,
    maxBuffer: 256 * 1024 * 1024,
  });
  if (run.error) {
    fail('MESH_CLI_MISSING', `Cannot run the mesh CLI (${command}): ${run.error.message}. Install it, or set MESH_BIN.`);
  }
  const lines = run.stdout.split('\n').filter((line) => line.trim().startsWith('{')).map((line) => JSON.parse(line));
  return { status: run.status, lines, stderr: run.stderr };
}

// The data of one mesh command, or a failure with its reason and next commands.
function meshResult(args, input) {
  const { status, lines, stderr } = mesh(args, input);
  const envelope = lines[lines.length - 1];
  if (status === 0 && envelope && envelope.ok) return envelope;
  if (envelope && /Unknown command/i.test(envelope.reason || '')) {
    fail('MESH_CLI_OLD', `The mesh CLI has no "${args.slice(0, 2).join(' ')}" command. Install the mesh CLI with the section and group commands.`);
  }
  fail(envelope ? envelope.code : 'MESH_FAILED', envelope ? envelope.reason : (stderr || `mesh exited ${status}`).trim(), (envelope && envelope.next) || []);
}

// The data of an atomic batch (one envelope per request), or the reason of the first failed request.
function meshBatch(requests) {
  const { status, lines, stderr } = mesh(['batch', '--atomic'], requests.map((request) => JSON.stringify(request)).join('\n') + '\n');
  const envelope = lines[lines.length - 1];
  const results = (envelope && envelope.results) || [];
  if (status === 0 && results.length === requests.length && results.every((line) => line.ok)) return results;
  const failed = results.find((line) => !line.ok && line.code !== 'NOT_APPLIED' && line.code !== 'SKIPPED') || (envelope && !envelope.ok ? envelope : undefined);
  if (failed && /unknown command/i.test(failed.reason || '')) {
    fail('MESH_CLI_OLD', 'The mesh CLI has no section or group commands. Install the mesh CLI with the section and group commands.');
  }
  fail(failed ? failed.code : 'MESH_FAILED', failed ? failed.reason : (stderr || `mesh batch exited ${status}`).trim(), (failed && failed.next) || []);
}

// Print a failure: one JSON object with --json, else the reason and the next commands. Exit 1.
function report(error, json, kind) {
  const code = error.scriptCode || 'SCRIPT_FAILED';
  if (json) {
    console.log(JSON.stringify({ ok: false, kind, code, reason: error.message, created: [], next: error.next || [] }));
  } else {
    console.error(error.message);
    for (const command of error.next || []) console.error(command);
  }
  process.exitCode = 1;
}

const args = process.argv.slice(2);
const optionArgs = args.includes('--') ? args.slice(0, args.indexOf('--')) : args;
const json = optionArgs.includes('--json');
const usage = 'Usage: flint shard ie note "<Title>" [--section <section>] [--description <text>] [--body-file <path>] [--author <Name>] [--session <id>] [--json]';
const help = `${usage}
       flint shard ie note --title "<Title>" [options]

The default section is New. A <section> is the section name, the key, or the
header title. The note goes into the folder of its section and gets the section
tag (mesh create --section). The mesh CLI refuses a title or case collision
anywhere in the mesh, and expands the tokens {{id}}, {{date}}, {{title}},
{{number}}, {{author}}, and {{session}} in the content.
The default author is FLINT_OPERATOR_NAME from the CLI.
Without it, read name in $NUU_HOME/config.toml (or ~/.nuucognition/config.toml).
The default session is ORBH_SESSION_ID. Use --help or -h to show this help.
The mesh CLI is MESH_BIN, else mesh on the PATH.`;

function usageError(reason) {
  fail('USAGE', `${reason}\n${usage}`);
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
  if (values.title !== undefined ? positionals.length !== 0 : positionals.length !== 1) {
    usageError('Supply one title. Use --section for the section.');
  }
  const section = (values.section ?? 'New').trim();
  const title = (values.title ?? positionals[0]).trim();
  if (!title || /[\x00-\x1f\x7f]/.test(title)) usageError('The title must have text and no control characters.');
  if (!section) usageError('The section must have text.');
  for (const key of ['body-file', 'author', 'session']) {
    if (values[key] !== undefined && !values[key].trim()) usageError(`--${key} needs a value with text.`);
  }

  // Keep the old filename rule: a slash or a backslash in the title becomes "-".
  const safeTitle = title.replace(/[/\\]/g, '-');
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
  const lines = ['---', `id: ${quote(id)}`, 'tags:', '  - "#note"', `description: ${quote(values.description ?? '')}`];
  if (author) lines.push('authors:', `  - ${quote(`[[@${author}]]`)}`);
  if (session) lines.push('orbh-sessions:', `  - ${quote(`[[${session}]]`)}`);
  lines.push('template: "[[tmp-ie-note-v0.2]]"', `created: ${today}`, `modified: ${today}`, '---', '', `# ${title}`, '', '');
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'ie-note-'));
  const contentFile = path.join(folder, 'note.md');
  let created;
  try {
    fs.writeFileSync(contentFile, lines.join('\n') + body, 'utf8');
    created = meshResult(['create', safeTitle, '--section', section, '--content-file', contentFile]);
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
  if (json) {
    console.log(JSON.stringify({
      ok: true, kind: 'note', name: title, created: [created.path], updated: [], warnings: [], next: [],
      section: created.section ?? section, id,
    }));
  } else {
    console.log(path.join(flintRoot, created.path));
  }
}

try {
  main();
} catch (error) {
  report(error, json, 'note');
}
