#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public-site");
const reportDir = path.join(root, ".tmp");
const insightContractPath = path.join(root, "data", "insight-url-contract.json");
const productDirectoryPath = path.join(root, "data", "product-directory.json");
const solutionDirectoryPath = path.join(root, "data", "solutions.json");
const plannedProductScopePath = path.join(root, "internal", "planned-product-scope.json");
const visualPrototypeMediaPath = path.join(root, "internal", "visual-prototype-media.json");
const expectedProductSlugs = [
  "press-plates",
  "press-pads",
  "printed-decor-paper",
  "melamine-impregnated-technical-papers",
  "decorative-films-foils",
  "genuine-vegetable-parchment",
  "fiberboard",
  "particleboard",
  "osb",
  "plywood",
  "hpl-compact-laminated-boards",
  "wood-flooring",
  "decorative-ss-panels",
  "ss-profiles",
  "industrial-press-plates",
  "electronics-press-pads",
  "electronics-lamination-films",
];
const expectedSolutionSlugs = [
  "lamination",
  "furniture",
  "flooring",
  "decorative-surfaces",
  "formwork-shuttering",
  "architecture",
  "metal-finishing",
  "pcb-ccl",
];
const legacyProductRedirects = {
  "engraved-cylinders": "/products/printed-decor-paper/",
  "flooring-accessories": "/products/wood-flooring/",
  "custom-furniture": "/solutions/furniture/",
  "ready-made-furniture": "/solutions/furniture/",
  "ss-furniture": "/solutions/architecture/",
};
const stockedProductIds = new Set([
  "melamine-impregnated-paper",
  "decorative-films-foils",
  "genuine-vegetable-parchment",
  "electronics-press-pads",
  "electronics-lamination-films",
]);
const legacyReviewMedia = [
  "/images/page5_img1.webp",
  "/images/page5_img2.webp",
  "/images/page5_img3.webp",
  "/images/page6_img1.webp",
  "/images/page6_img2.webp",
  "/images/page6_img3.webp",
  "/images/page6_img4.webp",
  "/images/page7_img1.webp",
  "/images/page7_img2.webp",
  "/images/page7_img3.webp",
  "/images/page7_img4.webp",
  "/images/page9_img1.webp",
  "/images/page9_img2.webp",
  "/images/page9_img2_clean.webp",
  "/images/page9_img3.webp",
  "/images/page9_img4.webp",
  "/images/press_pad_new.webp",
];
let productClaimRegister = [];
let productMediaRegister = [];
let insightTechnicalReviewRegister = [];
let mediaRightsRegister = [];

const report = {
  generatedAt: new Date().toISOString(),
  mode: "artifact-release-gate-no-deploy",
  checks: [],
  failures: [],
  warnings: [],
};

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function artifactPath(relativePath) {
  return path.join(publicDir, relativePath);
}

function pass(name, detail = {}) {
  report.checks.push({ name, ...detail, status: "pass" });
}

function warn(name, message, detail = {}) {
  report.warnings.push({ name, message, ...detail });
  report.checks.push({ name, message, ...detail, status: "warn" });
}

function fail(name, message, detail = {}) {
  report.failures.push({ name, message, ...detail });
  report.checks.push({ name, message, ...detail, status: "fail" });
}

function readArtifact(relativePath) {
  return fs.readFileSync(artifactPath(relativePath), "utf8");
}

function existsArtifact(relativePath) {
  return fs.existsSync(artifactPath(relativePath));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) entries.push(...walk(full));
    else entries.push(full);
  }
  return entries;
}

function executableInlineScriptHashes() {
  const records = [];
  for (const file of walk(publicDir).filter((item) => item.endsWith(".html"))) {
    const html = fs.readFileSync(file, "utf8");
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attributes = match[1] || "";
      if (/\bsrc\s*=/i.test(attributes)) continue;
      const type = attributes.match(/\btype=["']([^"']+)/i)?.[1]?.toLowerCase() || "";
      if (type && !["text/javascript", "application/javascript", "module"].includes(type)) continue;
      const digest = crypto.createHash("sha256").update(match[2], "utf8").digest("base64");
      records.push({ hash: `sha256-${digest}`, file: path.relative(publicDir, file) });
    }
  }
  return records;
}

function sitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
}

