import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleOwsAdminGet, handleOwsAdminPost, adminOptionsResponse, adminJsonResponse } from '../functions/_shared/ows-admin-handler.mjs';
import { handleOwsIntakePost, optionsResponse, jsonResponse } from '../functions/_shared/ows-intake-handler.mjs';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const publicRoot = process.env.OWS_PREVIEW_ROOT || path.join(root, 'public-site');
const port = Number(process.env.PORT || process.env.OWS_PREVIEW_PORT || 4174);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

function envFromProcess() {
  return {
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
    SHAREPOINT_HOSTNAME: process.env.SHAREPOINT_HOSTNAME,
    OWS_SITE_PATH: process.env.OWS_SITE_PATH,
    OWS_CONTRIBUTORS_LIST: process.env.OWS_CONTRIBUTORS_LIST,
    OWS_SOURCE_FORM_LINK: process.env.OWS_SOURCE_FORM_LINK,
    OWS_SEND_FROM: process.env.OWS_SEND_FROM,
    OWS_INTERNAL_NOTIFY: process.env.OWS_INTERNAL_NOTIFY,
    OWS_DISABLE_MAIL: process.env.OWS_DISABLE_MAIL || 'true',
    OWS_ADMIN_TOKEN: process.env.OWS_ADMIN_TOKEN,
    OWS_ADMIN_ENABLE_MUTATIONS: process.env.OWS_ADMIN_ENABLE_MUTATIONS || 'false',
    OWS_ADMIN_LIST_TOP: process.env.OWS_ADMIN_LIST_TOP,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || `http://127.0.0.1:${port}`,
  };
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function toRequest(req) {
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await collectBody(req);
  return new Request(`http://127.0.0.1:${port}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body,
  });
}

async function sendResponse(res, response) {
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  res.end(Buffer.from(await response.arrayBuffer()));
}

function resolveFile(requestPath) {
  let cleanPath = decodeURIComponent((requestPath || '/').split('?')[0]);
  if (cleanPath === '/') cleanPath = '/index.html';

  let filePath = path.join(publicRoot, cleanPath.replace(/^\//, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  if (!fs.existsSync(filePath)) {
    const altPath = path.join(publicRoot, cleanPath.replace(/^\//, ''), 'index.html');
    if (fs.existsSync(altPath)) filePath = altPath;
  }
  return filePath;
}

async function handleApi(req, res) {
  const request = await toRequest(req);
  const env = envFromProcess();
  const pathname = new URL(request.url).pathname;

  if (pathname === '/api/ows-admin') {
    if (req.method === 'OPTIONS') return sendResponse(res, adminOptionsResponse(request, env));
    if (req.method === 'GET') return sendResponse(res, await handleOwsAdminGet(request, env));
    if (req.method === 'POST') return sendResponse(res, await handleOwsAdminPost(request, env));
    return sendResponse(res, adminJsonResponse(request, env, { ok: false, errors: ['Method not allowed.'] }, 405));
  }

  if (pathname === '/api/ows-intake') {
    if (req.method === 'OPTIONS') return sendResponse(res, optionsResponse(request, env));
    if (req.method === 'POST') return sendResponse(res, await handleOwsIntakePost(request, env));
    return sendResponse(res, jsonResponse(request, env, { ok: false, errors: ['Method not allowed.'] }, 405));
  }

  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: false, errors: ['API route not found.'] }));
}

const server = http.createServer((req, res) => {
  if ((req.url || '').startsWith('/api/')) {
    handleApi(req, res).catch((err) => {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, errors: ['Local OWS preview API failed.'] }));
    });
    return;
  }

  const filePath = resolveFile(req.url);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`OWS local preview running at http://127.0.0.1:${port}`);
  console.log(`Serving static files from ${publicRoot}`);
  console.log('Mutations enabled:', process.env.OWS_ADMIN_ENABLE_MUTATIONS === 'true');
});
