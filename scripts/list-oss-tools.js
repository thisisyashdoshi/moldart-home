#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tools = [
  '@axe-core/playwright',
  'eslint',
  'prettier',
  'stylelint',
  'html-validate',
  'vitest',
  'secretlint',
  'linkinator',
  'lighthouse',
  'knip',
  'jscpd',
  'svgo',
  'pagefind',
  'sharp',
  'terser',
  'clean-css-cli',
];

for (const name of tools) {
  try {
    const packageJson = require.resolve(path.join(name, 'package.json'), { paths: [ROOT] });
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    console.log(`${name}@${pkg.version} (${pkg.license || 'license not declared in package.json'})`);
  } catch (error) {
    console.log(`${name}: not installed`);
  }
}
