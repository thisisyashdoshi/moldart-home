#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const files = [
  'package.json', 'generate.js', 'build.js', 'main.js', 'lead-forms.js', 'styles.css', 'pages.css', 'site-overrides.css',
  '_headers', '_redirects', 'robots.txt', 'site.webmanifest', 'wrangler.toml',
  '.github/workflows/quality.yml', '.github/workflows/links.yml',
];
const failures = [];
for (const rel of files) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  let text = '';
  try { text = fs.readFileSync(full, 'utf8'); } catch { continue; }
  if (/<<<<<<<|=======\n|>>>>>>>/.test(text)) failures.push(`${rel}: merge-conflict marker`);
  if (/\u0000/.test(text)) failures.push(`${rel}: NUL byte`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Light format check passed.');
