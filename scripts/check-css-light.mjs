#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const cssFiles = ['styles.css', 'pages.css', 'site-overrides.css'].map((f) => path.join(root, f));
const failures = [];
for (const file of cssFiles) {
  if (!fs.existsSync(file)) {
    failures.push(`${path.basename(file)} missing`);
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  const open = (text.match(/\{/g) || []).length;
  const close = (text.match(/\}/g) || []).length;
  if (open !== close) failures.push(`${path.basename(file)} brace mismatch ${open}/${close}`);
  if (/<<<<<<<|>>>>>>>/.test(text)) failures.push(`${path.basename(file)} merge conflict marker`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('CSS light check passed.');
