#!/usr/bin/env node
// Load a mesh section into context: print its header, then the member scent
// list, from the mesh CLI (`mesh section show`). A <section> is the section
// name, the key, or the header title.
// Invocation: flint shard ie load "<Section>" [--json]
// Outputs: the header (when one exists), then a generated "## Members" section.

const fs = require('fs');
const path = require('path');

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

// The result of one mesh command, or a failure with its message and next commands.
function meshResult(args, input) {
  const { status, lines, stderr } = mesh(args, input);
  const envelope = lines[lines.length - 1];
  if (status === 0 && envelope && envelope.ok) return envelope.result;
  if (envelope && /Unknown command/i.test(envelope.message || '')) {
    fail('MESH_CLI_OLD', `The mesh CLI has no "${args.slice(0, 2).join(' ')}" command. Install the mesh CLI with the section and group commands.`);
  }
  fail(envelope ? envelope.code : 'MESH_FAILED', envelope ? envelope.message : (stderr || `mesh exited ${status}`).trim(), (envelope && envelope.next) || []);
}

// The results of an atomic batch (one per request), or a failure with the message of the first failed request.
function meshBatch(requests) {
  const { status, lines, stderr } = mesh(['batch', '--atomic'], requests.map((request) => JSON.stringify(request)).join('\n') + '\n');
  const envelope = lines[lines.length - 1];
  const results = (envelope && envelope.result && envelope.result.results) || [];
  if (status === 0 && results.length === requests.length && results.every((line) => line.ok)) return results.map((line) => line.result);
  const failed = results.find((line) => !line.ok && line.code !== 'NOT_APPLIED' && line.code !== 'SKIPPED') || (envelope && !envelope.ok ? envelope : undefined);
  if (failed && /unknown command/i.test(failed.message || '')) {
    fail('MESH_CLI_OLD', 'The mesh CLI has no section or group commands. Install the mesh CLI with the section and group commands.');
  }
  fail(failed ? failed.code : 'MESH_FAILED', failed ? failed.message : (stderr || `mesh batch exited ${status}`).trim(), (failed && failed.next) || []);
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

const json = process.argv.includes('--json');

function main() {
  const argument = process.argv.slice(2).filter((arg) => arg !== '--json');
  if (argument.length !== 1 || !argument[0].trim()) {
    fail('USAGE', 'Usage: flint shard ie load "<Section>" [--json]');
  }
  const section = meshResult(['section', 'show', argument[0].trim()]);
  const header = section.headerPath !== null ? fs.readFileSync(path.join(flintRoot, section.headerPath), 'utf8').trimEnd() : null;
  const members = section.members.filter((member) => member.title !== section.header);
  if (json) {
    console.log(JSON.stringify({ ok: true, kind: 'load', key: section.key, name: section.name, sectionKind: section.kind, header, members }));
    return;
  }
  console.log(header ?? `# ${section.name}\n\n_(no header: the folder ${section.folder} has no "(Section) ${section.name}.md")_`);
  console.log('\n## Members\n');
  if (members.length === 0) {
    console.log('_(no members yet)_');
    return;
  }
  for (const member of members) {
    console.log(member.description ? `- [[${member.title}]] — ${member.description}` : `- [[${member.title}]]`);
  }
}

try {
  main();
} catch (error) {
  report(error, json, 'load');
}
