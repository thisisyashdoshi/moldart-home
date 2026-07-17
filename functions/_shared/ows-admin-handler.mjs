import {
  authorizeAdmin,
  buildAssignmentFields,
  buildDashboard,
  createReviewAssignment,
  loadAdminDashboardData,
  mutationsEnabled,
  validateAssignmentInput,
} from './ows-admin-core.mjs';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://moldartindia.com',
  'https://www.moldartindia.com',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
];

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .concat(DEFAULT_ALLOWED_ORIGINS);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowOrigin = allowedOrigins(env).includes(origin) ? origin : 'https://moldartindia.com';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OWS-Admin-Token',
    'Vary': 'Origin',
  };
}

export function adminJsonResponse(request, env, payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(request, env),
    },
  });
}

export function adminOptionsResponse(request, env) {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

export async function handleOwsAdminGet(request, env) {
  const auth = authorizeAdmin(request, env);
  if (!auth.ok) return adminJsonResponse(request, env, auth.payload, auth.status);

  try {
    const data = await loadAdminDashboardData(env);
    return adminJsonResponse(request, env, buildDashboard(data, env));
  } catch (err) {
    console.error('OWS admin dashboard failed', err);
    return adminJsonResponse(request, env, {
      ok: false,
      errors: ['OWS admin dashboard could not load Microsoft 365 status.'],
    }, 503);
  }
}

export async function handleOwsAdminPost(request, env) {
  const auth = authorizeAdmin(request, env);
  if (!auth.ok) return adminJsonResponse(request, env, auth.payload, auth.status);

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return adminJsonResponse(request, env, { ok: false, errors: ['Invalid JSON body.'] }, 400);
  }

  if (body.action !== 'prepareAssignment') {
    return adminJsonResponse(request, env, { ok: false, errors: ['Unsupported OWS admin action.'] }, 400);
  }

  const validation = validateAssignmentInput(body);
  if (!validation.ok) return adminJsonResponse(request, env, { ok: false, errors: validation.errors }, 400);

  const assignment = buildAssignmentFields(validation.data);
  const liveMutationRequested = body.dryRun === false;
  const liveMutationAllowed = mutationsEnabled(env);

  if (!liveMutationRequested || !liveMutationAllowed) {
    return adminJsonResponse(request, env, {
      ok: true,
      dryRun: true,
      mutationsEnabled: liveMutationAllowed,
      message: liveMutationAllowed
        ? 'Dry-run assignment preview only. Submit with dryRun=false and confirmations to create the SharePoint assignment.'
        : 'Dry-run assignment preview only. Set OWS_ADMIN_ENABLE_MUTATIONS=true to allow live assignment creation.',
      assignment,
    });
  }

  if (!validation.data.confirmNoMasterAccess || !validation.data.confirmPrivateCopyOnly) {
    return adminJsonResponse(request, env, {
      ok: false,
      errors: ['Live assignment creation requires confirmNoMasterAccess=true and confirmPrivateCopyOnly=true.'],
    }, 400);
  }

  try {
    const created = await createReviewAssignment(env, assignment.fields);
    return adminJsonResponse(request, env, {
      ok: true,
      dryRun: false,
      message: 'OWS_Review_Assignments item created. Existing private-copy automation will send access on its next run.',
      assignment,
      itemId: created.item.id,
      webUrl: created.item.webUrl || '',
    }, 201);
  } catch (err) {
    console.error('OWS admin assignment creation failed', err);
    return adminJsonResponse(request, env, {
      ok: false,
      errors: ['Could not create OWS_Review_Assignments item. No document access was sent by this request.'],
    }, 503);
  }
}
