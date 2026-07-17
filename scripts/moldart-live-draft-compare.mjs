#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const reportDir = path.join(root, ".tmp");
const args = process.argv.slice(2);

const liveBase = argValue("--live") || "https://moldartindia.com";
const draftBase = argValue("--draft") || "http://127.0.0.1:4173";
const alternateLiveBase = liveBase.includes("//www.")
  ? liveBase.replace("//www.", "//")
  : liveBase.replace("//", "//www.");
const routes = [
  "/",
  "/products/",
  "/solutions/",
  "/resources/",
  "/insights/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
];
const pageRoutes = [
  "/",
  "/products/",
  "/resources/",
  "/insights/",
  "/contact/",
  "/privacy/",
  "/terms/",
];

function argValue(name) {
  const exact = args.find((arg) => arg.startsWith(`${name}=`));
  return exact ? exact.slice(name.length + 1).replace(/\/$/, "") : "";
}

function joinUrl(base, route) {
  return `${base.replace(/\/$/, "")}${route}`;
}

function textBetween(html, regex) {
  const match = html.match(regex);
  return match ? cleanup(match[1]) : "";
}

function cleanup(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .trim();
}

function metaContent(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return textBetween(html, new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"));
}

function canonical(html) {
  return textBetween(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i);
}

function title(html) {
  return textBetween(html, /<title>(.*?)<\/title>/is);
}

function h1(html) {
  return cleanup(textBetween(html, /<h1[^>]*>(.*?)<\/h1>/is).replace(/<[^>]+>/g, " "));
}

function sitemapCounts(xml) {
  const urls = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
  return {
    total: urls.length,
    insights: urls.filter((url) => url.includes("/insights/")).length,
    products: urls.filter((url) => url.includes("/products/")).length,
    solutions: urls.filter((url) => url.includes("/solutions/")).length,
    firstUrl: urls[0] || "",
  };
}

async function fetchText(base, route) {
  const url = joinUrl(base, route);
  const response = await fetch(url, { redirect: "follow" });
  const text = await response.text();
  return { url, status: response.status, ok: response.ok, finalUrl: response.url, text, headers: Object.fromEntries(response.headers.entries()) };
}

async function routeStatuses(base) {
  const results = [];
  for (const route of routes) {
    try {
      const result = await fetchText(base, route);
      results.push({ route, status: result.status, ok: result.ok, finalUrl: result.finalUrl });
    } catch (error) {
      results.push({ route, status: 0, ok: false, error: error.message });
    }
  }
  return results;
}

async function pageMeta(base) {
  const rows = [];
  for (const route of pageRoutes) {
    try {
      const result = await fetchText(base, route);
      rows.push({
        route,
        status: result.status,
        title: title(result.text),
        h1: h1(result.text),
        description: metaContent(result.text, "description"),
        canonical: canonical(result.text),
        ogTitle: metaContent(result.text, "og:title"),
        twitterCard: metaContent(result.text, "twitter:card"),
        youtubePanels: (result.text.match(/youtube-panel/g) || []).length,
      });
    } catch (error) {
      rows.push({ route, status: 0, error: error.message });
    }
  }
  return rows;
}

async function baseHeaders(base) {
  try {
    const result = await fetchText(base, "/");
    const h = result.headers;
    return {
      status: result.status,
      finalUrl: result.finalUrl,
      cacheControl: h["cache-control"] || "",
      cfCacheStatus: h["cf-cache-status"] || "",
      strictTransportSecurity: h["strict-transport-security"] || "",
      contentSecurityPolicy: h["content-security-policy"] || "",
      xFrameOptions: h["x-frame-options"] || "",
      xContentTypeOptions: h["x-content-type-options"] || "",
      referrerPolicy: h["referrer-policy"] || "",
      permissionsPolicy: h["permissions-policy"] || "",
    };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function sitemapSummary(base) {
  try {
    const result = await fetchText(base, "/sitemap.xml");
    return { status: result.status, ...sitemapCounts(result.text) };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

function summarizeGaps(report) {
  const gaps = [];
  const liveRoute = (route) => report.live.routes.find((row) => row.route === route);
  const draftRoute = (route) => report.draft.routes.find((row) => row.route === route);
  for (const route of routes) {
    if (draftRoute(route)?.ok && !liveRoute(route)?.ok)
      gaps.push(`Draft route ${route} is ready but is not present on the unchanged production site.`);
  }
  if (!liveRoute("/llms.txt")?.ok || !report.liveAlternate.llmsTxt?.ok) gaps.push("Live /llms.txt is not stable across checked apex/www GET paths; draft has stable 200.");
  if (!liveRoute("/llms-full.txt")?.ok || !report.liveAlternate.llmsFullTxt?.ok) gaps.push("Live /llms-full.txt is missing or unstable across checked apex/www GET paths; draft has stable 200.");
  if (report.liveAlternate.llmsTxt?.headStatus && report.liveAlternate.llmsTxt.status !== report.liveAlternate.llmsTxt.headStatus) gaps.push("Live /llms.txt differs between GET and HEAD on the alternate host.");
  if (report.liveAlternate.llmsFullTxt?.headStatus && report.liveAlternate.llmsFullTxt.status !== report.liveAlternate.llmsFullTxt.headStatus) gaps.push("Live /llms-full.txt differs between GET and HEAD on the alternate host.");
  if (report.live.sitemap.firstUrl.includes("www.moldartindia.com")) gaps.push("Live sitemap uses www while runtime redirects to apex.");
  if ((report.live.sitemap.total || 0) < (report.draft.sitemap.total || 0)) gaps.push("Live sitemap has fewer public routes than draft.");
  if (!report.live.headers.strictTransportSecurity) gaps.push("Live homepage response is missing visible HSTS.");
  if (!report.live.headers.contentSecurityPolicy) gaps.push("Live homepage response is missing visible CSP.");
  if (!report.live.headers.xFrameOptions) gaps.push("Live homepage response is missing visible X-Frame-Options.");
  const liveCsp = report.live.headers.contentSecurityPolicy || "";
  const draftCsp = report.draft.headers.contentSecurityPolicy || "";
  if (liveCsp.includes("'unsafe-inline'") && draftCsp && !draftCsp.includes("'unsafe-inline'"))
    gaps.push("Draft CSP removes unsafe-inline allowances still present on production.");
  for (const page of report.live.pages) {
    if (!page.ogTitle) gaps.push(`Live ${page.route} is missing og:title.`);
    if (!page.twitterCard) gaps.push(`Live ${page.route} is missing twitter:card.`);
  }
  if (!draftRoute("/llms-full.txt")?.ok) gaps.push("Draft /llms-full.txt is not reachable; preview/build must be fixed before sharing.");
  return gaps;
}

function summarizeDifferences(report) {
  const differences = [];
  const fields = ["status", "title", "h1", "description", "canonical", "ogTitle", "twitterCard"];
  for (const draftPage of report.draft.pages) {
    const livePage = report.live.pages.find((page) => page.route === draftPage.route);
    if (!livePage) {
      differences.push({ route: draftPage.route, field: "page", live: "missing", draft: "present" });
      continue;
    }
    for (const field of fields) {
      if (String(livePage[field] ?? "") !== String(draftPage[field] ?? "")) {
        differences.push({
          route: draftPage.route,
          field,
          live: livePage[field] ?? "",
          draft: draftPage[field] ?? "",
        });
      }
    }
  }
  for (const field of ["total", "insights", "products", "solutions"]) {
    if (Number(report.live.sitemap[field] || 0) !== Number(report.draft.sitemap[field] || 0)) {
      differences.push({
        route: "/sitemap.xml",
        field,
        live: report.live.sitemap[field] || 0,
        draft: report.draft.sitemap[field] || 0,
      });
    }
  }
  return differences;
}

function markdownCell(value) {
  const text = String(value ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
  return text.length > 120 ? `${text.slice(0, 117)}...` : text || "—";
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, "moldart-live-draft-compare-report.json");
  const mdPath = path.join(reportDir, "moldart-live-draft-compare-report.md");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const differenceLines = report.differences.length
    ? [
        "| Route | Field | Live | Draft |",
        "|---|---|---|---|",
        ...report.differences.map(
          (item) =>
            `| ${markdownCell(item.route)} | ${markdownCell(item.field)} | ${markdownCell(item.live)} | ${markdownCell(item.draft)} |`,
        ),
      ]
    : ["- No measured content or sitemap differences found."];

  const lines = [
    "# Moldart Live vs Draft Comparison",
    "",
    `Generated: ${report.generatedAt}`,
    `Live: ${report.live.base}`,
    `Draft: ${report.draft.base}`,
    `Live alternate check: ${report.liveAlternate.base}`,
    "",
    "## Route Status",
    "",
    "| Route | Live | Draft |",
    "|---|---:|---:|",
    ...routes.map((route) => {
      const live = report.live.routes.find((row) => row.route === route);
      const draft = report.draft.routes.find((row) => row.route === route);
      return `| ${route} | ${live?.status || "ERR"} | ${draft?.status || "ERR"} |`;
    }),
    "",
    "## Sitemap Counts",
    "",
    `- Live: ${report.live.sitemap.total || 0} URLs, ${report.live.sitemap.insights || 0} insight URLs, ${report.live.sitemap.products || 0} product URLs, first URL ${report.live.sitemap.firstUrl || "none"}.`,
    `- Draft: ${report.draft.sitemap.total || 0} URLs, ${report.draft.sitemap.insights || 0} insight URLs, ${report.draft.sitemap.products || 0} product URLs, first URL ${report.draft.sitemap.firstUrl || "none"}.`,
    `- Live alternate llms.txt GET: ${report.liveAlternate.llmsTxt?.status || "ERR"}; HEAD: ${report.liveAlternate.llmsTxt?.headStatus || "ERR"}.`,
    `- Live alternate llms-full.txt GET: ${report.liveAlternate.llmsFullTxt?.status || "ERR"}; HEAD: ${report.liveAlternate.llmsFullTxt?.headStatus || "ERR"}.`,
    "",
    "## Content and Structure Differences",
    "",
    ...differenceLines,
    "",
    "## Operational Gaps / Release Review",
    "",
    ...(report.gaps.length ? report.gaps.map((gap) => `- ${gap}`) : ["- No comparison gaps found by this script."]),
    "",
    "## Guardrail",
    "",
    "This comparison is read-only. It does not deploy, push, change DNS, change Cloudflare, or mutate production.",
  ];
  fs.writeFileSync(mdPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Comparison report: ${path.relative(root, jsonPath)}`);
  console.log(`Comparison summary: ${path.relative(root, mdPath)}`);
}

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    live: {
      base: liveBase,
      routes: await routeStatuses(liveBase),
      pages: await pageMeta(liveBase),
      headers: await baseHeaders(liveBase),
      sitemap: await sitemapSummary(liveBase),
    },
    liveAlternate: {
      base: alternateLiveBase,
      llmsTxt: await fetchStatusOnly(alternateLiveBase, "/llms.txt"),
      llmsFullTxt: await fetchStatusOnly(alternateLiveBase, "/llms-full.txt"),
    },
    draft: {
      base: draftBase,
      routes: await routeStatuses(draftBase),
      pages: await pageMeta(draftBase),
      headers: await baseHeaders(draftBase),
      sitemap: await sitemapSummary(draftBase),
    },
    differences: [],
    gaps: [],
  };
  report.differences = summarizeDifferences(report);
  report.gaps = summarizeGaps(report);
  writeReports(report);
}

async function fetchStatusOnly(base, route) {
  try {
    const result = await fetchText(base, route);
    let headStatus = 0;
    let headOk = false;
    try {
      const head = await fetch(joinUrl(base, route), { method: "HEAD", redirect: "follow" });
      headStatus = head.status;
      headOk = head.ok;
    } catch {
      headStatus = 0;
      headOk = false;
    }
    return {
      route,
      status: result.status,
      ok: result.ok,
      method: "GET",
      headStatus,
      headOk,
      finalUrl: result.finalUrl,
      sample: result.text.slice(0, 80),
    };
  } catch (error) {
    return { route, status: 0, ok: false, error: error.message };
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
