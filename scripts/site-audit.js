#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
let chromium = null;
try {
  ({ chromium } = require('playwright'));
} catch (error) {
  console.error('Playwright is required to run scripts/site-audit.js');
  process.exit(1);
}

const BASE = process.argv[2] || 'http://127.0.0.1:4173';

function pickExecutablePath() {
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

async function main() {
  const executablePath = pickExecutablePath();
  const browser = await chromium.launch(executablePath ? { headless: true, executablePath } : { headless: true });
  const sitemapXml = await fetchText(`${BASE.replace(/\/$/, '')}/sitemap.xml`);
  const insightUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => /\/insights\//.test(url))
    .map((url) => url.replace('https://moldartindia.com', BASE.replace(/\/$/, '')));

  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, serviceWorkers: 'block' });
  const desktopErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') desktopErrors.push(msg.text());
  });

  const keyUrls = [
    `${BASE.replace(/\/$/, '')}/`,
    `${BASE.replace(/\/$/, '')}/solutions/`,
    `${BASE.replace(/\/$/, '')}/resources/`,
    `${BASE.replace(/\/$/, '')}/insights/`,
    `${BASE.replace(/\/$/, '')}/process/`,
    `${BASE.replace(/\/$/, '')}/portal/`
  ];
  const keyChecks = {};
  for (const url of keyUrls) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    keyChecks[url.replace(BASE.replace(/\/$/, ''), '') || '/'] = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      title: document.title,
      css: document.querySelector('link[href*="site-overrides.css"]')?.getAttribute('href') || ''
    }));
  }

  await page.goto(`${BASE.replace(/\/$/, '')}/`, { waitUntil: 'networkidle', timeout: 60000 });
  const homepageAudit = await page.evaluate(() => {
    const hero = Array.from(document.querySelectorAll('.home-hero-media-card img')).map((img) => img.getAttribute('src'));
    const rows = Array.from(document.querySelectorAll('.home-route-row-media img')).map((img) => img.getAttribute('src'));
    return {
      heroImages: hero,
      routeImages: rows,
      repeatedImages: hero.filter((src) => rows.includes(src)),
      routeRows: document.querySelectorAll('.home-route-row').length,
      browseRows: document.querySelectorAll('.home-browse-row').length
    };
  });

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    serviceWorkers: 'block'
  });
  const mobilePage = await mobileContext.newPage();
  const mobileErrors = [];
  mobilePage.on('console', (msg) => {
    if (msg.type() === 'error') mobileErrors.push(msg.text());
  });

  await mobilePage.goto(`${BASE.replace(/\/$/, '')}/`, { waitUntil: 'networkidle', timeout: 60000 });
  const mobileHomepageAudit = await mobilePage.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    visibleRegionLabels: Array.from(document.querySelectorAll('.hero-world-region-label')).filter((el) => getComputedStyle(el).display !== 'none').length,
    heroButtonTop: Math.round(document.querySelector('.home-hero-actions .btn-primary')?.getBoundingClientRect().top || 0)
  }));

  const insightAudit = [];
  for (const url of insightUrls) {
    await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    const result = await mobilePage.evaluate(() => {
      const heading = document.querySelector('.article-page-heading');
      const intro = document.querySelector('.insight-article p');
      const wideTables = Array.from(document.querySelectorAll('.article-table-wrap, .insight-article table')).filter((el) => el.scrollWidth > el.clientWidth + 1);
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        h1Size: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
        pSize: intro ? parseFloat(getComputedStyle(intro).fontSize) : null,
        stackedTableRows: document.querySelectorAll('.responsive-data-table .responsive-table-row').length,
        tableOverflow: wideTables.length,
        tocOverflow: document.querySelector('.article-toc-row') ? getComputedStyle(document.querySelector('.article-toc-row')).overflowX : null
      };
    });
    insightAudit.push({ url: url.replace(BASE.replace(/\/$/, ''), ''), ...result });
  }

  const summary = {
    base: BASE,
    keyChecks,
    homepageAudit,
    mobileHomepageAudit,
    insightSummary: {
      total: insightAudit.length,
      overflow: insightAudit.filter((item) => item.overflow).length,
      tableOverflow: insightAudit.filter((item) => item.tableOverflow > 0).length,
      pUnder14: insightAudit.filter((item) => item.pSize && item.pSize < 14).length,
      h1Under26: insightAudit.filter((item) => item.h1Size && item.h1Size < 26).length,
      examples: insightAudit.filter((item) => item.overflow || item.tableOverflow > 0 || (item.pSize && item.pSize < 14) || (item.h1Size && item.h1Size < 26)).slice(0, 10)
    },
    consoleErrors: {
      desktop: desktopErrors,
      mobile: mobileErrors
    }
  };

  console.log(JSON.stringify(summary, null, 2));

  const failed = [
    homepageAudit.repeatedImages.length > 0,
    mobileHomepageAudit.overflow,
    mobileHomepageAudit.visibleRegionLabels < 3,
    summary.insightSummary.overflow > 0,
    summary.insightSummary.tableOverflow > 0,
    summary.insightSummary.pUnder14 > 0,
    summary.insightSummary.h1Under26 > 0,
    Object.values(keyChecks).some((item) => item.overflow),
    desktopErrors.length > 0,
    mobileErrors.length > 0
  ].some(Boolean);

  await browser.close();
  process.exit(failed ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
