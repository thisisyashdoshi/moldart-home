const LEAD_TYPES = new Set(['contact_inquiry', 'resource_download', 'portal_access_request', 'supplier_introduction']);
const ROUTES = new Set(['Buyer RFQ', 'Supplier Capability Introduction', 'Portal Access Request', 'General Contact']);

function norm(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normLong(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhone(value) {
  return String(value ?? '')
    .replace(/[\s().-]/g, '')
    .trim();
}

function isPhone(value) {
  return /^\+?[0-9]{7,15}$/.test(normalizePhone(value));
}

function clip(value, max = 2000) {
  const text = normLong(value);
  return text.length <= max ? text : `${text.slice(0, max - 1)}...`;
}

function selected(value, allowed, fallback) {
  const text = norm(value);
  return allowed.has(text) ? text : fallback;
}

function affirmative(value) {
  if (value === true) return true;
  return new Set(['1', 'true', 'yes', 'on', 'accepted']).has(norm(value).toLowerCase());
}

export function normalizeLead(input = {}) {
  const leadType = selected(input.lead_type || input.leadType, LEAD_TYPES, 'contact_inquiry');
  const inquiryRoute = selected(
    input.inquiry_route || input.inquiryRoute,
    ROUTES,
    leadType === 'resource_download' ? 'General Contact' : 'Buyer RFQ'
  );
  return {
    leadType,
    name: norm(input.name || input.fullName),
    company: norm(input.company || input.organization),
    email: norm(input.email).toLowerCase(),
    phone: norm(input.phone),
    normalizedPhone: normalizePhone(input.phone),
    inquiryRoute,
    interest: norm(input.interest || input.primaryInterest || 'General Inquiry'),
    application: norm(input.application),
    quantityContext: norm(input.quantity_context || input.quantityContext),
    targetTiming: norm(input.target_timing || input.targetTiming),
    destination: norm(input.destination),
    incoterm: norm(input.incoterm),
    hsCode: norm(input.hs_code || input.hsCode),
    filesAvailable: norm(input.files_available || input.filesAvailable),
    message: clip(input.message, 4000),
    downloadTitle: norm(input.download_title || input.downloadTitle),
    downloadUrl: norm(input.download_url || input.downloadUrl),
    sourcePage: norm(input.source_page || input.sourcePage),
    referrer: norm(input.referrer),
    consentContext: norm(input.consent_context || input.consentContext),
    consentAccepted: affirmative(input.privacy_accepted || input.privacyAccepted || input.consent_accepted),
    utmSource: norm(input.utm_source || input.utmSource),
    utmMedium: norm(input.utm_medium || input.utmMedium),
    utmCampaign: norm(input.utm_campaign || input.utmCampaign),
    utmTerm: norm(input.utm_term || input.utmTerm),
    utmContent: norm(input.utm_content || input.utmContent),
    turnstileToken: norm(input['cf-turnstile-response'] || input.turnstile_token || input.turnstileToken),
    website: norm(input.website || input._honey),
  };
}

export function validateLead(input = {}) {
  const data = normalizeLead(input);
  const errors = [];
  const warnings = [];

  if (data.website) return { ok: false, spam: true, errors: ['Spam protection triggered.'], warnings, data };
  if (data.name.length < 2) errors.push('Full name is required.');
  if (data.company.length < 2) errors.push('Company is required.');
  if (!isEmail(data.email)) errors.push('Valid email address is required.');
  if (!isPhone(data.phone)) errors.push('Phone / WhatsApp must include a valid number.');
  if (data.leadType !== 'resource_download' && data.message.length < 12) errors.push('Message is required.');
  if (data.leadType === 'resource_download' && !data.downloadTitle && !data.downloadUrl)
    errors.push('Download context is required.');
  if (!data.consentAccepted) errors.push('Please confirm the Privacy Notice before submitting.');
  if (!data.consentContext) errors.push('Consent context is required.');
  if (/(gmail|yahoo|hotmail|outlook|icloud)\.com$/i.test(data.email.split('@')[1] || ''))
    warnings.push('Personal email domain: verify company identity before portal or document access.');

  return { ok: errors.length === 0, spam: false, errors, warnings, data };
}

export function buildLeadId(data) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  const safeCompany =
    data.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 28) || 'lead';
  const random = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))
    .replace(/-/g, '')
    .slice(0, 6);
  return `MLD-${stamp}-${random}-${safeCompany}`;
}

export function buildLeadRecord(validation, requestMeta = {}) {
  const { data, warnings } = validation;
  const createdAt = new Date().toISOString();
  const id = buildLeadId(data);
  return {
    id,
    createdAt,
    leadType: data.leadType,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.normalizedPhone,
    inquiryRoute: data.inquiryRoute,
    interest: data.interest,
    application: data.application,
    quantityContext: data.quantityContext,
    targetTiming: data.targetTiming,
    destination: data.destination,
    incoterm: data.incoterm,
    hsCode: data.hsCode,
    filesAvailable: data.filesAvailable,
    message: data.message,
    downloadTitle: data.downloadTitle,
    downloadUrl: data.downloadUrl,
    sourcePage: data.sourcePage || requestMeta.urlPath || '',
    referrer: data.referrer || requestMeta.referrer || '',
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    utmTerm: data.utmTerm,
    utmContent: data.utmContent,
    consentContext: data.consentContext,
    consentAccepted: data.consentAccepted,
    userAgent: requestMeta.userAgent || '',
    cfCountry: requestMeta.cfCountry || '',
    ip: requestMeta.ip || '',
    status: 'received',
    warnings,
  };
}

export function leadInsertStatement() {
  return `INSERT INTO lead_intake (
    id, created_at, lead_type, name, company, email, phone, inquiry_route, interest,
    application, quantity_context, target_timing, destination, incoterm, hs_code,
    files_available, message, download_title, download_url, source_page, referrer,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, consent_context,
    user_agent, cf_country, ip, status, payload_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
}

export function leadInsertBindings(record) {
  return [
    record.id,
    record.createdAt,
    record.leadType,
    record.name,
    record.company,
    record.email,
    record.phone,
    record.inquiryRoute,
    record.interest,
    record.application,
    record.quantityContext,
    record.targetTiming,
    record.destination,
    record.incoterm,
    record.hsCode,
    record.filesAvailable,
    record.message,
    record.downloadTitle,
    record.downloadUrl,
    record.sourcePage,
    record.referrer,
    record.utmSource,
    record.utmMedium,
    record.utmCampaign,
    record.utmTerm,
    record.utmContent,
    record.consentContext,
    record.userAgent,
    record.cfCountry,
    record.ip,
    record.status,
    JSON.stringify(record),
  ];
}
