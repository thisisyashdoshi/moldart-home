#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (
        !['node_modules', '.git', '.opencode', '.next', 'trade-portal', 'public-site', 'pagefind', 'reports'].includes(
          entry.name
        )
      ) {
        walkHtml(path.join(dir, entry.name), files);
      }
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html') && !/-YASH-LAPTOP\.html$/i.test(entry.name))
      files.push(path.join(dir, entry.name));
  }
  return files;
}

const headers = read('_headers');
const redirects = read('_redirects');

const requiredCsp = [
  "default-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

for (const directive of requiredCsp) {
  if (!headers.includes(directive)) fail(`Missing CSP directive: ${directive}`);
}

if (!/\/portal\/\*\s+[\s\S]*?X-Robots-Tag:\s*noindex, nofollow, noarchive/i.test(headers)) {
  fail('Missing /portal/* noindex header.');
}

if (!/\/api\/\*\s+[\s\S]*?Cache-Control:\s*no-store/i.test(headers)) {
  fail('Missing /api/* no-store header.');
}

for (const route of ['/portal/sign-in', '/portal/dashboard', '/portal/catalog', '/portal/rfq', '/portal/orders']) {
  const pattern = new RegExp(route.replace(/\//g, '\\/') + '\\s+\\/portal\\/\\s+302');
  if (!pattern.test(redirects)) fail(`Missing portal collapse redirect for ${route}.`);
}

if (!/\/api\/lead-intake\s+\/\.netlify\/functions\/lead-intake\s+200/i.test(redirects)) {
  fail('Missing Netlify fallback rewrite for /api/lead-intake.');
}

const thirdPartyFormHost = /formsubmit\.co|formspree\.io/i;
if (thirdPartyFormHost.test(headers)) fail('Third-party form host remains in _headers.');
if (thirdPartyFormHost.test(read('generate.js'))) fail('Third-party form host remains in generate.js.');

const htmlOffenders = walkHtml(root).filter((file) => thirdPartyFormHost.test(fs.readFileSync(file, 'utf8')));
if (htmlOffenders.length) {
  for (const file of htmlOffenders.slice(0, 20)) fail(`Third-party form host remains in ${path.relative(root, file)}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log('Header and form checks passed.');
