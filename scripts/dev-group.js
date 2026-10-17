#!/usr/bin/env node
// Create a mesh group definition "(Group) <Name>.md" with its own group tag, in
// one transaction of the mesh CLI (`mesh group create`, then the fields and body of
// tmp-ie-group-v0.2). The definition is optional: the group tag is the only
// authority for membership.
// Invocation: flint shard ie group "<Name>" [--description <text>] [--json]
// Outputs: the path of the definition (or one JSON object with --json).

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

const usage = 'Usage: flint shard ie group "<Name>" [--description <text>] [--json]';
const json = process.argv.includes('--json');

function main() {
  let parsed;
  try {
    parsed = parseArgs({
      args: process.argv.slice(2),
      allowPositionals: true,
      options: { description: { type: 'string' }, json: { type: 'boolean' } },
    });
  } catch (error) {
    fail('USAGE', `${error.message}\n${usage}`);
  }
  const { values, positionals } = parsed;
  if (positionals.length !== 1 || !positionals[0].trim()) fail('USAGE', `Supply one group name.\n${usage}`);
  const name = positionals[0].trim().replace(/^\(Group\)\s*/, '');
  const definition = `(Group) ${name}`;
  const today = new Date().toISOString().slice(0, 10);
  const fields = [`template=[[tmp-ie-group-v0.2]]`, `created=${today}`, `modified=${today}`];
  if (process.env.ORBH_SESSION_ID) fields.push(`orbh-sessions=${JSON.stringify([`[[${process.env.ORBH_SESSION_ID}]]`])}`);
  const [created] = meshBatch([
    { cmd: 'group.create', args: { _: [name], ...(values.description !== undefined ? { description: values.description } : {}) } },
    { cmd: 'props.set', args: { _: [definition, ...fields] } },
    { cmd: 'update', args: { _: [definition], text: `\n# ${name}\n\n` } },
  ]);
  if (json) {
    console.log(JSON.stringify({ ok: true, kind: 'group', name, key: created.key, created: [created.path], updated: [], warnings: [], next: [] }));
  } else {
    console.log(path.join(flintRoot, created.path));
  }
}

try {
  main();
} catch (error) {
  report(error, json, 'group');
}
