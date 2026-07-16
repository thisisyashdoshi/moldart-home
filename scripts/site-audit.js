#!/usr/bin/env node


const fs = require('fs');
let chromium = null;
try {
  ({ chromium } = require('playwright'));
} catch (_) {
  try {
    ({ chromium } = require('playwright-core'));
  } catch (error) {
    console.error('Playwright or playwright-core is required to run scripts/site-audit.js');
    process.exit(1);
  }
}

const BASE = process.argv[2] || 'http://127.0.0.1:4173';

function pickExecutablePath() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

function mobileContextOptions(width, height) {
  return {
    viewport: { width, height },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    serviceWorkers: 'block'
  };
}

async function auditVisualSystem(page, routes) {
  const checks = {};
  for (const route of routes) {
    await page.goto(`${BASE.replace(/\/$/, '')}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
    checks[route] = await page.evaluate(() => {
      const visible = (element) => {
        if (!element) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
      };
      const h1 = document.querySelector('main h1');
      const h1Style = h1 ? getComputedStyle(h1) : null;
      const sections = Array.from(document.querySelectorAll('main > section')).filter(visible);
      const icons = Array.from(
        document.querySelectorAll('.icon, .cmd-palette-item svg, .lightbox-close svg, .scroll-top-btn svg, .site-search-trigger-compact svg, .ui-mobile-toggle svg')
      ).filter(visible);
      const cards = Array.from(
        document.querySelectorAll('.article-cover-card, .article-dashboard-card, .article-panel, .article-signal-card, .article-visual-card, .home-browse-panel, .home-browse-row, .home-flow-node, .home-visual-card, .ui-footer-card, .ui-library-card, .ui-metric-card, .ui-mobile-menu-panel, .ui-page-hero-copy, .ui-page-hero-panel, .ui-proof-card, .ui-solution-card, .ui-insight-card, .youtube-card, .youtube-panel')
      ).filter(visible);
      const uniqueNumbers = (values) => [...new Set(values.map((value) => Math.round(value * 10) / 10))].sort((a, b) => a - b);
      const productCopy = document.querySelector('.ui-product-side .ui-page-hero-copy');
      const productMedia = document.querySelector('.ui-product-hero > .ui-product-media');
      const articleMeta = document.querySelector('.article-meta-row');
      const articleSeparators = articleMeta
        ? [articleMeta.children[1], articleMeta.children[3]].filter(Boolean)
        : [];
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        h1Font: h1Style?.fontFamily || '',
        h1Size: h1Style ? parseFloat(h1Style.fontSize) : 0,
        sectionPadding: sections.map((section) => Math.round(parseFloat(getComputedStyle(section).paddingTop))),
        iconSizes: uniqueNumbers(icons.map((icon) => parseFloat(getComputedStyle(icon).width))),
        iconStrokes: uniqueNumbers(icons.map((icon) => parseFloat(getComputedStyle(icon).strokeWidth)).filter(Number.isFinite)),
        cardRadii: uniqueNumbers(cards.map((card) => parseFloat(getComputedStyle(card).borderRadius))),
        homeBrowseX: Math.round(document.querySelector('.home-browse-panel')?.getBoundingClientRect().x || 0),
        homeVisualX: Math.round(document.querySelector('.home-command-visual')?.getBoundingClientRect().x || 0),
        productCopyTop: Math.round(productCopy?.getBoundingClientRect().top || 0),
        productMediaTop: Math.round(productMedia?.getBoundingClientRect().top || 0),
        articleMetaDisplay: articleMeta ? getComputedStyle(articleMeta).display : '',
        articleSeparatorsHidden: articleSeparators.length
          ? articleSeparators.every((separator) => getComputedStyle(separator).display === 'none')
          : null
      };
    });
  }
  return checks;
}

async function auditInsightViewport(browser, insightUrls, viewport) {
  const context = await browser.newContext(mobileContextOptions(viewport.width, viewport.height));
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const results = [];
  for (const url of insightUrls) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    const result = await page.evaluate(() => {
      const heading = document.querySelector('.article-page-heading');
      const intro = document.querySelector('.insight-article p');
      const tocRow = document.querySelector('.article-toc-row');
      const wideTables = Array.from(document.querySelectorAll('.article-table-wrap, .insight-article table')).filter((el) => el.scrollWidth > el.clientWidth + 1);
      const countCols = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return 0;
        const template = getComputedStyle(el).gridTemplateColumns || '';
        if (!template || template === 'none') return 0;
        return template.trim().split(/\s+/).length;
      };
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        h1Size: heading ? parseFloat(getComputedStyle(heading).fontSize) : null,
        pSize: intro ? parseFloat(getComputedStyle(intro).fontSize) : null,
        stackedTableRows: document.querySelectorAll('.responsive-data-table .responsive-table-row').length,
        tableOverflow: wideTables.length,
        tocScrollable: tocRow ? tocRow.scrollWidth > tocRow.clientWidth + 1 : false,
        primerCols: countCols('.article-primer-grid'),
        signalCols: countCols('.article-signal-grid'),
        dashboardCols: countCols('.article-dashboard-grid'),
        appendixCols: countCols('.article-appendix-grid')
      };
    });
    results.push({ url: url.replace(BASE.replace(/\/$/, ''), ''), ...result });
  }

  await context.close();

  const examples = results.filter((item) => (
    item.overflow ||
    item.tableOverflow > 0 ||
    item.tocScrollable ||
    item.primerCols > 1 ||
    item.signalCols > 1 ||
    item.dashboardCols > 1 ||
    item.appendixCols > 1 ||
    (item.pSize && item.pSize < 14) ||
    (item.h1Size && item.h1Size < 26)
  )).slice(0, 12);

  return {
    viewport,
    summary: {
      total: results.length,
      overflow: results.filter((item) => item.overflow).length,
      tableOverflow: results.filter((item) => item.tableOverflow > 0).length,
      tocScrollable: results.filter((item) => item.tocScrollable).length,
      denseGridMultiCol: results.filter((item) => item.primerCols > 1 || item.signalCols > 1 || item.dashboardCols > 1 || item.appendixCols > 1).length,
      pUnder14: results.filter((item) => item.pSize && item.pSize < 14).length,
      h1Under26: results.filter((item) => item.h1Size && item.h1Size < 26).length,
      examples
    },
    consoleErrors
  };
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
    `${BASE.replace(/\/$/, '')}/explore/`,
    `${BASE.replace(/\/$/, '')}/products/`,
    `${BASE.replace(/\/$/, '')}/solutions/`,
    `${BASE.replace(/\/$/, '')}/resources/`,
    `${BASE.replace(/\/$/, '')}/evidence-qc/`,
    `${BASE.replace(/\/$/, '')}/process/`,
    `${BASE.replace(/\/$/, '')}/insights/`,
    `${BASE.replace(/\/$/, '')}/products/melamine-impregnated-technical-papers/`,
    `${BASE.replace(/\/$/, '')}/products/electronics-lamination-films/`,
    `${BASE.replace(/\/$/, '')}/solutions/decorative-surfaces/`,
    `${BASE.replace(/\/$/, '')}/solutions/pcb-ccl/`,
    `${BASE.replace(/\/$/, '')}/faq/`,
    `${BASE.replace(/\/$/, '')}/about/`,
    `${BASE.replace(/\/$/, '')}/contact/`,
    `${BASE.replace(/\/$/, '')}/privacy/`,
    `${BASE.replace(/\/$/, '')}/terms/`
  ];
  const keyChecks = {};
  for (const url of keyUrls) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    keyChecks[url.replace(BASE.replace(/\/$/, ''), '') || '/'] = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      title: document.title,
      css: document.querySelector('link[rel="stylesheet"]')?.getAttribute('href') || ''
    }));
  }

  const visualSystemRoutes = [
    '/',
    '/products/',
    '/solutions/',
    '/contact/',
    '/evidence-qc/',
    '/process/',
    '/products/press-plates/',
    '/products/electronics-lamination-films/',
    '/solutions/decorative-surfaces/',
    '/insights/custom-furniture-brief-guide/',
    '/privacy/'
  ];
  const desktopVisualSystemAudit = await auditVisualSystem(page, visualSystemRoutes);

  await page.goto(`${BASE.replace(/\/$/, '')}/`, { waitUntil: 'networkidle', timeout: 60000 });
  const homepageAudit = await page.evaluate(() => {
    const heroImages = Array.from(document.querySelectorAll('.home-command-collage img'));
    const visualImages = Array.from(document.querySelectorAll('.home-visual-card img'));
    return {
      heroImages: heroImages.map((img) => img.getAttribute('src')),
      visualImages: visualImages.map((img) => img.getAttribute('src')),
      eagerImages: heroImages.filter((img) => img.loading === 'eager').map((img) => img.getAttribute('src')),
      highPriorityImages: heroImages
        .filter((img) => img.getAttribute('fetchpriority') === 'high')
        .map((img) => img.getAttribute('src')),
      lazyImages: heroImages.filter((img) => img.loading === 'lazy').map((img) => img.getAttribute('src')),
      flowNodes: document.querySelectorAll('.home-flow-node').length,
      browseRows: document.querySelectorAll('.home-browse-row').length
    };
  });
  await page.click('[data-open-command-palette]');
  await page.waitForTimeout(60);
  const commandPaletteAudit = await page.evaluate(() => ({
    open: document.querySelector('#command-palette')?.classList.contains('is-open') || false,
    inputFocused: document.activeElement?.id === 'cmd-input'
  }));
  await page.keyboard.press('Escape');
  commandPaletteAudit.closedAfterEscape = await page.evaluate(
    () => !document.querySelector('#command-palette')?.classList.contains('is-open')
  );

  const homeUrl = `${BASE.replace(/\/$/, '')}/`;
  await page.click('[data-open-command-palette]');
  await page.fill('#cmd-input', 'press plates');
  await page.waitForSelector('#cmd-results .cmd-palette-item.is-active');
  const enterExpected = await page.locator('#cmd-results .cmd-palette-item.is-active').getAttribute('href');
  await Promise.all([
    page.waitForURL((url) => url.pathname === enterExpected, { timeout: 10000 }),
    page.keyboard.press('Enter')
  ]);
  const enterActual = new URL(page.url()).pathname;

  await page.goto(homeUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.click('[data-open-command-palette]');
  await page.fill('#cmd-input', 'press plates');
  await page.waitForSelector('#cmd-results .cmd-palette-item.is-active');
  await page.keyboard.press('ArrowDown');
  const arrowExpected = await page.locator('#cmd-results .cmd-palette-item.is-active').getAttribute('href');
  await Promise.all([
    page.waitForURL((url) => url.pathname === arrowExpected, { timeout: 10000 }),
    page.keyboard.press('Enter')
  ]);
  const arrowActual = new URL(page.url()).pathname;

  await page.goto(homeUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.click('[data-open-command-palette]');
  await page.fill('#cmd-input', 'Moldart Company Profile');
  await page.waitForSelector('#cmd-results .cmd-palette-item.is-active');
  const resourceExpected = await page.locator('#cmd-results .cmd-palette-item.is-active').getAttribute('href');
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/resources/', { timeout: 10000 }),
    page.keyboard.press('Enter')
  ]);
  const resourceActual = new URL(page.url()).pathname;
  const commandPaletteNavigationAudit = {
    enterExpected,
    enterActual,
    enterPassed: enterExpected === '/products/press-plates/' && enterActual === enterExpected,
    arrowExpected,
    arrowActual,
    arrowPassed: arrowExpected === '/products/industrial-press-plates/' && arrowActual === arrowExpected,
    resourceExpected,
    resourceActual,
    resourcePassed: resourceExpected === '/resources/' && resourceActual === '/resources/'
  };

  async function auditUnavailableSearch(mode) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
    const issuePage = await context.newPage();
    await issuePage.route('**/data/search-index.json*', async (route) => {
      if (mode === 'network') await route.abort('failed');
      else await route.fulfill({ status: 200, contentType: 'application/json', body: '{"invalid":true}' });
    });
    await issuePage.goto(homeUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await issuePage.click('[data-open-command-palette]');
    await issuePage.waitForFunction(
      () => document.querySelector('#cmd-results')?.textContent?.includes('Search is unavailable right now.')
    );
    const result = await issuePage.evaluate(() => ({
      unavailableMessage: document.querySelector('#cmd-results')?.textContent?.includes('Search is unavailable right now.') || false,
      inputFocused: document.activeElement?.id === 'cmd-input'
    }));
    await context.close();
    return result;
  }
  const commandPaletteFailureAudit = {
    network: await auditUnavailableSearch('network'),
    malformed: await auditUnavailableSearch('malformed')
  };

  const mobileContext = await browser.newContext(mobileContextOptions(390, 844));
  const mobilePage = await mobileContext.newPage();
  const mobileErrors = [];
  mobilePage.on('console', (msg) => {
    if (msg.type() === 'error') mobileErrors.push(msg.text());
  });

  await mobilePage.goto(`${BASE.replace(/\/$/, '')}/`, { waitUntil: 'networkidle', timeout: 60000 });
  const mobileHomepageAudit = await mobilePage.evaluate(() => {
    const mobileChat = document.querySelector('.home-hero-mobile-chat');
    const heroStage = document.querySelector('.home-hero-stage');
    return {
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      heroStageDisplay: heroStage ? getComputedStyle(heroStage).display : 'missing',
      visibleBrowseRows: Array.from(document.querySelectorAll('.home-browse-row')).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      }).length,
      heroButtonTop: Math.round(
        document.querySelector('.home-hero-actions .btn-primary')?.getBoundingClientRect().top || 0
      ),
      floatingWhatsAppDisplay: getComputedStyle(document.querySelector('.whatsapp-fab')).display,
      mobileChatDisplay: mobileChat ? getComputedStyle(mobileChat).display : 'missing',
      mobileChatHeight: Math.round(mobileChat?.getBoundingClientRect().height || 0)
    };
  });

  await mobilePage.click('[data-mobile-menu-toggle]');
  const mobileMenuAudit = await mobilePage.evaluate(() => {
    const button = document.querySelector('[data-mobile-menu-toggle]');
    const menu = document.querySelector('#mob-menu');
    return {
      expanded: button?.getAttribute('aria-expanded') === 'true',
      open: menu?.classList.contains('open') || false,
      inert: menu?.hasAttribute('inert') ?? true,
      firstLinkVisible: (menu?.querySelector('a')?.getBoundingClientRect().height || 0) > 0
    };
  });
  await mobilePage.keyboard.press('Escape');
  mobileMenuAudit.closedAfterEscape = await mobilePage.evaluate(
    () => document.querySelector('[data-mobile-menu-toggle]')?.getAttribute('aria-expanded') === 'false'
  );
  const mobileVisualSystemAudit = await auditVisualSystem(mobilePage, visualSystemRoutes);

  await page.goto(`${BASE.replace(/\/$/, '')}/contact/`, { waitUntil: 'networkidle', timeout: 60000 });
  const formConsentAudit = await page.evaluate(() => {
    const contact = document.querySelector('#inquiry-form [name="privacy_accepted"]');
    const resource = document.querySelector('#resource-gate-form [name="privacy_accepted"]');
    return {
      contactPresent: Boolean(contact),
      contactRequired: Boolean(contact?.required),
      resourcePresent: Boolean(resource),
      resourceRequired: Boolean(resource?.required),
      privacyLinks: document.querySelectorAll('a[href="/privacy/"]').length
    };
  });
  await mobileContext.close();

  const insightPhoneAudits = {};
  for (const viewport of [
    { key: 'phone360', width: 360, height: 800 },
    { key: 'phone430', width: 430, height: 932 }
  ]) {
    insightPhoneAudits[viewport.key] = await auditInsightViewport(browser, insightUrls, viewport);
  }

  const summary = {
    base: BASE,
    keyChecks,
    homepageAudit,
    commandPaletteAudit,
    commandPaletteNavigationAudit,
    commandPaletteFailureAudit,
    desktopVisualSystemAudit,
    mobileVisualSystemAudit,
    mobileHomepageAudit,
    mobileMenuAudit,
    formConsentAudit,
    insightPhoneAudits: {
      phone360: insightPhoneAudits.phone360,
      phone430: insightPhoneAudits.phone430
    },
    consoleErrors: {
      desktop: desktopErrors,
      mobileHome: mobileErrors,
      phone360: insightPhoneAudits.phone360.consoleErrors,
      phone430: insightPhoneAudits.phone430.consoleErrors
    }
  };

  console.log(JSON.stringify(summary, null, 2));

  const failed = [
    homepageAudit.eagerImages.length !== 1,
    homepageAudit.highPriorityImages.length !== 1,
    homepageAudit.lazyImages.length < 2,
    homepageAudit.flowNodes !== 4,
    homepageAudit.browseRows !== 3,
    !commandPaletteAudit.open,
    !commandPaletteAudit.inputFocused,
    !commandPaletteAudit.closedAfterEscape,
    !commandPaletteNavigationAudit.enterPassed,
    !commandPaletteNavigationAudit.arrowPassed,
    !commandPaletteNavigationAudit.resourcePassed,
    !commandPaletteFailureAudit.network.unavailableMessage,
    !commandPaletteFailureAudit.network.inputFocused,
    !commandPaletteFailureAudit.malformed.unavailableMessage,
    !commandPaletteFailureAudit.malformed.inputFocused,
    mobileHomepageAudit.overflow,
    mobileHomepageAudit.heroStageDisplay !== 'none',
    mobileHomepageAudit.heroButtonTop > 620,
    mobileHomepageAudit.floatingWhatsAppDisplay !== 'none',
    mobileHomepageAudit.mobileChatDisplay === 'none',
    mobileHomepageAudit.mobileChatHeight < 44,
    !mobileMenuAudit.expanded,
    !mobileMenuAudit.open,
    mobileMenuAudit.inert,
    !mobileMenuAudit.firstLinkVisible,
    !mobileMenuAudit.closedAfterEscape,
    !formConsentAudit.contactPresent,
    !formConsentAudit.contactRequired,
    !formConsentAudit.resourcePresent,
    !formConsentAudit.resourceRequired,
    formConsentAudit.privacyLinks < 2,
    Object.values(keyChecks).some((item) => item.overflow),
    Object.values(desktopVisualSystemAudit).some((item) =>
      item.overflow ||
      !item.h1Font.includes('Montserrat') ||
      item.sectionPadding.some((padding) => ![40, 64, 72, 80].includes(padding)) ||
      item.iconSizes.some((size) => ![16, 20, 24].includes(size)) ||
      item.iconStrokes.some((stroke) => stroke !== 1.8) ||
      item.cardRadii.some((radius) => ![20, 28].includes(radius))
    ),
    Object.values(mobileVisualSystemAudit).some((item) =>
      item.overflow ||
      !item.h1Font.includes('Montserrat') ||
      item.sectionPadding.some((padding) => ![40, 48, 52].includes(padding)) ||
      item.iconSizes.some((size) => ![16, 20, 24].includes(size)) ||
      item.iconStrokes.some((stroke) => stroke !== 1.8) ||
      item.cardRadii.some((radius) => ![20, 28].includes(radius))
    ),
    desktopVisualSystemAudit['/'].homeBrowseX >= desktopVisualSystemAudit['/'].homeVisualX,
    mobileVisualSystemAudit['/products/press-plates/'].productCopyTop >= mobileVisualSystemAudit['/products/press-plates/'].productMediaTop,
    mobileVisualSystemAudit['/insights/custom-furniture-brief-guide/'].articleMetaDisplay !== 'grid',
    !mobileVisualSystemAudit['/insights/custom-furniture-brief-guide/'].articleSeparatorsHidden,
    desktopErrors.length > 0,
    mobileErrors.length > 0,
    ...Object.values(insightPhoneAudits).flatMap((audit) => [
      audit.summary.overflow > 0,
      audit.summary.tableOverflow > 0,
      audit.summary.tocScrollable > 0,
      audit.summary.denseGridMultiCol > 0,
      audit.summary.pUnder14 > 0,
      audit.summary.h1Under26 > 0,
      audit.consoleErrors.length > 0
    ])
  ].some(Boolean);

  await browser.close();
  process.exit(failed ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
