#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));
const buildFirst = args.has("--build");
const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
const baseUrl = baseArg ? baseArg.slice("--base=".length).replace(/\/$/, "") : "";
const reportDir = path.join(root, ".tmp");

const report = {
  generatedAt: new Date().toISOString(),
  mode: buildFirst ? "build-and-check" : "check-only",
  baseUrl: baseUrl || null,
  recommendedSelfHostedServices: [
    "n8n for scheduled orchestration and approval-gated workflows",
    "Uptime Kuma for external route uptime and keyword checks",
    "ntfy or Gotify for self-hosted alerts",
    "Prometheus/Grafana only if long-term metrics are needed",
  ],
  checks: [],
  failures: [],
  warnings: [],
};

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

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function run(command, commandArgs, name) {
	const result = spawnSync(command, commandArgs, {
		cwd: root,
		encoding: "utf8",
		shell: false,
		maxBuffer: 50 * 1024 * 1024,
	});
  if (result.status === 0) {
    pass(name, { command: [command, ...commandArgs].join(" ") });
    return true;
  }
  fail(name, `${name} failed`, {
    command: [command, ...commandArgs].join(" "),
    exitStatus: result.status,
    error: result.error ? result.error.message : undefined,
    stderr: (result.stderr || "").slice(0, 4000),
    stdout: (result.stdout || "").slice(0, 4000),
  });
  return false;
}

function assertEqual(name, actual, expected) {
  if (actual === expected) pass(name, { actual, expected });
  else fail(name, `Expected ${expected}, got ${actual}`, { actual, expected });
}

function assertAtLeast(name, actual, minimum) {
  if (actual >= minimum) pass(name, { actual, minimum });
  else fail(name, `Expected at least ${minimum}, got ${actual}`, { actual, minimum });
}

function routeToArtifactPath(routePath) {
  const clean = routePath.replace(/^\//, "");
  if (!clean) return "public-site/index.html";
  if (clean.endsWith("/")) return `public-site/${clean}index.html`;
  return `public-site/${clean}`;
}

function sitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
}

async function httpCheck(routePath) {
  const url = `${baseUrl}${routePath}`;
  const response = await fetch(url, { redirect: "follow" });
  const text = await response.text();
  if (!response.ok) {
    fail(`http ${routePath}`, `HTTP ${response.status}`, { url });
    return;
  }
  const insightMatch = routePath.match(/^\/insights\/([^/]+)\/$/);
  if (insightMatch) {
    const media = readJson("insight-media-coverage.generated.json");
    const item = (media.selectedInsightMedia || []).find((entry) => entry.slug === insightMatch[1]);
    const cards = (text.match(/class="youtube-card"/g) || []).length;
    if (!item || !text.includes("article-cover-card") || !text.includes("article-cover-caption")) {
      fail(`http ${routePath}`, "Insight page is missing its labelled cover", { url });
      return;
    }
    if ((item.selectedVideo && (cards !== 1 || !text.includes(item.selectedVideo.url))) || (!item.selectedVideo && cards !== 0)) {
      fail(`http ${routePath}`, "Insight video does not match the direct media mapping", { url, cards });
      return;
    }
  }
  pass(`http ${routePath}`, { url, status: response.status, bytes: text.length });
}

function validateStaticArtifact() {
  if (!exists("public-site/sitemap.xml")) {
    fail("public artifact", "public-site/sitemap.xml is missing; run npm run build first");
    return;
  }
  const urls = sitemapUrls(readText("public-site/sitemap.xml"));
  const pathnames = urls.map((url) => new URL(url).pathname);
  assertEqual("public sitemap url count", urls.length, 89);
  assertEqual("public product route count", pathnames.filter((pathname) => pathname.startsWith("/products/")).length, 18);
  assertEqual("public solution route count", pathnames.filter((pathname) => pathname.startsWith("/solutions/")).length, 9);
  assertEqual("public insight route count", pathnames.filter((pathname) => pathname.startsWith("/insights/")).length, 52);
  const missing = urls
    .map((url) => new URL(url).pathname)
    .map((pathname) => ({ pathname, file: routeToArtifactPath(pathname) }))
    .filter((item) => !exists(item.file));
  if (missing.length) fail("public sitemap files", "Sitemap routes missing artifact files", { missing });
  else pass("public sitemap files", { checked: urls.length });
}

