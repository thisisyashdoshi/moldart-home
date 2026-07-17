#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

function run(command, args) {
  let executable = command;
  let finalArgs = args;
  if (command === 'npm' && process.env.npm_execpath) {
    executable = process.execPath;
    finalArgs = [process.env.npm_execpath, ...args];
  } else if (command === 'npm' && process.platform === 'win32') {
    executable = 'cmd.exe';
    finalArgs = ['/d', '/s', '/c', ['npm', ...args].join(' ')];
  }
  console.log(`\n> ${[command, ...args].join(' ')}`);
  const result = spawnSync(executable, finalArgs, { stdio: 'inherit' });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status || 1);
}

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
  run('npm', ['run', 'build']);
  run('node', ['scripts/check-sitemap.js']);
  run('node', ['scripts/check-downloads.js']);
  run('node', ['scripts/check-headers.js']);
  run('node', ['scripts/check-public-artifact.js']);
  run('node', ['scripts/check-search.js']);
  run('node', ['scripts/check-secrets.js']);
  run('npm', ['audit', '--audit-level=moderate']);

  const auditBase = process.env.RELEASE_AUDIT_BASE || 'http://127.0.0.1:4173';
  if (await reachable(auditBase)) {
    run('node', ['scripts/site-audit.js', auditBase]);
    run('node', ['scripts/check-a11y.js', auditBase]);
  } else {
    console.warn(
      `\nBrowser checks skipped because ${auditBase} is not reachable. Start npm run preview and rerun npm run audit:local for the full release gate.`
    );
  }
})();
