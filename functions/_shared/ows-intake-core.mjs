const DOCUMENT_CODES = new Set([
  '01_SOY',
  '02_TANNIN',
  '03_LIGNIN',
  '04_MFC_CNF_CNC',
  '05_pMDI_AUXILIARY',
  '06_BASELINE_RESINS',
  '07A_CATALYSTS_HARDENERS',
  '07B_FORMALDEHYDE_SCAVENGERS',
  '07C_WAX_HYDROPHOBES',
  '07D_FR_PRESERVATIVES_DURABILITY',
  '08_HPL_LPL_SURFACE_SYSTEMS',
  'MOLDART_BEST_FIT',
]);

const YEARS = new Set(['Less than 5 years', '5-10 years', '10-20 years', 'More than 20 years']);
const CREDIT = new Set(['Name only', 'Name + affiliation', 'Name + affiliation + ORCID/LinkedIn', 'Anonymous / no public credit', 'Ask me before publication']);
const CONFIRMATION = 'I confirm I will not submit confidential factory, client, supplier, price-sensitive, trade-secret, or unauthorized unpublished data through this form or public review comments.';
const REVIEW_METHOD = 'I agree to review the full assigned private review copy section-by-section, use Word comments/tracked changes, not redistribute or send downloaded copies, and make every substantive correction or addition verifiable with a reason plus source link, DOI, standard/test method, page/table reference, SDS/COA, or legally shareable document. I will cite paywalled/licensed sources for Moldart verification without copying them in full, and I understand unsupported edits may be rejected.';

const PRIMARY_EXPERTISE = new Set([
  'Academic researcher',
  'Factory production / process expert',
  'Resin formulation / chemical expert',
  'Quality control / testing laboratory',
  'Standards / certification / compliance',
  'Supplier technical service',
  'Consultant / independent expert',
  'Other',
]);

const MATERIAL_EXPERTISE = new Set([
  'Soy-based binders',
  'Tannin-based binders',
  'Lignin-based binders',
  'MFC / CNF / CNC reinforcement',
  'pMDI auxiliary / hybrid systems',
  'Baseline UF / MUF / MF / PF resins',
  'Catalysts / hardeners / pH control',
  'Formaldehyde scavengers / emission reduction',
  'Wax / hydrophobes / water resistance',
  'Fire retardants / preservatives / durability chemistry',
  'HPL / LPL surface and impregnation systems',
  'Other / unsure',
]);

const BOARD_EXPERTISE = new Set([
  'Plywood / veneer panels',
  'MDF / HDF',
  'Particleboard / chipboard',
  'OSB / strand board',
  'LVL / engineered structural wood',
  'HPL / LPL / decorative laminates',
  'Flooring / overlay systems',
  'Doors / flush doors / blockboard',
  'Exterior / moisture-resistant panels',
  'Other / unsure',
]);

const DOC_LABELS = {
  '01_SOY': '01_SOY - Soy-based binder systems',
  '02_TANNIN': '02_TANNIN - Tannin-based binder systems',
  '03_LIGNIN': '03_LIGNIN - Lignin-based binder systems',
  '04_MFC_CNF_CNC': '04_MFC_CNF_CNC - Cellulose nanomaterials',
  '05_pMDI_AUXILIARY': '05_pMDI_AUXILIARY - pMDI auxiliary / hybrid systems',
  '06_BASELINE_RESINS': '06_BASELINE_RESINS - UF/MUF/MF/PF baseline systems',
  '07A_CATALYSTS_HARDENERS': '07A_CATALYSTS_HARDENERS - Catalysts and hardeners',
  '07B_FORMALDEHYDE_SCAVENGERS': '07B_FORMALDEHYDE_SCAVENGERS - Scavengers / emission reduction',
  '07C_WAX_HYDROPHOBES': '07C_WAX_HYDROPHOBES - Wax and hydrophobes',
  '07D_FR_PRESERVATIVES_DURABILITY': '07D_FR_PRESERVATIVES_DURABILITY - FR/preservatives/durability',
  '08_HPL_LPL_SURFACE_SYSTEMS': '08_HPL_LPL_SURFACE_SYSTEMS - HPL/LPL surface systems',
  'MOLDART_BEST_FIT': 'Moldart may assign best-fit draft',
};

export const owsIntakeConstants = {
  DOCUMENT_CODES: Array.from(DOCUMENT_CODES),
  DOC_LABELS,
  YEARS: Array.from(YEARS),
  CREDIT: Array.from(CREDIT),
  CONFIRMATION,
  REVIEW_METHOD,
  PRIMARY_EXPERTISE: Array.from(PRIMARY_EXPERTISE),
  MATERIAL_EXPERTISE: Array.from(MATERIAL_EXPERTISE),
  BOARD_EXPERTISE: Array.from(BOARD_EXPERTISE),
};

