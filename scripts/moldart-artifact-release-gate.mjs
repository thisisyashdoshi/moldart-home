#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public-site");
const reportDir = path.join(root, ".tmp");
const insightContractPath = path.join(root, "data", "insight-url-contract.json");
const productDirectoryPath = path.join(root, "data", "product-directory.json");
const plannedProductScopePath = path.join(root, "internal", "planned-product-scope.json");
let productClaimRegister = [];
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
    "insights/index.html",
    "resources/index.html",
    "contact/index.html",
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
  if (fs.existsSync(path.join(publicDir, "process"))) fail("process artifact", "public-site/process should not be shipped; use contact redirect instead");
  else pass("process artifact excluded");
}

function validateSitemap() {
  if (!existsArtifact("sitemap.xml")) return;
  const urls = sitemapUrls(readArtifact("sitemap.xml"));
  const insightUrls = urls.filter((url) => url.includes("/insights/"));
  const productUrls = urls.filter((url) => url.includes("/products/"));
  const solutionUrls = urls.filter((url) => url.includes("/solutions/"));
  if (urls.length === 84) pass("sitemap url count", { actual: urls.length });
  else fail("sitemap url count", "Expected 84 public URLs including Privacy and Terms", { actual: urls.length });
  if (urls.includes("https://moldartindia.com/privacy/") && urls.includes("https://moldartindia.com/terms/"))
    pass("sitemap legal routes");
  else fail("sitemap legal routes", "Privacy and Terms must both be present in the sitemap");
  if (insightUrls.length === 52) pass("sitemap insight url count", { actual: insightUrls.length });
  else fail("sitemap insight url count", "Expected insight index plus 51 insight pages", { actual: insightUrls.length });
  if (productUrls.length === 17) pass("sitemap product url count", { actual: productUrls.length });
  else fail("sitemap product url count", "Expected product hub plus 16 product pages", { actual: productUrls.length });
  if (solutionUrls.length === 7) pass("sitemap solution url count", { actual: solutionUrls.length });
  else fail("sitemap solution url count", "Expected solution index plus 6 solution pages", { actual: solutionUrls.length });
  const wwwUrls = urls.filter((url) => url.includes("www.moldartindia.com"));
  if (wwwUrls.length) fail("sitemap canonical host", "Sitemap should use apex moldartindia.com", { urls: wwwUrls.slice(0, 10) });
  else pass("sitemap canonical host");
  const missing = urls
    .map((url) => new URL(url).pathname)
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
    if (/^\/process\/\s+\/contact\/#after-rfq\s+301/m.test(redirects)) pass("process redirect");
    else fail("process redirect", "Expected /process/ to redirect to Contact after-RFQ context");
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
    if (html.includes("article-cover-caption") && html.includes("ILLUSTRATIVE RENDER")) pass(`insight media status ${slug}`);
    else fail(`insight media status ${slug}`, "Every current rendered cover must be visibly labelled as illustrative until evidence-backed media is supplied");
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
  const unknownPublicIds = systems.flatMap((system) => system.publicProductIds || []).filter((id) => !productIds.has(id));
  const withheldWithPublicIds = systems.filter((system) => system.coverageStatus === "withheld-pending-evidence" && (system.publicProductIds || []).length);
  const duplicateIds = systems.map((system) => system.id).filter((id, index, values) => values.indexOf(id) !== index);
  const scopeText = fs.readFileSync(plannedProductScopePath, "utf8");
  if (systems.length === 8 && !duplicateIds.length) pass("planned product system inventory", { systems: systems.length });
  else fail("planned product system inventory", "Expected exactly 8 unique planned product systems", { systems: systems.length, duplicateIds });
  if (!unknownPublicIds.length) pass("planned product public mappings", { mappedProducts: new Set(systems.flatMap((system) => system.publicProductIds || [])).size });
  else fail("planned product public mappings", "Planned systems reference unknown public product IDs", { unknownPublicIds });
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
  if (productCount === 16 && productClaimRegister.length > 0) pass("product claim register coverage", { products: productCount, statements: productClaimRegister.length });
  else fail("product claim register coverage", "Expected public claim and boundary statements for all 16 product pages", { products: productCount, statements: productClaimRegister.length });
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
  mediaRightsRegister = (media.selectedInsightMedia || []).map((item) => ({
    slug: item.slug,
    cover: item.image,
    declaredMediaStatus: item.mediaStatus || null,
    selectedVideo: item.selectedVideo?.url || null,
    status: "pending-rights-and-provenance-approval",
    rightsOwner: null,
    licenceOrPermission: null,
    sourceRecord: null,
    approvalOwner: null,
    approvedAt: null,
  }));
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
  warn("media rights and provenance completion", "Illustrative labels prevent evidence misuse, but rights/provenance still require business approval", { pendingMediaRecords: mediaRightsRegister.length });
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, "moldart-artifact-release-gate-report.json");
  const mdPath = path.join(reportDir, "moldart-artifact-release-gate-report.md");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  const claimJsonPath = path.join(reportDir, "product-claim-evidence-register.json");
  const claimMdPath = path.join(reportDir, "product-claim-evidence-register.md");
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
