#!/usr/bin/env node
'use strict';

const fs = require('fs');
let chromium = null;
try {
  ({ chromium } = require('playwright'));
} catch (_) {
  ({ chromium } = require('playwright-core'));
}
const axe = require('@axe-core/playwright');

const AxeBuilder = axe.AxeBuilder || axe.default;
const base = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const paths = [
  '/',
  '/explore/',
  '/products/',
  '/solutions/',
  '/resources/',
  '/insights/',
  '/faq/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/terms/',
];

function pickExecutablePath() {
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

(async () => {
  const executablePath = pickExecutablePath();
  const browser = await chromium.launch(executablePath ? { headless: true, executablePath } : { headless: true });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const failures = [];

  for (const route of paths) {
    const url = `${base}${route}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    console.log(`${route} axe violations: ${results.violations.length}, serious/critical: ${serious.length}`);
    for (const violation of serious) failures.push(`${route} ${violation.id}: ${violation.help}`);
  }

  await browser.close();

  if (failures.length) {
    for (const failure of failures.slice(0, 30)) console.error(failure);
    process.exit(1);
  }
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
