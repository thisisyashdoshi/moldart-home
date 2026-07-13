#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOCK = path.join(ROOT, 'package-lock.json');

const allowed = [
  /MIT/i,
  /ISC/i,
  /BSD/i,
  /Apache-?2\.0/i,
  /Artistic-?2\.0/i,
  /CC-BY-?3\.0/i,
  /MPL-?2\.0/i,
  /LGPL-?3\.0/i,
  /CC0-?1\.0/i,
  /0BSD/i,
  /Unlicense/i,
  /WTFPL/i,
  /BlueOak/i,
  /Python-?2\.0/i,
];

const forbidden = [/UNLICENSED/i, /PROPRIETARY/i, /Commercial/i];

if (!fs.existsSync(LOCK)) {
  console.error('package-lock.json is missing; run npm install to create a reproducible dependency inventory.');
  process.exit(1);
}

const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
const packages = lock.packages || {};
const unknown = [];
const blocked = [];
const seenLicenses = new Map();

function licenseFromPackageJson(lockPath) {
  const packageJson = path.join(ROOT, lockPath, 'package.json');
  if (!fs.existsSync(packageJson)) return '';
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    return String(
      pkg.license ||
        (Array.isArray(pkg.licenses)
          ? pkg.licenses
              .map((item) => item.type || item)
              .filter(Boolean)
              .join(' OR ')
          : '')
    ).trim();
  } catch (_) {
    return '';
  }
}

for (const [name, info] of Object.entries(packages)) {
  if (!name || !name.startsWith('node_modules/')) continue;
  const license = String(
    info.license ||
      (Array.isArray(info.licenses)
        ? info.licenses
            .map((item) => item.type || item)
            .filter(Boolean)
            .join(' OR ')
        : '') ||
      licenseFromPackageJson(name)
  ).trim();
  if (license) seenLicenses.set(license, (seenLicenses.get(license) || 0) + 1);

  if (!license) {
    unknown.push(name.replace(/^node_modules\//, ''));
    continue;
  }

  if (forbidden.some((pattern) => pattern.test(license))) {
    blocked.push(`${name.replace(/^node_modules\//, '')}: ${license}`);
    continue;
  }

  if (!allowed.some((pattern) => pattern.test(license))) {
    unknown.push(`${name.replace(/^node_modules\//, '')}: ${license}`);
  }
}

console.log(`Dependency license entries checked: ${Object.keys(packages).length - 1}`);
console.log(`License families seen: ${seenLicenses.size}`);
console.log(`Unknown/non-standard license entries: ${unknown.length}`);
console.log(`Blocked/proprietary license entries: ${blocked.length}`);

if (unknown.length) {
  console.log('Unknown/non-standard license sample:');
  for (const item of unknown.slice(0, 20)) console.log(`- ${item}`);
}

if (blocked.length) {
  console.error('Blocked/proprietary dependency licenses:');
  for (const item of blocked) console.error(`- ${item}`);
  process.exit(1);
}