function norm(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normLong(value) {
  return String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

function asArray(value) {
  if (Array.isArray(value)) return value.map(norm).filter(Boolean);
  if (typeof value === 'string' && value.includes(';')) return value.split(';').map(norm).filter(Boolean);
  const single = norm(value);
  return single ? [single] : [];
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizePhone(value) {
  const raw = String(value ?? '').trim();
  const compact = raw.replace(/[\s().-]/g, '');
  return compact;
}

function isPhone(value) {
  const compact = normalizePhone(value);
  return /^\+[1-9]\d{7,14}$/.test(compact);
}

function isHttpsUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && Boolean(u.hostname.includes('.'));
  } catch (_) {
    return false;
  }
}

function domainOf(email) {
  return String(email || '').split('@')[1]?.toLowerCase() || '';
}

function hasBadPlaceholder(value) {
  const s = norm(value).toLowerCase();
  return !s || ['linkedin', 'na', 'n/a', 'none', 'no', '-', '--', 'test', 'example'].includes(s);
}

export function extractEvidenceBullets(value) {
  const text = normLong(value);
  return text
    .split(/\n|•|\u2022|\d+\)|\d+\.|;|\|/g)
    .map((part) => norm(part).replace(/^[-–—*]+\s*/, ''))
    .filter((part) => part.length >= 18);
}

function selectedValuesValid(values, allowed) {
  return values.length > 0 && values.every((v) => allowed.has(v));
}

export function normalizeSubmission(input = {}) {
  const email = norm(input.email).toLowerCase();
  const normalized = {
    fullName: norm(input.fullName),
    email,
    phone: norm(input.phone),
    normalizedPhone: normalizePhone(input.phone),
    country: norm(input.country),
    organization: norm(input.organization),
    designation: norm(input.designation),
    yearsExperience: norm(input.yearsExperience),
    primaryExpertise: asArray(input.primaryExpertise),
    materialExpertise: asArray(input.materialExpertise),
    boardExpertise: asArray(input.boardExpertise),
    preferredDraft: norm(input.preferredDraft),
    profileProof: normLong(input.profileProof),
    experienceEvidence: normLong(input.experienceEvidence),
    optionalCvLink: norm(input.optionalCvLink),
    publicCreditConsent: norm(input.publicCreditConsent),
    conflictOfInterest: normLong(input.conflictOfInterest),
    confidentialityConfirmation: norm(input.confidentialityConfirmation),
    reviewMethodConfirmation: norm(input.reviewMethodConfirmation),
    dataConsent: Boolean(input.dataConsent),
    sourcePage: norm(input.sourcePage),
    website: norm(input.website), // honeypot
  };
  return normalized;
}

export function validateIntake(input = {}) {
  const data = normalizeSubmission(input);
  const errors = [];
  const warnings = [];

  if (data.website) {
    return { ok: false, spam: true, errors: ['Spam protection triggered.'], warnings, data };
  }

  if (data.fullName.length < 3) errors.push('Full name is required.');
  if (!isEmail(data.email)) errors.push('Valid email address is required.');
  if (!isPhone(data.phone)) errors.push('Mobile / WhatsApp must include full country code in international format, e.g. +91 XXXXXXXXXX.');
  if (data.country.length < 2) errors.push('Country / region is required.');
  if (data.organization.length < 2) errors.push('Organization / institute / company is required.');
  if (data.designation.length < 2) errors.push('Designation / role is required.');
  if (!YEARS.has(data.yearsExperience)) errors.push('Years of relevant experience must be selected.');
  if (!selectedValuesValid(data.primaryExpertise, PRIMARY_EXPERTISE)) errors.push('Select at least one valid primary expertise type.');
  if (!selectedValuesValid(data.materialExpertise, MATERIAL_EXPERTISE)) errors.push('Select at least one valid material/system expertise area.');
  if (!selectedValuesValid(data.boardExpertise, BOARD_EXPERTISE)) errors.push('Select at least one valid board/application expertise area.');
  if (!DOCUMENT_CODES.has(data.preferredDraft)) errors.push('Select a valid preferred technical review draft.');

  if (hasBadPlaceholder(data.profileProof)) {
    errors.push('Provide a full verifiable https profile URL, or a clear official verification note using your company/institute email/domain and department.');
  } else if (!isHttpsUrl(data.profileProof)) {
    const emailDomain = domainOf(data.email);
    const proof = data.profileProof.toLowerCase();
    if (!emailDomain || !proof.includes(emailDomain) || proof.length < 35) {
      errors.push('Profile proof must be a full https URL, or a detailed official verification note that includes your official email/domain and department.');
    }
  }

  if (data.optionalCvLink && !isHttpsUrl(data.optionalCvLink)) {
    errors.push('Optional CV/profile/publication link must be a valid https URL if provided.');
  }

  const bullets = extractEvidenceBullets(data.experienceEvidence);
  if (bullets.length < 3) {
    errors.push('Technical experience evidence must include at least 3 non-confidential bullets with product/process area, tests or standards used, and your role.');
  }

  if (!CREDIT.has(data.publicCreditConsent)) errors.push('Public reviewer credit preference must be selected.');
  if (!data.conflictOfInterest || data.conflictOfInterest.length < 4) errors.push('Conflict of interest declaration is required; write None if none.');
  if (data.confidentialityConfirmation !== CONFIRMATION) errors.push('Confidentiality confirmation is required.');
  if (data.reviewMethodConfirmation !== REVIEW_METHOD) errors.push('Review method and document-handling confirmation is required.');
  if (!data.dataConsent) errors.push('Data-use consent is required for intake screening and review assignment management.');

  const emailDomain = domainOf(data.email);
  if (emailDomain && ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(emailDomain)) {
    warnings.push('Personal email domain: verify identity before draft access.');
  }
  if (/supplier|vendor|sales|commercial/i.test(`${data.primaryExpertise.join(' ')} ${data.designation}`)) {
    warnings.push('Potential supplier/commercial profile: human conflict review required.');
  }
  if (!/^none$/i.test(data.conflictOfInterest)) {
    warnings.push('Conflict declaration is not None: human review required.');
  }

  return { ok: errors.length === 0, spam: false, errors, warnings, data, evidenceBullets: bullets };
}

