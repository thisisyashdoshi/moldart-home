// Moldart public chatbot endpoint intentionally disabled.
// Strategy: no public chatbot or LLM proxy on the marketing site until a separate
// privacy/security review approves the use case and data handling.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://moldartindia.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequest() {
  return new Response(JSON.stringify({ error: 'Chat is disabled. Please use the contact form, email, or WhatsApp.' }), {
    status: 410,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
