#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'data', 'search-index.json');
const items = JSON.parse(fs.readFileSync(file, 'utf8'));

if (!Array.isArray(items) || !items.length) {
  console.error('Search index is empty or invalid.');
  process.exit(1);
}

const required = ['group', 'title', 'url', 'meta'];
const allowedExternalHosts = new Set(['github.com']);
const failures = [];
const seen = new Set();

for (const [index, item] of items.entries()) {
  for (const key of required) {
    if (!String(item[key] || '').trim()) failures.push(`Entry ${index} missing ${key}`);
  }
  if (!/^\//.test(item.url || '')) {
    try {
      const url = new URL(item.url);
      if (url.protocol !== 'https:' || !allowedExternalHosts.has(url.hostname))
        failures.push(`Entry ${index} has non-approved external URL: ${item.url}`);
    } catch (_) {
      failures.push(`Entry ${index} has invalid URL: ${item.url}`);
    }
  }
  const dedupeKey = `${item.group}|${item.title}|${item.url}`.toLowerCase();
  if (seen.has(dedupeKey)) failures.push(`Duplicate search entry: ${dedupeKey}`);
  seen.add(dedupeKey);
}

console.log(`Search entries: ${items.length}`);
console.log(`Search check failures: ${failures.length}`);

if (failures.length) {
  for (const failure of failures.slice(0, 30)) console.error(failure);
  process.exit(1);
}
