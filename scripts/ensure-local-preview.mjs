#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const tmpDir = path.join(root, ".tmp");
const logPath = path.join(tmpDir, "preview-server.log");
const pidPath = path.join(tmpDir, "preview-server.pid");
const url = "http://127.0.0.1:4173/";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isLive() {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForLive() {
  for (let i = 0; i < 20; i += 1) {
    if (await isLive()) return true;
    await sleep(500);
  }
  return false;
}

async function main() {
  fs.mkdirSync(tmpDir, { recursive: true });

  if (await isLive()) {
    console.log(`Preview already live: ${url}`);
    return;
  }

  const log = fs.openSync(logPath, "a");
  const child = spawn(process.execPath, ["preview-server.js"], {
    cwd: root,
    detached: true,
    windowsHide: true,
    stdio: ["ignore", log, log],
  });
  child.unref();
  fs.writeFileSync(pidPath, `${child.pid}\n`, "utf8");

  if (!(await waitForLive())) {
    throw new Error(`Preview did not become live at ${url}. Check ${path.relative(root, logPath)}.`);
  }

  console.log(`Preview live: ${url}`);
  console.log(`Preview pid: ${child.pid}`);
  console.log(`Preview log: ${path.relative(root, logPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
