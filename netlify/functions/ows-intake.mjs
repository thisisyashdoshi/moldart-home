import { handleOwsIntakePost, optionsResponse, jsonResponse } from '../../functions/_shared/ows-intake-handler.mjs';

function toRequest(event) {
  return new Request('https://moldartindia.com/api/ows-intake', {
    method: event.httpMethod,
    headers: event.headers || {},
    body: event.httpMethod === 'GET' || event.httpMethod === 'HEAD' ? undefined : event.body,
  });
}

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
    OWS_DISABLE_MAIL: process.env.OWS_DISABLE_MAIL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
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
  if (event.httpMethod === 'POST') return responseToNetlify(await handleOwsIntakePost(request, env));
  return responseToNetlify(jsonResponse(request, env, { ok: false, errors: ['Method not allowed.'] }, 405));
}
