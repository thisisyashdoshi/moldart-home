import { validateLead, buildLeadRecord, leadInsertStatement, leadInsertBindings } from './lead-intake-core.mjs';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://moldartindia.com',
  'https://www.moldartindia.com',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
  'http://127.0.0.1:4173',
];

function bool(value) {
  return String(value || '').toLowerCase() === 'true';
}

function leadMaxBodyBytes(env = {}) {
  const value = Number(env.LEAD_MAX_BODY_BYTES || 32768);
  return Number.isFinite(value) && value > 0 ? value : 32768;
}

function allowedOrigins(env = {}) {
  return String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .concat(DEFAULT_ALLOWED_ORIGINS);
}

function isPreviewOrigin(origin = '') {
  try {
    const host = new URL(origin).hostname;
    return host === 'moldart-home.pages.dev' || host.endsWith('.moldart-home.pages.dev');
  } catch (_) {
    return false;
  }
}

function isPreviewRequest(request) {
  try {
    const host = new URL(request.url).hostname;
    return host === 'moldart-home.pages.dev' || host.endsWith('.moldart-home.pages.dev');
  } catch (_) {
    return false;
  }
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowOrigin = allowedOrigins(env).includes(origin) || isPreviewOrigin(origin) ? origin : 'https://moldartindia.com';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

export function jsonResponse(request, env, payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      ...corsHeaders(request, env),
    },
  });
}

export function optionsResponse(request, env) {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

async function readBody(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

function requestMeta(request, env = {}) {
  const url = new URL(request.url);
  return {
    urlPath: url.pathname,
    referrer: request.headers.get('referer') || '',
    userAgent: request.headers.get('user-agent') || '',
    cfCountry: request.headers.get('cf-ipcountry') || '',
    ip: bool(env.LEAD_STORE_IP) ? request.headers.get('cf-connecting-ip') || '' : '',
  };
}

function wantsHtmlRedirect(request, body) {
  return Boolean(body.next) && (request.headers.get('accept') || '').includes('text/html');
}

function safeRedirectPath(value) {
  const text = String(value || '').trim();
  if (!text.startsWith('/') || text.startsWith('//') || /[\r\n]/.test(text)) return '';
  return text;
}

function redirectTo(request, value) {
  const path = safeRedirectPath(value) || '/contact/?submitted=true';
  return Response.redirect(new URL(path, request.url), 303);
}

async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: !bool(env.LEAD_REQUIRE_TURNSTILE), skipped: true };
  }
  if (!token) return { ok: false, skipped: false };

  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  const ip = bool(env.LEAD_STORE_IP) ? request.headers.get('cf-connecting-ip') || '' : '';
  if (ip) form.append('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  if (!response.ok) return { ok: false, skipped: false };
  const json = await response.json();
  return { ok: Boolean(json.success), skipped: false, details: json['error-codes'] || [] };
}

async function storeInD1(env, record) {
  if (!env.LEADS_DB || typeof env.LEADS_DB.prepare !== 'function') return false;
  await env.LEADS_DB.prepare(leadInsertStatement())
    .bind(...leadInsertBindings(record))
    .run();
  return true;
}

async function sendWebhook(env, record) {
  if (!env.LEAD_WEBHOOK_URL) return false;
  const headers = { 'Content-Type': 'application/json' };
  if (env.LEAD_WEBHOOK_TOKEN) headers.Authorization = `Bearer ${env.LEAD_WEBHOOK_TOKEN}`;
  const response = await fetch(env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(record),
  });
  if (!response.ok) throw new Error(`Lead webhook failed: ${response.status}`);
  return true;
}

export async function handleLeadIntakePost(request, env = {}) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength && contentLength > leadMaxBodyBytes(env)) {
    return jsonResponse(request, env, { ok: false, errors: ['Request body is too large.'] }, 413);
  }

  let body;
  try {
    body = await readBody(request);
  } catch (_) {
    return jsonResponse(request, env, { ok: false, errors: ['Invalid request body.'] }, 400);
  }

  const validation = validateLead(body);
  if (validation.spam) return jsonResponse(request, env, { ok: true, received: true });
  if (!validation.ok) return jsonResponse(request, env, { ok: false, errors: validation.errors }, 400);

  const turnstile = await verifyTurnstile(request, env, validation.data.turnstileToken);
  if (!turnstile.ok) {
    return jsonResponse(
      request,
      env,
      { ok: false, errors: ['Spam protection failed. Please retry or contact info@moldartindia.com.'] },
      400
    );
  }

  const record = buildLeadRecord(validation, requestMeta(request, env));
  const destinations = [];

  try {
    if (bool(env.LEAD_INTAKE_DRY_RUN)) destinations.push('dry-run');
    if (isPreviewRequest(request) && !env.LEADS_DB && !env.LEAD_WEBHOOK_URL) destinations.push('preview-dry-run');
    if (await storeInD1(env, record)) destinations.push('d1');
    if (await sendWebhook(env, record)) destinations.push('webhook');

    if (!destinations.length) {
      return jsonResponse(
        request,
        env,
        {
          ok: false,
          errors: ['Lead intake is not configured yet. Please email info@moldartindia.com or use WhatsApp.'],
        },
        503
      );
    }

    if (wantsHtmlRedirect(request, body)) return redirectTo(request, body.next);
    return jsonResponse(
      request,
      env,
      { ok: true, received: true, leadId: record.id, destinations, warnings: validation.warnings },
      201
    );
  } catch (error) {
    console.error('Lead intake failed', error);
    return jsonResponse(
      request,
      env,
      {
        ok: false,
        errors: ['Lead intake could not store the request. Please email info@moldartindia.com or use WhatsApp.'],
      },
      503
    );
  }
}
