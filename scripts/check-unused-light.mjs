#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const required = ['generate.js', 'build.js', 'main.js', 'lead-forms.js', 'styles.css', 'pages.css', 'site-overrides.css'];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Required files missing: ${missing.join(', ')}`);
  process.exit(1);
}
console.log('Light unused/required-file check passed.');