function validateYoutubeAndMedia() {
  const youtube = readJson("data/youtube-library.json");
  const items = youtube.items || [];
  assertEqual("youtube public item count", items.length, 40);
  assertEqual("youtube long-form count", items.filter((item) => item.type === "video").length, 18);
  assertEqual("youtube shorts count", items.filter((item) => item.type === "short").length, 22);

  const badNewSlug = items.filter((item) =>
    [...(item.primaryInsightSlugs || []), ...(item.secondaryInsightSlugs || [])].some((slug) =>
      [
        "press-plate-metallurgy-buyer-approval-guide",
        "hpl-resin-flow-chemical-matrix-buyer-checks",
        "eir-laminate-texture-approval-guide",
        "hdhmr-isotropic-core-boards-density-moisture-conversion-fit",
        "gloss-matte-texture-press-plates-finish-selection",
        "doctor-blades-gravure-printing-decor-paper-repeat-quality",
        "moldart-wood-steel-route-requirement-controlled-supply",
      ].includes(slug),
    ),
  );
  if (badNewSlug.length) fail("existing-only youtube mapping", "Mappings still reference removed new insight slugs", { ids: badNewSlug.map((item) => item.id) });
  else pass("existing-only youtube mapping");

  if (!exists("youtube-insight-integration-report.generated.json")) {
    warn("youtube generated report", "Report is missing before build; run npm run build");
    return;
  }
  const coverage = readJson("youtube-insight-integration-report.generated.json");
  assertEqual("published insight count", coverage.counts.publishedInsights, 51);
  assertEqual("directly mapped insight videos", coverage.counts.insightsWithVideo, coverage.counts.directlyMappedInsights);
  assertEqual("insight video coverage partition", coverage.counts.insightsWithVideo + coverage.counts.insightsWithoutVideo, 51);
  assertEqual("insights with image", coverage.counts.insightsWithImage, 51);
  assertEqual("insights without image", coverage.counts.insightsWithoutImage, 0);
  assertEqual("videos needing new insight pages", coverage.counts.videosNeedingNewInsight, 0);

  const media = readJson("insight-media-coverage.generated.json");
  const badPages = (media.selectedInsightMedia || []).filter((item) => {
    const artifactFile = path.join(root, "public-site", "insights", item.slug, "index.html");
    if (!fs.existsSync(artifactFile)) return true;
    const html = fs.readFileSync(artifactFile, "utf8");
    const cards = (html.match(/class="youtube-card"/g) || []).length;
    if (!html.includes("article-cover-card") || !html.includes("article-cover-caption")) return true;
    if (!item.selectedVideo) return cards !== 0;
    return cards !== 1 || !html.includes(item.selectedVideo.url) || /Integrated Precision for Wood and Steel/i.test(item.selectedVideo.title || "");
  });
  if (badPages.length) fail("rendered insight media", "Insight pages must render one labelled cover and only a directly mapped, article-specific video", { slugs: badPages.map((item) => item.slug) });
  else pass("rendered insight media", { checked: media.selectedInsightMedia?.length || 0, directlyMappedVideos: media.counts?.insightsWithVideo || 0 });
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, "moldart-quality-monitor-report.json");
  const mdPath = path.join(reportDir, "moldart-quality-monitor-report.md");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  const lines = [
    "# Moldart Quality Monitor Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Base URL: ${report.baseUrl || "not checked"}`,
    "",
    "## Result",
    "",
    report.failures.length ? `FAIL (${report.failures.length})` : "PASS",
    "",
    "## Checks",
    "",
    ...report.checks.map((check) => `- ${String(check.status || "unknown").toUpperCase()} ${check.name}${check.message ? `: ${check.message}` : ""}`),
    "",
    "## Objective Guardrails",
    "",
    "- This script does not deploy, push, change DNS, change Cloudflare, or mutate credentials.",
    "- Use n8n, Uptime Kuma, ntfy/Gotify, cron, or Windows Task Scheduler as the FOSS/self-hosted runner layer.",
    "- Use --build only in a controlled local or CI workspace because build refreshes generated files.",
  ];
  fs.writeFileSync(mdPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Monitor report: ${path.relative(root, jsonPath)}`);
  console.log(`Monitor summary: ${path.relative(root, mdPath)}`);
}

async function main() {
	if (buildFirst) {
		const npmCli =
			process.env.npm_execpath ||
			path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
		run(process.execPath, [npmCli, "run", "build"], "npm run build");
	}
  run(process.execPath, ["--check", "generate.js"], "node --check generate.js");
  validateYoutubeAndMedia();
  validateStaticArtifact();
  run(process.execPath, ["scripts/moldart-artifact-release-gate.mjs"], "artifact release gate");
  if (baseUrl) {
    await httpCheck("/");
    await httpCheck("/products/");
    await httpCheck("/products/melamine-impregnated-technical-papers/");
    await httpCheck("/products/electronics-lamination-films/");
    await httpCheck("/solutions/decorative-surfaces/");
    await httpCheck("/solutions/pcb-ccl/");
    await httpCheck("/evidence-qc/");
    await httpCheck("/process/");
    await httpCheck("/contact/?intent=buyer-rfq&product=Electronics%20Lamination%20Films");
    await httpCheck("/insights/press-plates-panel-quality-guide/");
    await httpCheck("/insights/decorative-stainless-steel-201-304-316-430/");
    await httpCheck("/insights/custom-furniture-brief-guide/");
    await httpCheck("/data/youtube-library.json");
  }
  writeReports();
  if (report.failures.length) process.exit(1);
}

main().catch((error) => {
  fail("monitor runtime", error.message, { stack: error.stack });
  writeReports();
  process.exit(1);
});
