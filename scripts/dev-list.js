#!/usr/bin/env node
// List every mesh section and mesh group with counts, from the mesh CLI
// (`mesh section list`, `mesh group list`).
// Invocation: flint shard ie list [--json]
// Outputs: the sections (with the unsectioned count), then the groups.

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

const json = process.argv.includes('--json');

function main() {
  const sections = meshResult(['section', 'list']);
  const groups = meshResult(['group', 'list']);
  if (json) {
    console.log(JSON.stringify({ ok: true, kind: 'list', sections: sections.sections, unsectioned: sections.unsectioned, groups: groups.groups }));
    return;
  }
  console.log('Sections');
  for (const row of sections.sections) {
    const header = row.header === null ? ' (no header)' : '';
    const problems = row.diagnostics > 0 ? `, ${row.diagnostics} diagnostic${row.diagnostics === 1 ? '' : 's'}` : '';
    console.log(`  ${row.name} [ie/sections/${row.key}] — ${row.kind}, ${row.members} member${row.members === 1 ? '' : 's'}, ${row.crossings} crossing link${row.crossings === 1 ? '' : 's'}${problems}${header}`);
  }
  console.log(`  (unsectioned) — ${sections.unsectioned} document${sections.unsectioned === 1 ? '' : 's'}`);
  if (groups.groups.length > 0) {
    console.log('Groups');
    for (const row of groups.groups) {
      const label = row.definition !== null ? row.definition.replace(/^\(Group\)\s*/, '') : `${row.key} (no definition)`;
      console.log(`  ${label} [ie/groups/${row.key}] — ${row.members} member${row.members === 1 ? '' : 's'}, ${row.sections} section${row.sections === 1 ? '' : 's'}, ${row.unsectioned} unsectioned`);
    }
  }
}

try {
  main();
} catch (error) {
  report(error, json, 'list');
}
