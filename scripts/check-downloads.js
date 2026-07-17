#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const input = process.argv[2] || process.cwd();
const isRemote = /^https?:\/\//i.test(input);
const root = isRemote ? process.cwd() : path.resolve(process.cwd(), input);
const skipDirs = new Set([
  'node_modules',
  '.git',
  '.opencode',
  '.next',
  'trade-portal',
  'public-site',
  'astro-public',
  'pagefind',
  'reports',
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name), files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(path.join(dir, entry.name));
  }
  return files;
}

function extractDownloads(html, filePath) {
  const links = [];
  const anchorPattern = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = anchorPattern.exec(html))) {
    const tag = match[0];
    const href = match[1];
    if (
      /\bdownload\b/i.test(tag) ||
      /\bdata-gated-download=/i.test(tag) ||
      /^\/downloads\//i.test(href) ||
      /\/downloads\//i.test(href)
    ) {
      links.push({ href, filePath });
    }
  }
  return links;
}

async function remoteOk(url) {
  let response = await fetch(url, { method: 'HEAD', headers: { 'user-agent': 'MoldartDownloadCheck/1.0' } });
  if (response.status === 405 || response.status === 403) {
    response = await fetch(url, { method: 'GET', headers: { 'user-agent': 'MoldartDownloadCheck/1.0' } });
  }
  return response.ok;
}

(async () => {
  const htmlFiles = walk(root);
  const links = [];
  for (const file of htmlFiles) links.push(...extractDownloads(fs.readFileSync(file, 'utf8'), file));

  const unique = new Map();
  for (const link of links) {
    const base = isRemote
      ? input
      : `https://local.invalid/${path.relative(process.cwd(), path.dirname(link.filePath)).replace(/\\/g, '/')}/`;
    const url = new URL(link.href, base);
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') continue;
    unique.set(`${url.origin}${url.pathname}${url.search}`, { ...link, url });
  }

  const failures = [];
  for (const item of unique.values()) {
    if (isRemote || (/^https?:$/i.test(item.url.protocol) && item.url.hostname !== 'local.invalid')) {
      const absoluteUrl =
        item.url.hostname === 'local.invalid'
          ? new URL(item.url.pathname + item.url.search, input).toString()
          : item.url.toString();
      if (!(await remoteOk(absoluteUrl)))
        failures.push(`${absoluteUrl} referenced by ${path.relative(process.cwd(), item.filePath)}`);
      continue;
    }
    const localPath = path.join(root, decodeURIComponent(item.url.pathname.replace(/^\//, '')));
    if (!fs.existsSync(localPath) || !fs.statSync(localPath).isFile()) {
      failures.push(`${item.url.pathname} referenced by ${path.relative(process.cwd(), item.filePath)}`);
    }
  }

  console.log(`Download links checked: ${unique.size}`);
  console.log(`Download failures: ${failures.length}`);
  if (failures.length) {
    for (const failure of failures.slice(0, 30)) console.error(failure);
    process.exit(1);
  }
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
