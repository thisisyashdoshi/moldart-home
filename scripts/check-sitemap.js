#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'sitemap.xml';

async function readTarget(input) {
  if (/^https?:\/\//i.test(input)) {
    const response = await fetch(input, { headers: { 'user-agent': 'MoldartReleaseCheck/1.0' } });
    if (!response.ok) throw new Error(`Failed to fetch ${input}: ${response.status}`);
    return response.text();
  }
  return fs.readFileSync(path.resolve(process.cwd(), input), 'utf8');
}

function parseLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()).filter(Boolean);
}

(async () => {
  const xml = await readTarget(target);
  const urls = parseLocs(xml);
  if (!urls.length) throw new Error('No <loc> entries found in sitemap.');

  const counts = new Map();
  for (const url of urls) counts.set(url, (counts.get(url) || 0) + 1);
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
  const htmlUrls = urls.filter((url) => /\.html(?:$|[?#])/i.test(url));
  const nonCanonicalTrailing = urls.filter(
    (url) => !/\/$/.test(new URL(url).pathname) && !/\.[a-z0-9]+$/i.test(new URL(url).pathname)
  );

  console.log(`Sitemap URLs: ${urls.length}`);
  console.log(`Unique URLs: ${counts.size}`);
  console.log(`Duplicate URLs: ${duplicates.length}`);

  if (htmlUrls.length) console.log(`HTML URLs in sitemap: ${htmlUrls.length}`);
  if (nonCanonicalTrailing.length) console.log(`Non-trailing-slash page URLs: ${nonCanonicalTrailing.length}`);

  if (duplicates.length) {
    for (const [url, count] of duplicates.slice(0, 20)) console.error(`Duplicate ${count}x: ${url}`);
    process.exit(1);
  }

  if (htmlUrls.length) {
    for (const url of htmlUrls.slice(0, 20)) console.error(`Unexpected .html URL: ${url}`);
    process.exit(1);
  }

  if (nonCanonicalTrailing.length) {
    for (const url of nonCanonicalTrailing.slice(0, 20)) console.error(`Missing trailing slash: ${url}`);
    process.exit(1);
  }
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