function routeToArtifactPath(routePath) {
  const clean = routePath.replace(/^\//, "");
  if (!clean) return artifactPath("index.html");
  if (clean.endsWith("/")) return artifactPath(`${clean}index.html`);
  return artifactPath(clean);
}

function expectFile(relativePath) {
  if (existsArtifact(relativePath)) pass(`artifact file ${relativePath}`);
  else fail(`artifact file ${relativePath}`, "Required artifact file is missing");
}

function validateRequiredFiles() {
  if (!fs.existsSync(publicDir)) {
    fail("public artifact", "public-site is missing; run npm run build first");
    return;
  }
  pass("public artifact exists", { path: rel(publicDir) });
  [
    "index.html",
    "404.html",
    "_headers",
    "_redirects",
    "sitemap.xml",
    "robots.txt",
    "llms.txt",
    "llms-full.txt",
    "build.json",
    "site.webmanifest",
    "home.css",
    "site.css",
    "styles.css",
    "pages.css",
    "site-overrides.css",
    "main.js",
    "data/youtube-library.json",
    "data/search-index.json",
    "products/index.html",
    "solutions/index.html",
    "insights/index.html",
    "evidence-qc/index.html",
    "process/index.html",
    "resources/index.html",
    "contact/index.html",
    "data/product-directory.json",
    "data/solutions.json",
    "data/insight-optimization.json",
  ].forEach(expectFile);
}

function validateForbiddenFiles() {
  const files = walk(publicDir).map(rel);
  const forbidden = files.filter((file) =>
    /YASH-LAPTOP|\.env|credential|secret|\.pem|\.p12|\.pfx|\.key/i.test(file) ||
    /public-site\/(trade-portal|node_modules|\.next|\.tmp|functions|netlify\/functions)(\/|$)/.test(file),
  );
  if (forbidden.length) fail("forbidden public files", "Public artifact contains backup, private, or runtime files", { files: forbidden.slice(0, 50) });
  else pass("forbidden public files", { checked: files.length });

  if (fs.existsSync(path.join(publicDir, "portal"))) fail("static portal artifact", "public-site/portal exists; public artifact should rely on redirects only");
  else pass("static portal artifact excluded");
  if (fs.existsSync(path.join(publicDir, "open-wood-science"))) fail("open wood science artifact", "public-site/open-wood-science should not be shipped");
  else pass("open wood science artifact excluded");
  if (fs.existsSync(path.join(publicDir, "process", "index.html"))) pass("process artifact published");
  else fail("process artifact published", "The package requires a real /process/ page in the public artifact");
}

function validateSitemap() {
  if (!existsArtifact("sitemap.xml")) return;
  const urls = sitemapUrls(readArtifact("sitemap.xml"));
  const pathnames = urls.map((url) => new URL(url).pathname);
  const insightUrls = pathnames.filter((pathname) => pathname.startsWith("/insights/"));
  const productUrls = pathnames.filter((pathname) => pathname.startsWith("/products/"));
  const solutionUrls = pathnames.filter((pathname) => pathname.startsWith("/solutions/"));
  if (urls.length === 89 && new Set(urls).size === 89) pass("sitemap url count", { actual: urls.length });
  else fail("sitemap url count", "Expected exactly 89 unique public URLs", { actual: urls.length, unique: new Set(urls).size });
  if (urls.includes("https://moldartindia.com/privacy/") && urls.includes("https://moldartindia.com/terms/") && urls.includes("https://moldartindia.com/evidence-qc/") && urls.includes("https://moldartindia.com/process/"))
    pass("sitemap legal and control routes");
  else fail("sitemap legal and control routes", "Privacy, Terms, Evidence & QC, and Process must be present in the sitemap");
  if (insightUrls.length === 52) pass("sitemap insight url count", { actual: insightUrls.length });
  else fail("sitemap insight url count", "Expected insight index plus 51 insight pages", { actual: insightUrls.length });
  if (productUrls.length === 18) pass("sitemap product url count", { actual: productUrls.length });
  else fail("sitemap product url count", "Expected product hub plus 17 product pages", { actual: productUrls.length });
  if (solutionUrls.length === 9) pass("sitemap solution url count", { actual: solutionUrls.length });
  else fail("sitemap solution url count", "Expected solution index plus 8 solution pages", { actual: solutionUrls.length });
  const missingProducts = expectedProductSlugs.filter((slug) => !pathnames.includes(`/products/${slug}/`));
  const extraProducts = productUrls.filter((pathname) => pathname !== "/products/" && !expectedProductSlugs.some((slug) => pathname === `/products/${slug}/`));
  if (!missingProducts.length && !extraProducts.length) pass("sitemap exact product routes", { products: expectedProductSlugs.length });
  else fail("sitemap exact product routes", "Sitemap does not match the 17-route product contract", { missingProducts, extraProducts });
  const missingSolutions = expectedSolutionSlugs.filter((slug) => !pathnames.includes(`/solutions/${slug}/`));
  const extraSolutions = solutionUrls.filter((pathname) => pathname !== "/solutions/" && !expectedSolutionSlugs.some((slug) => pathname === `/solutions/${slug}/`));
  if (!missingSolutions.length && !extraSolutions.length) pass("sitemap exact solution routes", { solutions: expectedSolutionSlugs.length });
  else fail("sitemap exact solution routes", "Sitemap does not match the 8-route solution contract", { missingSolutions, extraSolutions });
  const legacyRoutes = Object.keys(legacyProductRedirects).map((slug) => `/products/${slug}/`).filter((pathname) => pathnames.includes(pathname));
  if (!legacyRoutes.length) pass("legacy products excluded from sitemap");
  else fail("legacy products excluded from sitemap", "Legacy/application routes must not remain active product URLs", { legacyRoutes });
  const wwwUrls = urls.filter((url) => url.includes("www.moldartindia.com"));
  if (wwwUrls.length) fail("sitemap canonical host", "Sitemap should use apex moldartindia.com", { urls: wwwUrls.slice(0, 10) });
  else pass("sitemap canonical host");
  const missing = pathnames
    .map((pathname) => ({ pathname, file: routeToArtifactPath(pathname) }))
    .filter((item) => !fs.existsSync(item.file));
  if (missing.length) fail("sitemap artifact files", "Some sitemap URLs do not have artifact files", { missing });
  else pass("sitemap artifact files", { checked: urls.length });
}

function validateLlms() {
  for (const file of ["llms.txt", "llms-full.txt"]) {
    if (!existsArtifact(file)) continue;
    const text = readArtifact(file);
    const markdownLinks = (text.match(/\[[^\]]+\]\(https:\/\/moldartindia\.com\/[^)]*\)/g) || []).length;
    if (markdownLinks >= 5) pass(`${file} markdown links`, { markdownLinks });
    else fail(`${file} markdown links`, "Expected Markdown links to pass agentic browsing recommendations", { markdownLinks });
    if (text.includes("Mold Art (India) Private Limited") && text.includes("info@moldartindia.com")) pass(`${file} identity block`);
    else fail(`${file} identity block`, "Canonical identity details are missing");
  }
}

