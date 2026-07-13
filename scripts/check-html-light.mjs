#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const site = path.join(root, 'public-site');
const failures = [];
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}
for (const file of walk(site)) {
  const rel = path.relative(site, file).split(path.sep).join('/');
  const text = fs.readFileSync(file, 'utf8');
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(text);
  const h1 = (text.match(/<h1\b/gi) || []).length;
  const title = (text.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (text.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (rel !== '404.html' && !noindex && h1 !== 1) failures.push(`${rel}: h1=${h1}`);
  if (!noindex && (title.length < 10 || title.length > 75)) failures.push(`${rel}: title length ${title.length}`);
  if (!noindex && (desc.length < 50 || desc.length > 170)) failures.push(`${rel}: description length ${desc.length}`);
  for (const match of text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch (error) { failures.push(`${rel}: invalid JSON-LD ${error.message}`); }
  }
}
if (failures.length) {
  console.error(failures.slice(0, 100).join('\n'));
  process.exit(1);
}
console.log('HTML light check passed.');