function clip(value, max = 255) {
  const s = norm(value);
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

function join(values, max = 255) {
  return clip(values.join('; '), max);
}

export function buildSubmissionId(data) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const safeName = data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'reviewer';
  return `OWS-${stamp}-${safeName}`;
}

export function buildSharePointFields(validation, sourceFormLink = 'https://moldartindia.com/open-wood-science/reviewer-intake/') {
  const { data, warnings, evidenceBullets } = validation;
  const submissionId = buildSubmissionId(data);
  const warningText = warnings.length ? ` Warnings: ${warnings.join(' | ')}` : '';
  const notes = `Custom intake staged. Evidence bullets: ${evidenceBullets.length}. Human screening required before draft access.${warningText}`;
  const preferred = data.preferredDraft === 'MOLDART_BEST_FIT' ? 'Moldart may assign best-fit draft' : data.preferredDraft;

  return {
    Title: clip(data.fullName),
    Email: clip(data.email),
    MobileWhatsApp: clip(data.normalizedPhone),
    Country: clip(data.country),
    Organization: clip(data.organization),
    Designation: clip(data.designation),
    YearsExperience: clip(data.yearsExperience),
    PrimaryExpertiseType: join(data.primaryExpertise),
    Specialization: clip(`${data.designation}; ${data.organization}; ${data.boardExpertise.join(', ')}`),
    MaterialExpertise: join(data.materialExpertise),
    ApplicationExpertise: join(data.boardExpertise),
    PreferredDraft: clip(preferred),
    ProfileLinks: clip(data.profileProof),
    OptionalCVLink: clip(data.optionalCvLink || 'None supplied'),
    PublicCreditConsent: clip(data.publicCreditConsent),
    ConflictofInterest: clip(data.conflictOfInterest),
    ConfidentialityConfirmation: 'Confirmed',
    ReviewMethodConfirmation: 'Confirmed',
    IntakeDate: new Date().toISOString().slice(0, 10),
    SourceFormLink: clip(sourceFormLink),
    FormResponseId: clip(submissionId),
    Status: 'Received - custom intake screening needed',
    ScreeningScore: clip(`Validation passed; warnings ${warnings.length}; evidence bullets ${evidenceBullets.length}`),
    ApprovalDecision: 'Hold - human screening required before draft access',
    AssignedDocumentCode: clip(`Requested ${preferred}; not assigned/no access`),
    ReviewerCreditFinal: 'Not decided',
    Notes: clip(notes),
  };
}