function validateHeadersAndRedirects() {
  if (existsArtifact("_headers")) {
    const headers = readArtifact("_headers");
    for (const required of [
      "Strict-Transport-Security",
      "Content-Security-Policy",
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Cross-Origin-Opener-Policy",
      "Cross-Origin-Resource-Policy",
    ]) {
      if (headers.includes(required)) pass(`header ${required}`);
      else fail(`header ${required}`, "Required security/header directive missing from _headers");
    }
    const cspLine = headers.split(/\r?\n/).find((line) => line.includes("Content-Security-Policy:")) || "";
    const declaredHashes = new Set(Array.from(cspLine.matchAll(/'sha256-([^']+)'/g)).map((match) => `sha256-${match[1]}`));
    const inlineRecords = executableInlineScriptHashes();
    const requiredHashes = new Set(inlineRecords.map((record) => record.hash));
    const missingHashes = [...requiredHashes].filter((hash) => !declaredHashes.has(hash));
    const staleHashes = [...declaredHashes].filter((hash) => !requiredHashes.has(hash));
    if (!missingHashes.length && !staleHashes.length && requiredHashes.size > 0)
      pass("CSP executable inline-script hashes", { uniqueHashes: requiredHashes.size, scriptInstances: inlineRecords.length });
    else
      fail("CSP executable inline-script hashes", "CSP hashes must exactly match every executable inline script in the public artifact", {
        missingHashes,
        staleHashes,
        affectedFiles: inlineRecords.filter((record) => missingHashes.includes(record.hash)).slice(0, 30),
      });
    if (cspLine.length <= 2000) pass("CSP header line length", { characters: cspLine.length });
    else fail("CSP header line length", "Cloudflare _headers lines may not exceed 2,000 characters", { characters: cspLine.length });
    if (/\/portal\/\*\s+[\s\S]*X-Robots-Tag:\s*noindex/i.test(headers)) pass("portal noindex headers");
    else warn("portal noindex headers", "Could not confirm portal noindex block in _headers");
  }

  if (existsArtifact("_redirects")) {
    const redirects = readArtifact("_redirects");
    if (/^\/products\s+\/products\/\s+301/m.test(redirects)) pass("products hub redirect");
    else fail("products hub redirect", "Expected /products to redirect to /products/");
    if (/^\/products\/?\s+\/solutions\//m.test(redirects)) fail("products not redirected to solutions", "Products hub must not redirect to /solutions/");
    else pass("products not redirected to solutions");
    if (/^\/portal\s+\/contact\/\?intent=portal-access\s+302/m.test(redirects) && /^\/portal\/\*\s+\/contact\/\?intent=portal-access\s+302/m.test(redirects)) pass("portal redirects");
    else fail("portal redirects", "Expected public portal routes to redirect to contact intent");
    if (/^\/open-wood-science\/\*\s+\/resources\/\s+301/m.test(redirects)) pass("open wood science redirects");
    else fail("open wood science redirects", "Expected Open Wood Science routes to redirect out of the public artifact");
    if (/^\/process\s+\/process\/\s+301/m.test(redirects) && !/^\/process\/\s+\S+\s+30[12]/m.test(redirects)) pass("process canonical redirect only");
    else fail("process canonical redirect only", "The no-slash route may canonicalize, but /process/ must remain a real page");
    for (const [slug, target] of Object.entries(legacyProductRedirects)) {
      const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`^/products/${slug}/?\\s+${escapedTarget}\\s+301`, "m");
      if (pattern.test(redirects)) pass(`legacy product redirect ${slug}`, { target });
      else fail(`legacy product redirect ${slug}`, "Missing required single-hop legacy product redirect", { target });
    }
  }
}

function validateInsightContentIntegrity() {
  if (!fs.existsSync(insightContractPath)) {
    fail("locked insight URL contract", "data/insight-url-contract.json is missing");
    return;
  }
  let contract;
  try {
    contract = JSON.parse(fs.readFileSync(insightContractPath, "utf8"));
  } catch (error) {
    fail("locked insight URL contract", "Could not parse insight URL contract", { error: error.message });
    return;
  }
  const slugs = Array.isArray(contract.slugs) ? contract.slugs : [];
  if (slugs.length === 51 && new Set(slugs).size === 51) pass("locked insight URL contract", { count: slugs.length });
  else fail("locked insight URL contract", "Expected exactly 51 unique locked insight slugs", { count: slugs.length });

  const redirects = existsArtifact("_redirects") ? readArtifact("_redirects") : "";
  const directRedirects = [
    ["custom-furniture-specifications", "/insights/custom-furniture-brief-guide/"],
    ["ready-made-furniture-applications", "/insights/ready-made-furniture-procurement-guide/"],
  ];
  for (const [legacySlug, target] of directRedirects) {
    const pattern = new RegExp(`^/insights/${legacySlug}/?\\s+${target.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s+301`, "m");
    if (pattern.test(redirects)) pass(`direct legacy redirect ${legacySlug}`, { target });
    else fail(`direct legacy redirect ${legacySlug}`, "Legacy insight must redirect to its closest surviving guide", { target });
  }

  const forbiddenBySlug = {
    "fob-china-rfq-checklist-wood-steel-flooring-furniture-tooling": /CAD\/CNC|Hospitality furniture|Retail fixtures|Product:\s*Custom Furniture/i,
    "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion": /CAD\/CNC|Hospitality furniture|Retail fixtures|Product:\s*Custom Furniture/i,
    "china-sample-approval-route-buyer-counter-production-sample": /CAD\/CNC|Hospitality furniture|Retail fixtures|Product:\s*Custom Furniture/i,
    "what-buyers-should-not-compare-only-by-price": /CAD\/CNC|Hospitality furniture|Retail fixtures|Product:\s*Custom Furniture/i,
    "hpl-vs-lpl-material-selection-guide": /Product:\s*Printed Decor Paper|60–85 GSM|Wet tensile/i,
    "hpl-vs-lpl-vs-cpl-vs-veneer-pet-pvc-acrylic": /Product:\s*Printed Decor Paper|60–85 GSM|Wet tensile/i,
  };
  const headings = [];
  const flooringSlugs = new Set([
    "engineered-flooring-selection-guide",
    "wood-flooring-core-moisture-wear-class-guide",
    "flooring-accessories-skirting-stair-nosing-t-moulding-reducers-end-caps",
    "flooring-site-readiness-before-dispatch",
  ]);

  for (const slug of slugs) {
    const relativePath = `insights/${slug}/index.html`;
    if (!existsArtifact(relativePath)) {
      fail(`locked insight artifact ${slug}`, "Locked insight is missing from public artifact");
      continue;
    }
    const html = readArtifact(relativePath);
    const heading = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (heading) {
      headings.push({ slug, heading });
      insightTechnicalReviewRegister.push({
        slug,
        title: heading,
        status: "pending-named-technical-review",
        reviewer: null,
        reviewerQualification: null,
        reviewedAt: null,
        approvedRevision: null,
        notes: null,
      });
    } else fail(`insight heading ${slug}`, "Locked insight needs one visible H1");
    if (/Wrong buyer question|decision sheet for buyers who need to specify, approve, inspect/i.test(html)) fail(`insight generic boilerplate ${slug}`, "Remove known repeated generic template copy");
    else pass(`insight generic boilerplate ${slug}`);
    const canonical = `https://moldartindia.com/insights/${slug}/`;
    if (html.includes(`href="${canonical}"`)) pass(`insight canonical ${slug}`);
    else fail(`insight canonical ${slug}`, "Locked insight must self-canonicalize", { canonical });
    if (html.includes("article-cover-caption") && (html.includes("ILLUSTRATIVE RENDER") || html.includes("DETERMINISTIC DIAGRAM"))) pass(`insight media status ${slug}`);
    else fail(`insight media status ${slug}`, "Every rendered cover must be visibly labelled as an illustrative render or deterministic diagram until evidence-backed media is supplied");
    if (/<td>Optional<\/td>/i.test(html)) fail(`insight document statuses ${slug}`, "Use Required, Conditional, or Not applicable—not Optional");
    else pass(`insight document statuses ${slug}`);
    if (/Written by Yash Doshi, Moldart|datePublished/i.test(html)) fail(`insight authorship/date integrity ${slug}`, "Do not render synthetic dates or a hard-coded author without a source record");
    else pass(`insight authorship/date integrity ${slug}`);
    if (forbiddenBySlug[slug]?.test(html)) fail(`insight binding ${slug}`, "Known cross-product template content remains");
    else if (forbiddenBySlug[slug]) pass(`insight binding ${slug}`);
    if (flooringSlugs.has(slug) && /Engineered Wood Flooring|engineered flooring/i.test(html)) fail(`insight flooring taxonomy ${slug}`, "Laminate flooring guide contains the incorrect engineered-flooring label");
    else if (flooringSlugs.has(slug)) pass(`insight flooring taxonomy ${slug}`);
  }

  const duplicateHeadings = headings
    .map((item) => item.heading)
    .filter((heading, index, values) => values.indexOf(heading) !== index);
  if (duplicateHeadings.length) fail("locked insight headline uniqueness", "Each permanent insight URL needs a distinct visible buyer decision", { duplicateHeadings: [...new Set(duplicateHeadings)] });
  else pass("locked insight headline uniqueness", { count: headings.length });
  warn("insight technical review completion", "All permanent guides require named competent human review before a 100/100 evidence result", { pendingReviews: insightTechnicalReviewRegister.length });

  const flooringProduct = "products/wood-flooring/index.html";
  if (existsArtifact(flooringProduct)) {
    const html = readArtifact(flooringProduct);
    if (/Laminate Flooring Systems\.?<\/h1>/i.test(html) && !/Engineered Wood Flooring|engineered flooring/i.test(html)) pass("laminate flooring product taxonomy");
    else fail("laminate flooring product taxonomy", "Product page must use laminate flooring terminology without engineered-flooring claims");
  } else fail("laminate flooring product taxonomy", "Flooring product artifact is missing");
}

function validateDiscoveryIntegrity() {
  if (!existsArtifact("insights/index.html") || !existsArtifact("explore/index.html")) return;
  const insights = readArtifact("insights/index.html");
  const explore = readArtifact("explore/index.html");
  if (/draft-first queue|existing guides upgraded|\b\d+ edited guide|deeper route note/i.test(insights)) fail("insights public editorial counters", "Internal editorial counters must not appear on the buyer-facing Insights page");
  else pass("insights public editorial counters");
  if (explore.includes("Choose a product, solution, guide, document, or search to begin.") && explore.includes("type:params.get('type')||''")) pass("explore starts filtered");
  else fail("explore starts filtered", "Explore must not default to showing the entire discovery inventory");
}

function validateCatalogueContract() {
  let directory;
  let solutions;
  let visualPrototype;
  try {
    directory = JSON.parse(fs.readFileSync(productDirectoryPath, "utf8"));
    solutions = JSON.parse(fs.readFileSync(solutionDirectoryPath, "utf8"));
    visualPrototype = JSON.parse(fs.readFileSync(visualPrototypeMediaPath, "utf8"));
  } catch (error) {
    fail("catalogue contract sources", "Could not parse product, solution, or visual-prototype data", { error: error.message });
    return;
  }
  const products = Array.isArray(directory.products) ? directory.products : [];
  const solutionItems = Array.isArray(solutions.solutions) ? solutions.solutions : [];
  const reviewRecords = Array.isArray(visualPrototype.records) ? visualPrototype.records : [];
  const reviewByProduct = new Map(reviewRecords.map((record) => [record.id, record]));
  const reviewStatusCounts = Object.fromEntries(["USE_EXISTING_REFERENCE", "DIAGRAM", "SOURCE_REQUIRED"].map((status) => [status, reviewRecords.filter((record) => record.status === status).length]));
  const reviewHeaders = existsArtifact("_headers") ? readArtifact("_headers") : "";
  const reviewHome = existsArtifact("index.html") ? readArtifact("index.html") : "";
  const reviewProducts = existsArtifact("products/index.html") ? readArtifact("products/index.html") : "";
  const reviewModeNoindex = /X-Robots-Tag:\s*noindex, nofollow, noarchive/i.test(reviewHeaders) && /<meta name="robots" content="noindex, nofollow, noarchive">/i.test(reviewHome) && /<meta name="robots" content="noindex, nofollow, noarchive">/i.test(reviewProducts);
  const missingReviewAssets = reviewRecords.filter((record) => record.image && !existsArtifact(String(record.image).replace(/^\/+/, ""))).map((record) => ({ id: record.id, image: record.image }));
  if (reviewRecords.length === 17 && reviewStatusCounts.USE_EXISTING_REFERENCE === 11 && reviewStatusCounts.DIAGRAM === 6 && reviewStatusCounts.SOURCE_REQUIRED === 0 && reviewModeNoindex && !missingReviewAssets.length)
    pass("noindex visual prototype media contract", { records: reviewRecords.length, ...reviewStatusCounts });
  else fail("noindex visual prototype media contract", "Expected 11 labelled existing references and 6 deterministic diagrams in a noindex-only review artifact", { records: reviewRecords.length, reviewStatusCounts, reviewModeNoindex, missingReviewAssets });
  const productSlugs = products.map((product) => product.slug || product.id);
  const productIds = products.map((product) => product.id);
  const solutionSlugs = solutionItems.map((solution) => solution.slug);
  const missingProductSlugs = expectedProductSlugs.filter((slug) => !productSlugs.includes(slug));
  const extraProductSlugs = productSlugs.filter((slug) => !expectedProductSlugs.includes(slug));
  if (products.length === 17 && new Set(productIds).size === 17 && new Set(productSlugs).size === 17 && !missingProductSlugs.length && !extraProductSlugs.length)
    pass("exact product catalogue contract", { products: products.length });
  else fail("exact product catalogue contract", "Expected exactly 17 unique active product routes", { products: products.length, missingProductSlugs, extraProductSlugs });
  const systemCounts = Object.fromEntries(["wood", "steel", "electronics"].map((system) => [system, products.filter((product) => product.system === system).length]));
  if (systemCounts.wood === 12 && systemCounts.steel === 2 && systemCounts.electronics === 3) pass("three-system catalogue partition", systemCounts);
  else fail("three-system catalogue partition", "Product routes must remain separated as 12 wood, 2 steel, and 3 electronics routes", systemCounts);
  const missingSolutionSlugs = expectedSolutionSlugs.filter((slug) => !solutionSlugs.includes(slug));
  const extraSolutionSlugs = solutionSlugs.filter((slug) => !expectedSolutionSlugs.includes(slug));
  if (solutionItems.length === 8 && new Set(solutionSlugs).size === 8 && !missingSolutionSlugs.length && !extraSolutionSlugs.length)
    pass("exact solution contract", { solutions: solutionItems.length });
  else fail("exact solution contract", "Expected exactly 8 unique solution routes", { solutions: solutionItems.length, missingSolutionSlugs, extraSolutionSlugs });

  const allowedStatuses = new Set(["Current RFQ Route", "Project-Specific Qualification", "Reference Only", "In stock"]);
  const invalidStatuses = products.filter((product) => !allowedStatuses.has(product.publicStatus)).map((product) => ({ id: product.id, status: product.publicStatus }));
  if (!invalidStatuses.length) pass("public product status vocabulary");
  else fail("public product status vocabulary", "Product status labels must use the controlled vocabulary", { invalidStatuses });
  const actualStocked = new Set(products.filter((product) => product.publicStatus === "In stock").map((product) => product.id));
  const missingStocked = [...stockedProductIds].filter((id) => !actualStocked.has(id));
  const extraStocked = [...actualStocked].filter((id) => !stockedProductIds.has(id));
  const weakStockNotes = products.filter((product) => stockedProductIds.has(product.id) && (!/in stock/i.test(product.stockNote || product.commercialNotes || "") || !/confirmed against the RFQ|confirmed separately/i.test(product.stockNote || product.commercialNotes || ""))).map((product) => product.id);
  if (!missingStocked.length && !extraStocked.length && !weakStockNotes.length) pass("family-level stock wording", { stockedFamilies: actualStocked.size });
  else fail("family-level stock wording", "Only the confirmed families may carry qualified public stock wording", { missingStocked, extraStocked, weakStockNotes });

  const approvedMediaStates = new Set(["APPROVED_REAL", "APPROVED_EDITED_REAL", "APPROVED_DIAGRAM", "USE_EXISTING"]);
  const knownMediaStates = new Set([...approvedMediaStates, "EXISTING_REVIEW_ASSET", "DIAGRAM", "SOURCE_REQUIRED", "OMIT"]);
  const unknownMediaStates = products.filter((product) => !knownMediaStates.has(product.mediaStatus)).map((product) => ({ id: product.id, mediaStatus: product.mediaStatus }));
  const catalogueFiles = [
    "index.html",
    "explore/index.html",
    "products/index.html",
    ...expectedProductSlugs.map((slug) => `products/${slug}/index.html`),
    ...expectedSolutionSlugs.map((slug) => `solutions/${slug}/index.html`),
  ].filter(existsArtifact);
  const catalogueText = catalogueFiles.map((file) => ({ file, text: readArtifact(file) }));
  const publicDirectory = existsArtifact("data/product-directory.json") ? JSON.parse(readArtifact("data/product-directory.json")) : { products: [] };
  const publicProducts = new Map((publicDirectory.products || []).map((product) => [product.id, product]));
  const mediaVariants = (assetPath) => {
    const relative = String(assetPath || "").replace(/^\/+/, "");
    const parsed = path.parse(relative);
    return [".webp", ".avif", ".png", ".jpg", ".jpeg", ".svg"].map((extension) => path.join(parsed.dir, `${parsed.name}${extension}`).replace(/\\/g, "/"));
  };
  const unapprovedMediaUses = [];
  const allowedReviewFiles = new Set([
    "index.html",
    "products/index.html",
    "explore/index.html",
    "solutions/index.html",
    ...expectedProductSlugs.map((slug) => `products/${slug}/index.html`),
    ...expectedSolutionSlugs.map((slug) => `solutions/${slug}/index.html`),
  ]);
  const reviewAssetPaths = new Set(reviewRecords.filter((record) => ["USE_EXISTING_REFERENCE", "DIAGRAM", "VIDEO_THUMBNAIL"].includes(record.status)).map((record) => record.image).filter(Boolean));
  productMediaRegister = products.map((product) => {
    const slug = product.slug || product.id;
    const relativePath = `products/${slug}/index.html`;
    const html = existsArtifact(relativePath) ? readArtifact(relativePath) : "";
    const approved = approvedMediaStates.has(product.mediaStatus);
    const reviewRecord = reviewByProduct.get(product.id);
    const reviewReferenceAllowed = Boolean(reviewModeNoindex && ["USE_EXISTING_REFERENCE", "DIAGRAM", "VIDEO_THUMBNAIL"].includes(reviewRecord?.status) && reviewRecord.image === product.image);
    const publicProduct = publicProducts.get(product.id);
    const publishedCandidateAssets = product.image ? mediaVariants(product.image).filter(existsArtifact) : [];
    if (!approved && product.image) {
      for (const entry of catalogueText) {
        if (entry.text.includes(product.image) && !(reviewReferenceAllowed && allowedReviewFiles.has(entry.file) && /representative (?:image|product|family)|route diagram/i.test(entry.text)))
          unapprovedMediaUses.push({ id: product.id, file: entry.file, image: product.image });
      }
      if (publishedCandidateAssets.length && !reviewReferenceAllowed) unapprovedMediaUses.push({ id: product.id, file: "public-site/images", image: product.image, publishedCandidateAssets });
      if (publicProduct?.image) unapprovedMediaUses.push({ id: product.id, file: "data/product-directory.json", image: publicProduct.image });
    }
    if (!approved && !reviewReferenceAllowed && !html.includes('data-media-state="text-first-product-page"')) unapprovedMediaUses.push({ id: product.id, file: relativePath, image: "missing text-first placeholder" });
    if (reviewReferenceAllowed && (!html.includes(product.image) || !html.includes('data-media-state="noindex-review-reference"'))) unapprovedMediaUses.push({ id: product.id, file: relativePath, image: "labelled noindex review reference is missing" });
    if (approved && (!product.image || !html.includes(product.image))) unapprovedMediaUses.push({ id: product.id, file: relativePath, image: "approved image is missing" });
    return {
      productId: product.id,
      route: `/products/${slug}/`,
      sourceImage: product.image || null,
      mediaStatus: product.mediaStatus || null,
      publicationDecision: approved ? "published-approved-media" : reviewReferenceAllowed ? "published-noindex-review-reference" : product.mediaStatus === "OMIT" ? "omitted" : "omitted-pending-approval",
      publicArtifactContainsSourceImage: Boolean(product.image && (html.includes(product.image) || publicProduct?.image)),
      publishedCandidateAssets,
    };
  });
  const leakedLegacyMedia = legacyReviewMedia.filter((assetPath) => !reviewAssetPaths.has(assetPath)).flatMap((assetPath) => mediaVariants(assetPath).filter(existsArtifact));
  if (leakedLegacyMedia.length) unapprovedMediaUses.push({ id: "legacy-review-media", file: "public-site/images", publishedCandidateAssets: [...new Set(leakedLegacyMedia)] });
  const policyFiles = ["site.webmanifest", "robots.txt"].filter(existsArtifact).map((file) => ({ file, text: readArtifact(file) }));
  const staleMediaReferences = policyFiles.flatMap((entry) => legacyReviewMedia.filter((assetPath) => entry.text.includes(assetPath)).map((assetPath) => ({ file: entry.file, assetPath })));
  if (staleMediaReferences.length) unapprovedMediaUses.push({ id: "stale-policy-reference", references: staleMediaReferences });
  if (existsArtifact("sitemap-images.xml") || (existsArtifact("robots.txt") && /sitemap-images\.xml/i.test(readArtifact("robots.txt")))) unapprovedMediaUses.push({ id: "stale-image-sitemap", file: "sitemap-images.xml or robots.txt" });
  if (!unknownMediaStates.length && !unapprovedMediaUses.length) pass("product media fail-closed", { routes: productMediaRegister.length, publishedApprovedMedia: productMediaRegister.filter((item) => item.publicationDecision === "published-approved-media").length, publishedNoindexReviewReferences: productMediaRegister.filter((item) => item.publicationDecision === "published-noindex-review-reference").length, productPagesUseLabelledNoindexReferences: productMediaRegister.every((item) => item.publicationDecision === "published-approved-media" || item.publicationDecision === "published-noindex-review-reference") });
  else fail("product media fail-closed", "Unapproved, stale, or unknown product media must not render or ship in the public artifact", { unknownMediaStates, unapprovedMediaUses });

  const productPageFailures = [];
  for (const product of products) {
    const slug = product.slug || product.id;
    const relativePath = `products/${slug}/index.html`;
    if (!existsArtifact(relativePath)) {
      productPageFailures.push({ slug, issue: "missing artifact" });
      continue;
    }
    const html = readArtifact(relativePath);
    const canonical = `https://moldartindia.com/products/${slug}/`;
    if (!html.includes(`href="${canonical}"`)) productPageFailures.push({ slug, issue: "missing self-canonical" });
    if ((html.match(/<h1\b/gi) || []).length !== 1) productPageFailures.push({ slug, issue: "expected one H1" });
    for (const marker of ["Scope and boundary", "RFQ readiness", "Evidence and release controls"]) if (!html.includes(marker)) productPageFailures.push({ slug, issue: `missing ${marker}` });
    if (/"@type"\s*:\s*"Offer"|https:\/\/schema\.org\/InStock/i.test(html)) productPageFailures.push({ slug, issue: "structured Offer/InStock is forbidden" });
    if (/"brand"\s*:\s*\{[^}]*"name"\s*:\s*"Moldart"/i.test(html)) productPageFailures.push({ slug, issue: "unsupported Moldart product brand" });
  }
  if (!productPageFailures.length) pass("product page controls", { checked: products.length });
  else fail("product page controls", "Product pages are missing required route, RFQ, evidence, or schema controls", { productPageFailures });

  const solutionPageFailures = solutionItems.flatMap((solution) => {
    const relativePath = `solutions/${solution.slug}/index.html`;
    if (!existsArtifact(relativePath)) return [{ slug: solution.slug, issue: "missing artifact" }];
    const html = readArtifact(relativePath);
    const failures = [];
    if (!html.includes(`href="https://moldartindia.com/solutions/${solution.slug}/"`)) failures.push({ slug: solution.slug, issue: "missing self-canonical" });
    if ((html.match(/<h1\b/gi) || []).length !== 1) failures.push({ slug: solution.slug, issue: "expected one H1" });
    return failures;
  });
  if (!solutionPageFailures.length) pass("solution page controls", { checked: solutionItems.length });
  else fail("solution page controls", "Solution routes are incomplete", { solutionPageFailures });

  const search = existsArtifact("data/search-index.json") ? JSON.parse(readArtifact("data/search-index.json")) : [];
  const searchUrls = new Set(search.map((item) => item.url));
  const missingSearchProducts = expectedProductSlugs.filter((slug) => ![...searchUrls].some((url) => url === `/products/${slug}/` || url.startsWith(`/products/${slug}/?`)));
  const missingSearchSolutions = expectedSolutionSlugs.filter((slug) => !searchUrls.has(`/solutions/${slug}/`));
  const legacySearchRoutes = Object.keys(legacyProductRedirects).filter((slug) => [...searchUrls].some((url) => url.startsWith(`/products/${slug}/`)));
  if (!missingSearchProducts.length && !missingSearchSolutions.length && !legacySearchRoutes.length) pass("catalogue search coverage", { products: expectedProductSlugs.length, solutions: expectedSolutionSlugs.length });
  else fail("catalogue search coverage", "Search must cover active routes and exclude legacy products", { missingSearchProducts, missingSearchSolutions, legacySearchRoutes });

  const homepage = existsArtifact("index.html") ? readArtifact("index.html") : "";
  if (homepage.includes("ONE RFQ PATH FOR WOOD, STEEL + ELECTRONICS.")) pass("approved homepage headline");
  else fail("approved homepage headline", "The approved Wood, Steel + Electronics H1 is missing");
  const evidence = existsArtifact("evidence-qc/index.html") ? readArtifact("evidence-qc/index.html") : "";
  if (evidence.includes("Evidence states") && evidence.includes("Sample control") && evidence.includes("Document applicability") && evidence.includes("QC sequence")) pass("evidence and QC control page");
  else fail("evidence and QC control page", "Evidence & QC must distinguish evidence, samples, documents, and inspection stages");
  const process = existsArtifact("process/index.html") ? readArtifact("process/index.html") : "";
  if (process.includes("DEFINE. QUALIFY. APPROVE. SUPPLY.") && process.includes("Decision gates")) pass("process control page");
  else fail("process control page", "Process must expose the defined four-stage control sequence");
  const contact = existsArtifact("contact/index.html") ? readArtifact("contact/index.html") : "";
  const contactFields = ["inquiry_route", "interest", "application", "quantity_context", "target_timing", "destination", "incoterm", "files_available", "privacy_accepted"];
  const missingContactFields = contactFields.filter((field) => !contact.includes(`name="${field}"`));
  if (!missingContactFields.length && contact.includes("Supplier Capability Introduction") && contact.includes("Buyer RFQ")) pass("branching RFQ contact controls");
  else fail("branching RFQ contact controls", "Contact must preserve buyer, supplier, and general routing with trade fields and consent", { missingContactFields });
}

function validatePlannedProductScope() {
  if (!fs.existsSync(plannedProductScopePath)) {
    fail("private planned product scope", "internal/planned-product-scope.json is missing");
    return;
  }
  let scope;
  let directory;
  try {
    scope = JSON.parse(fs.readFileSync(plannedProductScopePath, "utf8"));
    directory = JSON.parse(fs.readFileSync(productDirectoryPath, "utf8"));
  } catch (error) {
    fail("private planned product scope", "Could not parse private product scope or product directory", { error: error.message });
    return;
  }
  const systems = Array.isArray(scope.systems) ? scope.systems : [];
  const productIds = new Set((directory.products || []).map((product) => product.id));
  const mappedIds = systems.flatMap((system) => system.publicProductIds || []);
  const unknownPublicIds = mappedIds.filter((id) => !productIds.has(id));
  const missingPublicIds = [...productIds].filter((id) => !mappedIds.includes(id));
  const duplicatePublicIds = mappedIds.filter((id, index, values) => values.indexOf(id) !== index);
  const withheldWithPublicIds = systems.filter((system) => system.coverageStatus === "withheld-pending-evidence" && (system.publicProductIds || []).length);
  const duplicateIds = systems.map((system) => system.id).filter((id, index, values) => values.indexOf(id) !== index);
  const scopeText = fs.readFileSync(plannedProductScopePath, "utf8");
  if (systems.length === 8 && !duplicateIds.length) pass("planned product system inventory", { systems: systems.length });
  else fail("planned product system inventory", "Expected exactly 8 unique planned product systems", { systems: systems.length, duplicateIds });
  if (!unknownPublicIds.length && !missingPublicIds.length && !duplicatePublicIds.length && new Set(mappedIds).size === 17) pass("planned product public mappings", { mappedProducts: new Set(mappedIds).size });
  else fail("planned product public mappings", "Private scope must map each of the 17 public products exactly once", { unknownPublicIds, missingPublicIds, duplicatePublicIds });
  if (!withheldWithPublicIds.length) pass("conditional products withheld from public catalogue");
  else fail("conditional products withheld from public catalogue", "Withheld systems must not map to public product pages", { systems: withheldWithPublicIds.map((system) => system.id) });
  if (!/(?:\+86\s*\d{6,}|wechat\s*[:：]|[A-Z0-9._%+-]+@(?:qq|163)\.com)/i.test(scopeText)) pass("private supplier contact exclusion");
  else fail("private supplier contact exclusion", "Private scope file must not contain supplier phone, WeChat, or personal mailbox details");
  if (!existsArtifact("internal/planned-product-scope.json") && !existsArtifact("data/planned-product-scope.json")) pass("private scope excluded from public artifact");
  else fail("private scope excluded from public artifact", "Internal product/supplier planning data was copied into the public artifact");
}

function validateSupplierPrivacy() {
  const textFiles = walk(publicDir).filter((file) => /\.(?:html|json|txt|xml|js|css)$/i.test(file));
  const exposed = textFiles.filter((file) => /(?:\+86\s*\d{6,}|wechat\s*[:：]|[A-Z0-9._%+-]+@(?:qq|163)\.com)/i.test(fs.readFileSync(file, "utf8"))).map(rel);
  if (exposed.length) fail("public supplier contact privacy", "Public artifact contains private supplier-contact patterns", { files: exposed.slice(0, 25) });
  else pass("public supplier contact privacy", { checked: textFiles.length });
}

function validateProductClaimRegister() {
  if (!fs.existsSync(productDirectoryPath)) {
    fail("product claim register source", "data/product-directory.json is missing");
    return;
  }
  let directory;
  try {
    directory = JSON.parse(fs.readFileSync(productDirectoryPath, "utf8"));
  } catch (error) {
    fail("product claim register source", "Could not parse product directory", { error: error.message });
    return;
  }
  productClaimRegister = (directory.products || []).flatMap((product) => {
    const entries = [
      { field: "summary", value: product.summary },
      ...(product.specs || []).map((value, index) => ({ field: `spec:${index + 1}`, value })),
      ...(product.applications || []).map((value, index) => ({ field: `application:${index + 1}`, value })),
      { field: "customization", value: product.customization },
      ...(product.technical?.grades || []).map((value, index) => ({ field: `grade:${index + 1}`, value })),
    ].filter((entry) => entry.value);
    return entries.map((entry) => {
      const requirementLed = /requirement-led|required before|confirmed|require(?:s)? separate|reviewed|programme-specific|project-specific|depends on|only against|qualification-only|approval route|final .*confirmed/i.test(entry.value);
      return {
        id: `${product.id}:${entry.field}`,
        productId: product.id,
        productName: product.name,
        sourceField: entry.field,
        publicClaim: entry.value,
        claimType: /\d|%|mm|μm|kg|mpa|hrc|gsm|cycles|grade|ss\s*\d/i.test(entry.value) ? "quantified-or-grade" : "qualitative",
        status: requirementLed ? "requirement-led-public-boundary" : "pending-approved-business-evidence",
        source: null,
        testMethod: null,
        conditions: null,
        productOrLotScope: null,
        revision: null,
        owner: null,
        contractualStatus: null,
      };
    });
  });
  const productCount = new Set(productClaimRegister.map((claim) => claim.productId)).size;
  if (productCount === 17 && productClaimRegister.length > 0) pass("product claim register coverage", { products: productCount, statements: productClaimRegister.length });
  else fail("product claim register coverage", "Expected public claim and boundary statements for all 17 product pages", { products: productCount, statements: productClaimRegister.length });
  const incomplete = productClaimRegister.filter((claim) => claim.status === "pending-approved-business-evidence");
  if (incomplete.length) warn("product claim evidence completion", "Public capability or application statements remain pending approved business evidence", { unresolvedClaims: incomplete.length, requirementLedStatements: productClaimRegister.length - incomplete.length });
  else pass("product claim evidence completion", { approvedOrBoundaryStatements: productClaimRegister.length });
}

function validateProductClaimDisclosure() {
  if (!existsArtifact("sitemap.xml")) return;
  const products = sitemapUrls(readArtifact("sitemap.xml"))
    .map((url) => new URL(url).pathname)
    .filter((pathname) => pathname.startsWith("/products/") && pathname !== "/products/");
  const missingDisclosure = products.filter((pathname) => {
    const file = routeToArtifactPath(pathname);
    return !fs.existsSync(file) || !fs.readFileSync(file, "utf8").includes("ui-claim-notice");
  });
  if (missingDisclosure.length) fail("product claim disclosure", "Every product page must explain its public technical-evidence boundary", { missingDisclosure });
  else pass("product claim disclosure", { checked: products.length });
  const falseAvailability = products.filter((pathname) => fs.readFileSync(routeToArtifactPath(pathname), "utf8").includes("https://schema.org/InStock"));
  if (falseAvailability.length) fail("product structured availability", "Do not declare products InStock without an approved inventory record", { falseAvailability });
  else pass("product structured availability", { checked: products.length });
  const falseBrand = products.filter((pathname) => /"brand"\s*:\s*\{[^}]*"name"\s*:\s*"Moldart"/i.test(fs.readFileSync(routeToArtifactPath(pathname), "utf8")));
  if (falseBrand.length) fail("product structured brand", "Do not describe sourced products as Moldart-branded without approval", { falseBrand });
  else pass("product structured brand", { checked: products.length });
}

function validateLeadFormAccessibility() {
  if (!existsArtifact("lead-forms.js") || !existsArtifact("contact/index.html")) return;
  const script = readArtifact("lead-forms.js");
  const contact = readArtifact("contact/index.html");
  if (script.includes("tone === 'error' ? 'alert' : 'status'") && script.includes("aria-live") && script.includes("aria-atomic")) pass("lead form live-region semantics");
  else fail("lead form live-region semantics", "Submission errors must use an assertive alert while progress and success use polite status updates");
  if (contact.includes("data-lead-form") && contact.includes("privacy_accepted") && contact.includes("consent_context")) pass("contact form consent and status hooks");
  else fail("contact form consent and status hooks", "Contact form is missing lead handling or consent hooks");
}

function validateInsightMedia() {
  const reportPath = path.join(root, "insight-media-coverage.generated.json");
  if (!fs.existsSync(reportPath)) {
    fail("insight media report", "insight-media-coverage.generated.json is missing");
    return;
  }
  const media = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const counts = media.counts || {};
  if (counts.publishedInsights === 51 && counts.insightsWithImage === 51) pass("insight media counts", counts);
  else fail("insight media counts", "Expected 51 published insights with 51 visible covers", counts);
  mediaRightsRegister = (media.selectedInsightMedia || []).map((item) => {
    const deterministic = item.mediaStatus === "DETERMINISTIC_DIAGRAM" && item.imageSource === "deterministic-poster";
    return {
      slug: item.slug,
      cover: item.image,
      declaredMediaStatus: item.mediaStatus || null,
      selectedVideo: item.selectedVideo?.url || null,
      status: deterministic ? "approved-deterministic-diagram" : "pending-rights-and-provenance-approval",
      rightsOwner: deterministic ? "Moldart website generator" : null,
      licenceOrPermission: deterministic ? "First-party generated website artwork" : null,
      sourceRecord: deterministic ? "generate.js insight poster" : null,
      approvalOwner: deterministic ? "automated release gate" : null,
      approvedAt: deterministic ? new Date().toISOString() : null,
    };
  });
  const badPages = (media.selectedInsightMedia || []).filter((item) => {
    const file = artifactPath(`insights/${item.slug}/index.html`);
    if (!fs.existsSync(file)) return true;
    const html = fs.readFileSync(file, "utf8");
    const cards = (html.match(/class="youtube-card"/g) || []).length;
    if (!html.includes("article-cover-card") || !html.includes("article-cover-caption")) return true;
    if (!item.selectedVideo) return cards !== 0;
    return cards !== 1 || !html.includes(item.selectedVideo.url) || /Integrated Precision for Wood and Steel/i.test(item.selectedVideo.title || "");
  });
  if (badPages.length) fail("rendered insight media", "Each guide must have a labelled cover; videos may render only when directly and specifically mapped", { slugs: badPages.map((item) => item.slug) });
  else pass("rendered insight media", { checked: media.selectedInsightMedia?.length || 0, directlyMappedVideos: counts.insightsWithVideo || 0 });
  const pendingMediaRecords = mediaRightsRegister.filter((item) => item.status === "pending-rights-and-provenance-approval");
  if (pendingMediaRecords.length) warn("media rights and provenance completion", "Non-deterministic media still require business approval", { pendingMediaRecords: pendingMediaRecords.length });
  else pass("media rights and provenance completion", { deterministicFirstPartyCovers: mediaRightsRegister.length, pendingMediaRecords: 0 });
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, "moldart-artifact-release-gate-report.json");
  const mdPath = path.join(reportDir, "moldart-artifact-release-gate-report.md");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  const claimJsonPath = path.join(reportDir, "product-claim-evidence-register.json");
  const claimMdPath = path.join(reportDir, "product-claim-evidence-register.md");
  const productMediaJsonPath = path.join(reportDir, "product-media-integration-register.json");
  const reviewJsonPath = path.join(reportDir, "insight-technical-review-register.json");
  const mediaJsonPath = path.join(reportDir, "media-rights-provenance-register.json");
  fs.writeFileSync(claimJsonPath, JSON.stringify({ generatedAt: report.generatedAt, status: productClaimRegister.every((claim) => claim.status === "approved") ? "approved" : "pending-business-evidence", claims: productClaimRegister }, null, 2), "utf8");
  const claimLines = [
    "# Product Claim Evidence Register",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "This register inventories public product specification claims. Null evidence fields are intentional blockers; they must be completed and approved by the business or a competent technical owner rather than inferred from website copy.",
    "",
    "| ID | Product | Public claim | Type | Status |",
    "|---|---|---|---|---|",
    ...productClaimRegister.map((claim) => `| ${claim.id} | ${claim.productName} | ${String(claim.publicClaim).replace(/\|/g, "\\|")} | ${claim.claimType} | ${claim.status} |`),
  ];
  fs.writeFileSync(claimMdPath, `${claimLines.join("\n")}\n`, "utf8");
  fs.writeFileSync(productMediaJsonPath, JSON.stringify({ generatedAt: report.generatedAt, policy: "Only approved real, edited-real, approved-diagram, or rights-recorded USE_EXISTING media may render. All other product media is omitted.", products: productMediaRegister }, null, 2), "utf8");
  fs.writeFileSync(reviewJsonPath, JSON.stringify({ generatedAt: report.generatedAt, status: insightTechnicalReviewRegister.every((item) => item.status === "approved") ? "approved" : "pending-human-review", guides: insightTechnicalReviewRegister }, null, 2), "utf8");
  fs.writeFileSync(mediaJsonPath, JSON.stringify({ generatedAt: report.generatedAt, status: mediaRightsRegister.every((item) => item.status === "approved") ? "approved" : "pending-rights-and-provenance-approval", media: mediaRightsRegister }, null, 2), "utf8");
  const lines = [
    "# Moldart Artifact Release Gate",
    "",
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    "",
    "## Result",
    "",
    report.failures.length ? `FAIL (${report.failures.length})` : "PASS",
    "",
    "## Checks",
    "",
    ...report.checks.map((check) => `- ${String(check.status || "unknown").toUpperCase()} ${check.name}${check.message ? `: ${check.message}` : ""}`),
    "",
    "## Guardrail",
    "",
    "This release gate is local and no-deploy. It validates the generated public artifact only.",
  ];
  fs.writeFileSync(mdPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Artifact release gate report: ${rel(jsonPath)}`);
  console.log(`Artifact release gate summary: ${rel(mdPath)}`);
  console.log(`Product claim evidence register: ${rel(claimJsonPath)}`);
  console.log(`Product media integration register: ${rel(productMediaJsonPath)}`);
  console.log(`Insight technical review register: ${rel(reviewJsonPath)}`);
  console.log(`Media rights/provenance register: ${rel(mediaJsonPath)}`);
}

function main() {
  validateRequiredFiles();
  validateForbiddenFiles();
  validateSitemap();
  validateLlms();
  validateHeadersAndRedirects();
  validateInsightContentIntegrity();
  validateDiscoveryIntegrity();
  validateCatalogueContract();
  validatePlannedProductScope();
  validateSupplierPrivacy();
  validateProductClaimRegister();
  validateProductClaimDisclosure();
  validateLeadFormAccessibility();
  validateInsightMedia();
  writeReports();
  if (report.failures.length) process.exit(1);
}

main();
