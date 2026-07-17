// Moldart public chatbot endpoint intentionally disabled.
// Strategy: no public chatbot or LLM proxy on the marketing site until a separate
// privacy/security review approves the use case and data handling.

exports.handler = async () => ({
  statusCode: 410,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: 'Chat is disabled. Please use the contact form, email, or WhatsApp.' }),
});
