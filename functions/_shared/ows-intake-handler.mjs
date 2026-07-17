import {
  validateIntake,
  buildSharePointFields,
  getGraphToken,
  getSharePointListContext,
  findExistingContributor,
  createContributorItem,
  sendGraphMail,
  buildAcknowledgementEmail,
  buildInternalNotificationEmail,
  buildMailMessage,
} from './ows-intake-core.mjs';

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
  const allowed = allowedOrigins(env);
  const allowOrigin = allowed.includes(origin) ? origin : 'https://moldartindia.com';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export function jsonResponse(request, env, payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(request, env),
    },
  });
}

export function optionsResponse(request, env) {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

export async function handleOwsIntakePost(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return jsonResponse(request, env, { ok: false, errors: ['Invalid JSON body.'] }, 400);
  }

  const validation = validateIntake(body);

  // Honeypot: return generic success but do not write or email.
  if (validation.spam) {
    return jsonResponse(request, env, { ok: true, received: true });
  }

  if (!validation.ok) {
    return jsonResponse(request, env, { ok: false, errors: validation.errors }, 400);
  }

  const sourceFormLink = env.OWS_SOURCE_FORM_LINK || 'https://moldartindia.com/open-wood-science/reviewer-intake/';
  const sendFrom = env.OWS_SEND_FROM || 'yash@moldartindia.com';
  const internalNotify = env.OWS_INTERNAL_NOTIFY || 'yash@moldartindia.com';
  const disableMail = String(env.OWS_DISABLE_MAIL || '').toLowerCase() === 'true';

  try {
    const token = await getGraphToken(env);
    const { siteId, listId } = await getSharePointListContext(env, token);
    const existing = await findExistingContributor(token, siteId, listId, validation.data.email);
    if (existing) {
      return jsonResponse(request, env, {
        ok: false,
        duplicate: true,
        errors: ['An intake record already exists for this email. Please reply to the previous email or contact Moldart if you need to update it.'],
      }, 409);
    }

    const fields = buildSharePointFields(validation, sourceFormLink);
    const item = await createContributorItem(token, siteId, listId, fields);
    const itemUrl = item.webUrl || '';

    if (!disableMail) {
      await sendGraphMail(token, sendFrom, buildMailMessage({
        to: validation.data.email,
        subject: 'Open Wood Science reviewer intake received',
        body: buildAcknowledgementEmail(validation),
      }));
      await sendGraphMail(token, sendFrom, buildMailMessage({
        to: internalNotify,
        subject: `OWS reviewer intake staged — ${validation.data.fullName}`,
        body: buildInternalNotificationEmail(validation, itemUrl),
      }));
    }

    return jsonResponse(request, env, {
      ok: true,
      received: true,
      status: 'Received - custom intake screening needed',
      approvalDecision: 'Hold - human screening required before draft access',
      itemId: item.id,
    }, 201);
  } catch (err) {
    console.error('OWS intake failed', err);
    return jsonResponse(request, env, {
      ok: false,
      errors: ['The intake service could not stage your response. Please email info@moldartindia.com or try again later.'],
    }, 503);
  }
}
