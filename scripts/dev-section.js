#!/usr/bin/env node
// Create a mesh section: the section folder "(Section) <Name>/" and its header
// "(Section) <Name>.md", in one transaction of the mesh CLI (`mesh section create`,
// then the header fields and body of tmp-ie-section-v0.2). The folder has meaning:
// the members of the section are in it. The parent folder is --in
// (mesh-root-relative), else [sections] folder of mesh.toml.
// Invocation: flint shard ie section "<Name>" [--in <folder>] [--kind open|closed] [--description <text>] [--json]
// Outputs: the path of the header (or one JSON object with --json).

const fs = require('fs');
const path = require('path');
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

// The shape of an Orbh session id: 8-4-4-4-12 hex.
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The org of [flint] in flint.toml, or '' when the Flint has no org (a local Flint).
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

// The address of ORBH_SESSION_ID for orb: (NUU Orbh Mission 027): the `by` of `flint address me --json`.
// A CLI with no `flint address me` gives the short form @v1/<org>/session/<uuid>.
// No session gives null. A session that is not a UUID gives a warning and null (no stamp).
// The script never parses an address.
function sessionAddress() {
  const session = process.env.ORBH_SESSION_ID;
  if (!session) return null;
  const id = session.trim().toLowerCase();
  if (!SESSION_ID.test(id)) {
    process.stderr.write(`warning: ORBH_SESSION_ID ${JSON.stringify(session)} is not a session UUID: no orb stamp\n`);
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
      // The output is not v1 JSON: use the short form.
    }
  }
  return `@v1/${flintOrg()}/session/${id}`;
}

const usage = 'Usage: flint shard ie section "<Name>" [--in <folder>] [--kind open|closed] [--description <text>] [--json]';
const help = `${usage}

Create the section folder and its header in one transaction (mesh section create).
A name has words of letters and digits. Each word starts with a capital letter or a
digit. One space separates two words. 1 to 64 characters, no hyphen or other
punctuation. The key is the name in lowercase with "-" between the words.
The parent folder is --in (mesh-root-relative), else [sections] folder of mesh.toml.
The header stamps ORBH_SESSION_ID in orb: (flint address me).
The mesh CLI is MESH_BIN, else mesh on the PATH.`;

const json = process.argv.includes('--json');

function main() {
  let parsed;
  try {
    parsed = parseArgs({
      args: process.argv.slice(2),
      allowPositionals: true,
      options: {
        in: { type: 'string' },
        kind: { type: 'string' },
        description: { type: 'string' },
        json: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (error) {
    fail('USAGE', `${error.message}\n${usage}`);
  }
  const { values, positionals } = parsed;
  if (values.help) {
    console.log(help);
    return;
  }
  if (positionals.length !== 1 || !positionals[0].trim()) fail('USAGE', `Supply one section name.\n${usage}`);
  const name = positionals[0].trim().replace(/^\(Section\)\s*/, '');
  if (values.kind !== undefined && values.kind !== 'open' && values.kind !== 'closed') {
    fail('USAGE', `--kind is open or closed, not "${values.kind}".\n${usage}`);
  }
  const header = `(Section) ${name}`;
  const today = new Date().toISOString().slice(0, 10);
  // The orb: stamp goes into the props.set request, after section.create in the same atomic batch.
  // The header is a new file, so it has no stamp yet, and the stamp has one item. The script writes
  // no orbh-sessions. It asks the CLI for the address before the batch: the lock of the batch stays
  // short. A Flint with no mesh root stops before the CLI call. orb comes first, so that the new key
  // is before template in the header.
  requireMeshRoot();
  const address = sessionAddress();
  const fields = [];
  if (address) fields.push(`orb=${JSON.stringify([address])}`);
  fields.push(`template=[[tmp-ie-section-v0.2]]`, `created=${today}`, `modified=${today}`);
  const body = `\n# ${name}\n\n> Context envelope: what a mind must already hold to read the members of this section.\n\n## Navigation\n\n`;
  const [created] = meshBatch([
    {
      cmd: 'section.create',
      args: {
        _: [name],
        ...(values.in !== undefined ? { in: values.in } : {}),
        ...(values.kind !== undefined ? { kind: values.kind } : {}),
        ...(values.description !== undefined ? { description: values.description } : {}),
      },
    },
    { cmd: 'props.set', args: { _: [header, ...fields] } },
    { cmd: 'update', args: { _: [header], text: body } },
  ]);
  if (json) {
    console.log(JSON.stringify({
      ok: true, kind: 'section', name, key: created.key, folder: created.folder,
      created: [created.path], updated: [], warnings: [], next: [`flint shard ie load ${JSON.stringify(name)}`],
    }));
  } else {
    console.log(path.join(flintRoot, created.path));
  }
}

try {
  main();
} catch (error) {
  report(error, json, 'section');
}
