#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const STANDARD_PATH = path.join(__dirname, '..', 'data', 'online-presence-standard.json');
const standard = JSON.parse(fs.readFileSync(STANDARD_PATH, 'utf8'));
const TIMEOUT_MS = Number(process.env.PRESENCE_TIMEOUT_MS || 15000);
const CONCURRENCY = Number(process.env.PRESENCE_CONCURRENCY || 8);
const CORE_ONLY = process.env.PRESENCE_CORE_ONLY === '1';

function titleFrom(html = '') {
  const match = String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

async function fetchTarget(target) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(target.url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; MoldartPresenceCheck/1.0; +https://moldartindia.com/)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
      },
    });
    const text = await response.text();
    const expectedTexts = Array.isArray(target.expected_texts)
      ? target.expected_texts
      : [target.expected_text].filter(Boolean);
    const normalizedText = text.toLowerCase();
    const missingExpected = expectedTexts
      .map((value) => String(value || '').trim())
      .filter((value) => value && !normalizedText.includes(value.toLowerCase()));
    const hasExpected = missingExpected.length === 0;
    const tunnelError = /cloudflare tunnel error|error 1033/i.test(text);
    return {
      label: target.label,
      url: target.url,
      kind: target.kind,
      critical: Boolean(target.critical),
      status: response.status,
      ok: response.ok && hasExpected && !tunnelError && !target.requires_manual_review,
      expected_found: hasExpected,
      missing_expected: missingExpected,
      cloudflare_1033: tunnelError,
      manual_review: Boolean(target.requires_manual_review),
      review_note: target.review_note || '',
      title: titleFrom(text),
    };
  } catch (error) {
    return {
      label: target.label,
      url: target.url,
      kind: target.kind,
      critical: Boolean(target.critical),
      status: null,
      ok: false,
      expected_found: false,
      missing_expected: Array.isArray(target.expected_texts)
        ? target.expected_texts
        : [target.expected_text].filter(Boolean),
      cloudflare_1033: false,
      manual_review: Boolean(target.requires_manual_review),
      review_note: target.review_note || '',
      error: error.name === 'AbortError' ? `timeout after ${TIMEOUT_MS}ms` : error.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; MoldartPresenceCheck/1.0; +https://moldartindia.com/)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
      },
    });
    return response.ok ? await response.text() : '';
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function pathLabel(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname === '/' ? 'homepage' : parsed.pathname.replace(/^\/|\/$/g, '') || 'homepage';
  } catch {
    return url;
  }
}

async function sitemapTargets(existingUrls) {
  if (CORE_ONLY) {
    return [];
  }

  const sitemapUrl = new URL('/sitemap.xml', standard.canonical.website).href;
  const xml = await fetchText(sitemapUrl);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)]
    .map((match) => match[1].trim())
    .filter((url) => url.startsWith(standard.canonical.website))
    .filter((url) => !existingUrls.has(url));

  return urls.map((url) => ({
    label: `Owned sitemap ${pathLabel(url)}`,
    url,
    kind: 'owned-site-sitemap',
    critical: false,
    expected_text: standard.canonical.brand,
  }));
}

async function runPool(targets) {
  const results = new Array(targets.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, targets.length) }, async () => {
    while (cursor < targets.length) {
      const index = cursor;
      cursor += 1;
      const result = await fetchTarget(targets[index]);
      results[index] = result;
      printResult(result);
    }
  });
  await Promise.all(workers);
  return results;
}

function printResult(result) {
  const state = result.ok ? 'OK' : 'CHECK';
  const status = result.status === null ? 'no-status' : result.status;
  const detail = result.review_note || result.error || result.title || result.url;
  console.log(`${state.padEnd(5)} ${String(status).padEnd(9)} ${result.label} - ${detail}`);
}

(async () => {
  console.log(`Online presence standard: ${standard.version}`);
  console.log(`Canonical brand: ${standard.canonical.brand} | ${standard.canonical.website}`);
  console.log('');

  const existingUrls = new Set(standard.watch_targets.map((target) => target.url));
  const expandedTargets = await sitemapTargets(existingUrls);
  const targets = [...standard.watch_targets, ...expandedTargets];
  const results = await runPool(targets);

  const summary = {
    checked_at: new Date().toISOString(),
    mode: CORE_ONLY ? 'core' : 'broad',
    total: results.length,
    core_watch_targets: standard.watch_targets.length,
    owned_sitemap_targets: expandedTargets.length,
    external_watch_targets: standard.watch_targets.filter(
      (target) => !target.url.startsWith(standard.canonical.website)
    ).length,
    ok: results.filter((result) => result.ok).length,
    needs_check: results.filter((result) => !result.ok).length,
    critical_failures: results.filter((result) => result.critical && !result.ok).map((result) => result.label),
    send_gate_healthy: results.filter((result) => result.kind === 'send-gate').every((result) => result.ok),
    cloudflare_1033: results.filter((result) => result.cloudflare_1033).map((result) => result.label),
    manual_review: results.filter((result) => result.manual_review).map((result) => result.label),
    watch_items: results
      .filter((result) => !result.ok)
      .map((result) => ({
        label: result.label,
        status: result.status,
        url: result.url,
        reason:
          result.review_note || result.error || (result.expected_found ? 'non-OK response' : 'expected text not found'),
        missing_expected: result.missing_expected || [],
      })),
  };

  console.log('');
  console.log(JSON.stringify(summary, null, 2));

  if (process.env.PRESENCE_STRICT === '1' && summary.critical_failures.length) {
    process.exitCode = 1;
  }
})();
