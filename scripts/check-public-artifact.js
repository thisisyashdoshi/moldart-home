#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public-site');

const failures = [];

function fail(message) {
  failures.push(message);
}

function exists(relPath) {
  return fs.existsSync(path.join(PUBLIC, relPath));
}

function read(relPath) {
  return fs.readFileSync(path.join(PUBLIC, relPath), 'utf8');
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    if (entry.isFile()) files.push(full);
  }
  return files;
}

if (!fs.existsSync(PUBLIC)) {
  fail('public-site/ is missing; run npm run build first.');
} else {
  const forbiddenTopLevel = ['trade-portal', 'functions', 'netlify', 'node_modules'];
  for (const relPath of forbiddenTopLevel) {
    if (exists(relPath)) fail(`public-site/${relPath} must not be published.`);
  }

  const portalDir = path.join(PUBLIC, 'portal');
  const portalEntries = fs.existsSync(portalDir) ? fs.readdirSync(portalDir) : [];
  const unexpectedPortalEntries = portalEntries.filter((entry) => entry !== 'index.html');
  if (!portalEntries.includes('index.html')) fail('public-site/portal/index.html is missing.');
  for (const entry of unexpectedPortalEntries) {
    fail(`public-site/portal/${entry} should not exist in the public artifact.`);
  }

  const privateOwsRoutes = [
    'open-wood-science/admin',
    'open-wood-science/internal-control',
    'open-wood-science/reviewer-intake',
  ];
  for (const relPath of privateOwsRoutes) {
    if (exists(relPath)) fail(`public-site/${relPath} must stay private.`);
  }

  const redirects = exists('_redirects') ? read('_redirects') : '';
  const requiredRedirects = [
    [/^\/portal\/sign-in\s+\/portal\/\s+302$/m, '/portal/sign-in -> /portal/'],
    [/^\/portal\/dashboard\s+\/portal\/\s+302$/m, '/portal/dashboard -> /portal/'],
    [/^\/portal\/catalog\s+\/portal\/\s+302$/m, '/portal/catalog -> /portal/'],
    [/^\/portal\/rfq\s+\/portal\/\s+302$/m, '/portal/rfq -> /portal/'],
    [
      /^\/open-wood-science\/admin\/\*\s+\/open-wood-science\/\s+302$/m,
      '/open-wood-science/admin/* -> /open-wood-science/',
    ],
    [
      /^\/open-wood-science\/internal-control\/\*\s+\/open-wood-science\/\s+302$/m,
      '/open-wood-science/internal-control/* -> /open-wood-science/',
    ],
    [
      /^\/open-wood-science\/reviewer-intake\/\*\s+\/open-wood-science\/contribute\/\s+302$/m,
      '/open-wood-science/reviewer-intake/* -> /open-wood-science/contribute/',
    ],
  ];
  for (const [pattern, label] of requiredRedirects) {
    if (!pattern.test(redirects)) fail(`_redirects is missing required boundary redirect: ${label}`);
  }

  const forbiddenPublicPhrases = [
    /Moldart Ops/i,
    /Internal Ops/i,
    /internal users/i,
    /mock payment/i,
    /API adapter/i,
    /permission matrix/i,
    /margin reconciliation/i,
  ];
  const publicTextFiles = walk(PUBLIC).filter((file) => /\.(html|txt|xml|json|js|css)$/i.test(file));
  for (const file of publicTextFiles) {
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of forbiddenPublicPhrases) {
      if (pattern.test(text)) {
        fail(`${path.relative(PUBLIC, file).replace(/\\/g, '/')} contains forbidden public phrase: ${pattern}`);
      }
    }
  }
}

console.log(`Public artifact boundary checks: ${failures.length} failure(s)`);
if (failures.length) {
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}
