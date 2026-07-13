import {
  adminJsonResponse,
  adminOptionsResponse,
  handleOwsAdminGet,
  handleOwsAdminPost,
} from '../../functions/_shared/ows-admin-handler.mjs';

function toRequest(event) {
  return new Request('https://moldartindia.com/api/ows-admin', {
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
    OWS_ADMIN_TOKEN: process.env.OWS_ADMIN_TOKEN,
    OWS_ADMIN_ENABLE_MUTATIONS: process.env.OWS_ADMIN_ENABLE_MUTATIONS,
    OWS_ADMIN_LIST_TOP: process.env.OWS_ADMIN_LIST_TOP,
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
  if (event.httpMethod === 'OPTIONS') return responseToNetlify(adminOptionsResponse(request, env));
  if (event.httpMethod === 'GET') return responseToNetlify(await handleOwsAdminGet(request, env));
  if (event.httpMethod === 'POST') return responseToNetlify(await handleOwsAdminPost(request, env));
  return responseToNetlify(adminJsonResponse(request, env, { ok: false, errors: ['Method not allowed.'] }, 405));
}