export function buildAcknowledgementEmail(validation) {
  const { data } = validation;
  const preferred = DOC_LABELS[data.preferredDraft] || data.preferredDraft;
  return `Dear ${data.fullName},\n\nThank you for submitting the Open Wood Science expert reviewer intake form.\n\nWe have received your application and will screen it for identity, expertise fit, conflict status, confidentiality, and best draft assignment before any document access is granted.\n\nRequested/preferred review area: ${preferred}.\n\nFor clarity, we do not share the full working folder or master drafts directly. If your screening is approved, you will receive access only to one assigned private Word/SharePoint review copy, where comments and tracked changes are used.\n\nBest regards,\nYash Lalit Doshi\nAddress: #7, Building No. 1, New Sonal Link Industrial Estate, Link Road, Malad (West), Mumbai - 64, India\nPhone: +91-7208088788 | +91-7208188788\nWebsite: https://moldartindia.com\nConfidentiality Notice: This email, including any attachments, is intended solely for the designated recipient(s) and may contain confidential or privileged information. Any unauthorized review, use, disclosure, duplication, or distribution is strictly prohibited without explicit written permission from the sender. If you have received this message in error, please inform the sender immediately, delete it from your system, and refrain from using or sharing its content.`;
}

export function buildInternalNotificationEmail(validation, itemUrl = '') {
  const { data, warnings, evidenceBullets } = validation;
  return `New Open Wood Science reviewer intake staged.\n\nName: ${data.fullName}\nEmail: ${data.email}\nPhone: ${data.normalizedPhone}\nOrganization: ${data.organization}\nRole: ${data.designation}\nCountry: ${data.country}\nPreferred draft: ${data.preferredDraft}\nPrimary expertise: ${data.primaryExpertise.join('; ')}\nMaterial expertise: ${data.materialExpertise.join('; ')}\nBoard/application expertise: ${data.boardExpertise.join('; ')}\nProfile proof: ${data.profileProof}\nEvidence bullets detected: ${evidenceBullets.length}\nWarnings: ${warnings.length ? warnings.join(' | ') : 'None'}\n\nStatus: Hold - human screening required before draft access.\nSharePoint item: ${itemUrl || 'created'}\n\nDo not create OWS_Review_Assignments until screening is approved.`;
}

export async function getGraphToken(env) {
  const tenant = env.AZURE_TENANT_ID;
  const clientId = env.AZURE_CLIENT_ID;
  const clientSecret = env.AZURE_CLIENT_SECRET;
  if (!tenant || !clientId || !clientSecret) throw new Error('Missing Azure Graph credentials.');
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
  });
  const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`Graph token failed: ${response.status}`);
  const json = await response.json();
  return json.access_token;
}

export async function graphJson(token, url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let json = null;
  if (text) {
    try { json = JSON.parse(text); } catch (_) { json = { raw: text }; }
  }
  if (!response.ok) {
    const detail = json?.error?.message || json?.raw || response.statusText;
    throw new Error(`Graph request failed ${response.status}: ${detail}`);
  }
  return json;
}

export async function getSharePointListContext(env, token) {
  const host = env.SHAREPOINT_HOSTNAME || 'yashdoshi.sharepoint.com';
  const sitePath = env.OWS_SITE_PATH || '/';
  const listName = env.OWS_CONTRIBUTORS_LIST || 'OWS_Contributors';
  const siteUrl = sitePath === '/' ? `https://graph.microsoft.com/v1.0/sites/${host}:/` : `https://graph.microsoft.com/v1.0/sites/${host}:${sitePath}`;
  const site = await graphJson(token, siteUrl);
  const lists = await graphJson(token, `https://graph.microsoft.com/v1.0/sites/${site.id}/lists?$select=id,displayName`);
  const list = lists.value.find((entry) => entry.displayName === listName);
  if (!list) throw new Error(`SharePoint list not found: ${listName}`);
  return { siteId: site.id, listId: list.id, listName };
}

export async function findExistingContributor(token, siteId, listId, email) {
  const lower = email.toLowerCase();
  let url = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?expand=fields&$top=200`;
  for (let pageNumber = 0; url && pageNumber < 20; pageNumber += 1) {
    const page = await graphJson(token, url);
    const existing = page.value.find((item) => String(item.fields?.Email || '').toLowerCase() === lower);
    if (existing) return existing;
    url = page['@odata.nextLink'] || '';
  }
  return null;
}

export async function createContributorItem(token, siteId, listId, fields) {
  return graphJson(token, `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
}

export async function deleteContributorItem(token, siteId, listId, itemId) {
  const response = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok && response.status !== 404) throw new Error(`Delete contributor failed: ${response.status}`);
}

export async function sendGraphMail(token, fromUser, message) {
  await graphJson(token, `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(fromUser)}/sendMail`, {
    method: 'POST',
    body: JSON.stringify({ message, saveToSentItems: true }),
  });
}

export function buildMailMessage({ to, subject, body }) {
  return {
    subject,
    body: { contentType: 'Text', content: body },
    toRecipients: [{ emailAddress: { address: to } }],
  };
}
