import { handleLeadIntakePost, optionsResponse, jsonResponse } from '../_shared/lead-intake-handler.mjs';

export async function onRequestOptions({ request, env }) {
  return optionsResponse(request, env);
}

export async function onRequestPost({ request, env }) {
  return handleLeadIntakePost(request, env);
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return onRequestOptions({ request, env });
  if (request.method === 'POST') return onRequestPost({ request, env });
  return jsonResponse(request, env, { ok: false, errors: ['Method not allowed.'] }, 405);
}
