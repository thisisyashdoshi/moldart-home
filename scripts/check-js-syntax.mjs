#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const files = [
  'generate.js', 'build.js', 'main.js', 'lead-forms.js', 'preview-server.js', 'sw.js',
  'scripts/check-release.js', 'scripts/check-lighthouse.js', 'scripts/check-public-artifact.js',
  'scripts/moldart-artifact-release-gate.mjs', 'scripts/moldart-quality-monitor.mjs',
  'scripts/moldart-live-draft-compare.mjs', 'scripts/test-lead-intake.mjs',
  'functions/_shared/lead-intake-core.mjs', 'functions/_shared/lead-intake-handler.mjs',
  'tests/lead-intake-core.test.mjs'
].map((rel) => path.join(root, rel)).filter((file) => fs.existsSync(file));
const failures = [];
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', timeout: 10000 });
  if (result.status !== 0) failures.push(`${path.relative(root, file)}\n${result.stderr || result.stdout}`);
}
if (failures.length) {
  console.error(failures.join('\n---\n'));
  process.exit(1);
}
console.log(`JavaScript syntax check passed (${files.length} files).`);
