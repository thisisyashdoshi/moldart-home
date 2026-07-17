#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASE = process.argv[2] || process.env.LINK_CHECK_BASE || 'http://127.0.0.1:4173/';
const SKIP = '^(mailto:|tel:|https?://(?!127\\.0\\.0\\.1:4173)|.*\\.pdf(?:\\?|$))';

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

(async () => {
  if (!(await reachable(BASE))) {
    console.error(`Link check target is not reachable: ${BASE}`);
    console.error('Start npm run preview first, then rerun npm run links:check.');
    process.exit(1);
  }

  const cli = path.join(ROOT, 'node_modules', 'linkinator', 'build', 'src', 'cli.js');
  const result = spawnSync(process.execPath, [cli, BASE, '--recurse', '--skip', SKIP, '--verbosity', 'error'], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  process.exit(result.status || 0);
})();
