#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const TMP = path.join(ROOT, '.tmp');
const URL = process.argv[2] || process.env.LIGHTHOUSE_URL || 'http://127.0.0.1:4173/';
const OUT = path.join(TMP, 'lighthouse-home.json');
const SUMMARY_OUT = path.join(TMP, 'lighthouse-summary.json');
const VALID_RUNS = Math.max(1, Number(process.env.LIGHTHOUSE_RUNS || 3));
const MAX_ATTEMPTS = Math.max(
  VALID_RUNS,
  Number(process.env.LIGHTHOUSE_MAX_ATTEMPTS || process.env.LIGHTHOUSE_RETRIES || VALID_RUNS + 2)
);

const BUDGETS = {
  performance: Number(process.env.LIGHTHOUSE_MIN_PERFORMANCE || 0.9),
  accessibility: Number(process.env.LIGHTHOUSE_MIN_ACCESSIBILITY || 0.85),
  bestPractices: Number(process.env.LIGHTHOUSE_MIN_BEST_PRACTICES || 0.85),
  seo: Number(process.env.LIGHTHOUSE_MIN_SEO || 0.9),
  fcpMs: Number(process.env.LIGHTHOUSE_MAX_FCP_MS || 1800),
  lcpMs: Number(process.env.LIGHTHOUSE_MAX_LCP_MS || 2500),
  cls: Number(process.env.LIGHTHOUSE_MAX_CLS || 0.1),
  tbtMs: Number(process.env.LIGHTHOUSE_MAX_TBT_MS || 200),
};

async function reachable(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok;
  } catch (_) {
    return false;
  }
}

function score(report, category) {
  return report.categories?.[category]?.score ?? 0;
}

function numeric(report, audit) {
  return Number(report.audits?.[audit]?.numericValue ?? 0);
}

function isInvalidTrace(report) {
  return report.runtimeError?.code === 'NO_NAVSTART' || report.categories?.performance?.score == null;
}

function summarize(report) {
  return {
    performance: score(report, 'performance'),
    accessibility: score(report, 'accessibility'),
    bestPractices: score(report, 'best-practices'),
    seo: score(report, 'seo'),
    fcpMs: numeric(report, 'first-contentful-paint'),
    lcpMs: numeric(report, 'largest-contentful-paint'),
    cls: numeric(report, 'cumulative-layout-shift'),
    tbtMs: numeric(report, 'total-blocking-time'),
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function runLighthouse(attempt) {
  fs.mkdirSync(TMP, { recursive: true });
  fs.rmSync(OUT, { force: true });
  const lighthouseTmp = fs.mkdtempSync(path.join(os.tmpdir(), `moldart-lighthouse-${attempt}-`));
  const cli = require.resolve('lighthouse/cli/index.js');
  const result = spawnSync(
    process.execPath,
    [
      cli,
      URL,
      '--quiet',
      '--output=json',
      `--output-path=${OUT}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage',
    ],
    {
      cwd: ROOT,
      env: { ...process.env, TMP: lighthouseTmp, TEMP: lighthouseTmp, TMPDIR: lighthouseTmp },
      encoding: 'utf8',
      stdio: 'pipe',
    }
  );

  if (result.status !== 0 && !fs.existsSync(OUT)) {
    const details = String(result.stderr || result.stdout || '').trim();
    if (details) console.error(details);
    return { ok: false, status: result.status || 1, report: null, invalidTrace: false };
  }
  if (result.status !== 0) {
    console.warn('Lighthouse wrote a valid report but Chrome cleanup exited non-zero; continuing with budget parsing.');
  }

  const report = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  return { ok: true, status: result.status || 0, report, invalidTrace: isInvalidTrace(report) };
}

(async () => {
  if (!(await reachable(URL))) {
    console.error(`Lighthouse target is not reachable: ${URL}`);
    console.error('Start npm run preview first, then rerun npm run lighthouse:check.');
    process.exit(1);
  }

  const runs = [];
  let last = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && runs.length < VALID_RUNS; attempt += 1) {
    console.warn(`Running Lighthouse sample ${runs.length + 1}/${VALID_RUNS} (attempt ${attempt}/${MAX_ATTEMPTS})...`);
    last = runLighthouse(attempt);
    if (!last.ok) process.exit(last.status);
    if (last.invalidTrace) {
      const code = last.report?.runtimeError?.code || 'MISSING_PERFORMANCE_SCORE';
      console.warn(`Ignoring invalid Lighthouse trace: ${code}`);
      continue;
    }
    runs.push(summarize(last.report));
  }

  if (runs.length < VALID_RUNS) {
    console.error(`Lighthouse produced ${runs.length}/${VALID_RUNS} required valid traces.`);
    if (last?.report?.runtimeError)
      console.error(`${last.report.runtimeError.code}: ${last.report.runtimeError.message}`);
    process.exit(1);
  }

  const metricNames = [
    'performance',
    'accessibility',
    'bestPractices',
    'seo',
    'fcpMs',
    'lcpMs',
    'cls',
    'tbtMs',
  ];
  const summary = { url: URL };
  for (const metric of metricNames) summary[metric] = median(runs.map((run) => run[metric]));

  const output = { url: URL, validRuns: runs.length, budgets: BUDGETS, runs, median: summary };
  fs.writeFileSync(SUMMARY_OUT, JSON.stringify(output, null, 2), 'utf8');
  console.log(JSON.stringify(output, null, 2));

  const failures = [];
  if (summary.performance < BUDGETS.performance)
    failures.push(`performance ${summary.performance} < ${BUDGETS.performance}`);
  if (summary.accessibility < BUDGETS.accessibility)
    failures.push(`accessibility ${summary.accessibility} < ${BUDGETS.accessibility}`);
  if (summary.bestPractices < BUDGETS.bestPractices)
    failures.push(`best-practices ${summary.bestPractices} < ${BUDGETS.bestPractices}`);
  if (summary.seo < BUDGETS.seo) failures.push(`seo ${summary.seo} < ${BUDGETS.seo}`);
  if (summary.fcpMs > BUDGETS.fcpMs) failures.push(`FCP ${summary.fcpMs.toFixed(0)}ms > ${BUDGETS.fcpMs}ms`);
  if (summary.lcpMs > BUDGETS.lcpMs) failures.push(`LCP ${summary.lcpMs.toFixed(0)}ms > ${BUDGETS.lcpMs}ms`);
  if (summary.cls > BUDGETS.cls) failures.push(`CLS ${summary.cls} > ${BUDGETS.cls}`);
  if (summary.tbtMs > BUDGETS.tbtMs) failures.push(`TBT ${summary.tbtMs.toFixed(0)}ms > ${BUDGETS.tbtMs}ms`);

  if (failures.length) {
    console.error('Lighthouse budget failures:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
})();
