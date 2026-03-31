// Moldart Chatbot — Cloudflare Pages Function
// POST /api/chat → proxies to OpenRouter-compatible LLM API
// Environment variables (set in Cloudflare Pages dashboard):
//   OPENROUTER_API_KEY — required
//   LLM_BASE_URL — optional, defaults to https://openrouter.ai/api/v1
//   CHAT_MODEL — optional, defaults to google/gemini-2.0-flash-001

const SYSTEM_PROMPT = `You are Moldart Assistant — a knowledgeable, concise assistant for Moldart India, a B2B sourcing and supply partner for industrial materials. Founded in 1989, headquartered in Mumbai, exporting to 60+ countries.

PRODUCT CATALOG (16 families):
Lamination Tooling: Press Plates (SS 301/420/630-633, 8-12 weeks), Press Pads (silicone-copper composite, 6-10 weeks), Engraved Cylinders (rotogravure, 6-8 weeks), Printed Decor Paper (70-90 GSM, 4-6 weeks)
Engineered Substrates: Plywood, Fiberboard (MDF/HDF), OSB, Particleboard
Finished Products: Wood Flooring, Flooring Accessories, Ready-Made Furniture, Custom Furniture
Architectural Steel: Decorative SS Panels (304/316L), SS Profiles, SS Furniture, Industrial Press Plates (for HPL/CCL/PCB)

ENGAGEMENT PROCESS: Inquiry → Technical Review → Sample/Pricing → Production → QC → Delivery

RULES:
- Be concise and factual. Never fabricate specifications or pricing.
- For pricing, custom specs, or orders: direct to info@moldartindia.com or WhatsApp +91 7208088788
- For technical questions: provide what you know, then suggest contacting the technical team for confirmation
- Keep responses under 200 words unless detail is specifically requested
- Do not discuss competitors by name`;

const RATE_LIMIT = 10; // messages per IP per day

// Simple in-memory rate limiter (resets on cold start, sufficient for low-traffic)
const rateCounts = new Map();

function getRateKey(ip) {
  const date = new Date().toISOString().split('T')[0];
  return `${ip}:${date}`;
}

function checkRateLimit(ip) {
  const key = getRateKey(ip);
  const count = rateCounts.get(key) || 0;
  if (count >= RATE_LIMIT) return false;
  rateCounts.set(key, count + 1);
  // Clean old entries periodically
  if (rateCounts.size > 5000) {
    const today = new Date().toISOString().split('T')[0];
    for (const k of rateCounts.keys()) {
      if (!k.endsWith(today)) rateCounts.delete(k);
    }
  }
  return true;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://moldartindia.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const API_KEY = env.OPENROUTER_API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  // Rate limit by IP
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Daily limit reached. Please contact info@moldartindia.com.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  try {
    const body = await request.json();
    const messages = body.messages;
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // Prepend system prompt
    const fullMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')];

    const baseUrl = env.LLM_BASE_URL || 'https://openrouter.ai/api/v1';
    const model = env.CHAT_MODEL || 'google/gemini-2.0-flash-001';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://moldartindia.com',
        'X-Title': 'Moldart Assistant'
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('LLM API error:', response.status);
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated.';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  } catch (err) {
    console.error('Chat function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}
