import { handleLeadIntakePost, optionsResponse, jsonResponse } from '../../functions/_shared/lead-intake-handler.mjs';

function toRequest(event) {
  return new Request('https://moldartindia.com/api/lead-intake', {
    method: event.httpMethod,
    headers: event.headers || {},
    body: event.httpMethod === 'GET' || event.httpMethod === 'HEAD' ? undefined : event.body,
  });
}

function envFromProcess() {
  return {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    LEAD_INTAKE_DRY_RUN: process.env.LEAD_INTAKE_DRY_RUN,
    LEAD_REQUIRE_TURNSTILE: process.env.LEAD_REQUIRE_TURNSTILE,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    LEAD_WEBHOOK_URL: process.env.LEAD_WEBHOOK_URL,
    LEAD_WEBHOOK_TOKEN: process.env.LEAD_WEBHOOK_TOKEN,
    LEAD_STORE_IP: process.env.LEAD_STORE_IP,
  };
}

async function responseToNetlify(response) {
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
}

export async function handler(event) {
  const request = toRequest(event);
  const env = envFromProcess();
  if (event.httpMethod === 'OPTIONS') return responseToNetlify(optionsResponse(request, env));
  if (event.httpMethod === 'POST') return responseToNetlify(await handleLeadIntakePost(request, env));
  return responseToNetlify(jsonResponse(request, env, { ok: false, errors: ['Method not allowed.'] }, 405));
}
