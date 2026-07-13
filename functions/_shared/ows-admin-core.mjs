import { getGraphToken, graphJson } from './ows-intake-core.mjs';

export const OWS_DOCUMENT_CODES = [
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
];

export const OWS_ADMIN_LISTS = [
  'OWS_Contributors',
  'OWS_Review_Assignments',
  'OWS_Access_Log',
  'OWS_Change_Log',
  'OWS_Documents',
  'OWS_Publication_Pipeline',
];

const APPROVAL_TRIGGER_STATUSES = new Set(['approved - send access', 'approved', 'pending invite']);

function norm(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function lower(value) {
  return norm(value).toLowerCase();
}

function clip(value, max = 255) {
  const text = norm(value);
  return text.length <= max ? text : text.slice(0, max - 1) + '…';
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm(value));
}

function isIsoDate(value) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(norm(value));
}

function field(item, name, fallback = '') {
  return item?.fields?.[name] ?? fallback;
}

function latestFirst(items) {
  return [...items].sort((a, b) => String(b.lastModifiedDateTime || '').localeCompare(String(a.lastModifiedDateTime || '')));
}

function metric(label, value, tone = 'neutral') {
  return { label, value, tone };
}

function risk(level, message) {
  return { level, message };
}

export function mutationsEnabled(env = {}) {
  return lower(env.OWS_ADMIN_ENABLE_MUTATIONS) === 'true';
}

export function authorizeAdmin(request, env = {}) {
  const configured = norm(env.OWS_ADMIN_TOKEN);
  if (!configured) {
    return {
      ok: false,
      status: 503,
      payload: {
        ok: false,
        errors: ['OWS admin API is disabled because OWS_ADMIN_TOKEN is not configured.'],
      },
    };
  }

  const auth = request.headers.get('Authorization') || '';
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || '';
  const headerToken = request.headers.get('x-ows-admin-token')?.trim() || '';
  const provided = bearer || headerToken;

  if (!provided || provided !== configured) {
    return {
      ok: false,
      status: 401,
      payload: { ok: false, errors: ['Unauthorized OWS admin request.'] },
    };
  }

  return { ok: true };
}

export function normalizeDocumentCode(value) {
  const raw = norm(value);
  const head = raw.split(' - ', 1)[0];
  return OWS_DOCUMENT_CODES.includes(raw) ? raw : head;
}

export function validateAssignmentInput(input = {}) {
  const data = {
    contributorItemId: norm(input.contributorItemId),
    reviewerName: norm(input.reviewerName || input.name),
    reviewerEmail: norm(input.reviewerEmail || input.email).toLowerCase(),
    documentCode: normalizeDocumentCode(input.documentCode || input.doc),
    dueDate: norm(input.dueDate),
    approvalBy: norm(input.approvalBy || 'OWS internal control'),
    notes: norm(input.notes),
    assignmentId: norm(input.assignmentId),
    confirmNoMasterAccess: Boolean(input.confirmNoMasterAccess),
    confirmPrivateCopyOnly: Boolean(input.confirmPrivateCopyOnly),
  };
  const errors = [];

  if (data.reviewerName.length < 2) errors.push('Reviewer name is required.');
  if (!isEmail(data.reviewerEmail)) errors.push('Valid reviewer email is required.');
  if (!OWS_DOCUMENT_CODES.includes(data.documentCode)) errors.push('Valid OWS document code is required.');
  if (!isIsoDate(data.dueDate)) errors.push('Due date must use YYYY-MM-DD when provided.');
  if (data.assignmentId && !/^ASN-[A-Z0-9-]{6,40}$/.test(data.assignmentId)) errors.push('Assignment ID must start with ASN- and use uppercase letters/numbers/hyphens.');

  return { ok: errors.length === 0, errors, data };
}

function newAssignmentId() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `ASN-${stamp}-${random}`;
}

export function buildAssignmentFields(data) {
  const assignmentId = data.assignmentId || newAssignmentId();
  const now = new Date().toISOString();
  const notes = [
    'Created from OWS internal-control web dashboard.',
    'Triggers private-copy automation only; master and parent folder must not be shared.',
    data.contributorItemId ? `Contributor item ${data.contributorItemId}.` : '',
    data.notes,
  ].filter(Boolean).join(' ');

  const fields = {
    Title: assignmentId,
    ReviewerEmail: clip(data.reviewerEmail),
    ReviewerName: clip(data.reviewerName),
    DocumentCode: data.documentCode,
    AccessStatus: 'Approved - Send Access',
    DueDate: data.dueDate,
    ApprovalBy: clip(data.approvalBy),
    ApprovedDate: now,
    PermissionLevel: 'Private review copy only',
    ReviewStatus: 'Approved - awaiting private-copy automation',
    TechnicalDecision: 'Pending review',
    CreditDecision: 'Pending accepted contribution and consent',
    MergeStatus: 'Not merged',
    ParentFolderShared: 'No',
    FullReviewConfirmed: 'Pending reviewer completion',
    SourceEvidenceStatus: 'Source-backed review required',
    PaywalledSourceHandling: 'Citation only unless legally shareable',
    Notes: clip(notes, 250),
  };

  Object.keys(fields).forEach((key) => {
    if (fields[key] === '') delete fields[key];
  });

  return { assignmentId, fields };
}

export async function getSharePointSiteId(env, token) {
  const host = env.SHAREPOINT_HOSTNAME || 'yashdoshi.sharepoint.com';
  const sitePath = env.OWS_SITE_PATH || '/';
  const url = sitePath === '/'
    ? `https://graph.microsoft.com/v1.0/sites/${host}:/`
    : `https://graph.microsoft.com/v1.0/sites/${host}:${sitePath}`;
  const site = await graphJson(token, url);
  return site.id;
}

export async function getListMap(token, siteId) {
  const data = await graphJson(token, `https://graph.microsoft.com/v1.0/sites/${siteId}/lists?$select=id,displayName,webUrl`);
  return Object.fromEntries((data.value || []).map((item) => [item.displayName, item]));
}

export async function readListItems(token, siteId, listId, top = 100) {
  const safeTop = Math.max(1, Math.min(Number(top) || 100, 999));
  const out = [];
  let url = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?$expand=fields&$top=${safeTop}`;
  while (url && out.length < safeTop) {
    const page = await graphJson(token, url);
    out.push(...(page.value || []));
    url = page['@odata.nextLink'] || '';
  }
  return out.slice(0, safeTop);
}

export async function loadAdminDashboardData(env = {}) {
  const token = await getGraphToken(env);
  const siteId = await getSharePointSiteId(env, token);
  const lists = await getListMap(token, siteId);
  const top = Number(env.OWS_ADMIN_LIST_TOP || 150);
  const items = {};
  const missingLists = [];

  for (const name of OWS_ADMIN_LISTS) {
    if (!lists[name]) {
      missingLists.push(name);
      items[name] = [];
      continue;
    }
    const listTop = name === 'OWS_Change_Log' ? Math.min(top, 80) : top;
    items[name] = await readListItems(token, siteId, lists[name].id, listTop);
  }

  return { token, siteId, lists, items, missingLists };
}

export async function createReviewAssignment(env, fields) {
  const token = await getGraphToken(env);
  const siteId = await getSharePointSiteId(env, token);
  const lists = await getListMap(token, siteId);
  const list = lists.OWS_Review_Assignments;
  if (!list) throw new Error('OWS_Review_Assignments list not found.');
  const item = await graphJson(token, `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${list.id}/items`, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
  return { siteId, item };
}

function shapeContributor(item) {
  return {
    id: item.id,
    modified: item.lastModifiedDateTime || '',
    name: field(item, 'Title'),
    email: field(item, 'Email'),
    phone: field(item, 'MobileWhatsApp'),
    organization: field(item, 'Organization'),
    country: field(item, 'Country'),
    preferredDraft: field(item, 'PreferredDraft'),
    status: field(item, 'Status'),
    approvalDecision: field(item, 'ApprovalDecision'),
    screeningScore: field(item, 'ScreeningScore'),
    notes: field(item, 'Notes'),
  };
}

function shapeAssignment(item) {
  return {
    id: item.id,
    modified: item.lastModifiedDateTime || '',
    assignmentId: field(item, 'Title'),
    reviewerName: field(item, 'ReviewerName'),
    reviewerEmail: field(item, 'ReviewerEmail'),
    documentCode: field(item, 'DocumentCode'),
    accessStatus: field(item, 'AccessStatus'),
    reviewStatus: field(item, 'ReviewStatus'),
    dueDate: field(item, 'DueDate'),
    reviewCopyPath: field(item, 'ReviewCopyPath'),
    draftLink: field(item, 'DraftLink'),
    parentFolderShared: field(item, 'ParentFolderShared'),
    sourceEvidenceStatus: field(item, 'SourceEvidenceStatus'),
    publicationSafetyDecision: field(item, 'PublicationSafetyDecision'),
    notes: field(item, 'Notes'),
  };
}

function shapeDocument(item) {
  return {
    id: item.id,
    code: field(item, 'Title'),
    status: field(item, 'Status'),
    draftVersion: field(item, 'DraftVersion'),
    path: field(item, 'WorkingFilePath'),
    notes: field(item, 'Notes'),
  };
}

function shapePublication(item) {
  return {
    id: item.id,
    code: field(item, 'Title'),
    publicStatus: field(item, 'PublicStatus') || field(item, 'ApprovedforPublic'),
    finalDocx: field(item, 'FinalDOCX'),
    finalPdf: field(item, 'FinalPDF'),
    revisionDue: field(item, 'RevisionDue'),
    notes: field(item, 'Notes'),
  };
}

function shapeChange(item) {
  return {
    id: item.id,
    modified: field(item, 'ChangeModifiedDate') || item.lastModifiedDateTime || '',
    title: field(item, 'Title'),
    filePath: field(item, 'FilePath'),
    editor: field(item, 'EditorName'),
    documentCode: field(item, 'DocumentCode'),
    assignmentId: field(item, 'AssignmentId'),
    action: field(item, 'ReviewAction'),
  };
}

export function buildDashboard(data, env = {}) {
  const items = data.items || {};
  const contributors = latestFirst(items.OWS_Contributors || []).map(shapeContributor);
  const assignments = latestFirst(items.OWS_Review_Assignments || []).map(shapeAssignment);
  const documents = latestFirst(items.OWS_Documents || []).map(shapeDocument);
  const publication = latestFirst(items.OWS_Publication_Pipeline || []).map(shapePublication);
  const changes = latestFirst(items.OWS_Change_Log || []).map(shapeChange);
  const accessLogs = latestFirst(items.OWS_Access_Log || []);

  const pendingContributors = contributors.filter((entry) => {
    const text = lower(`${entry.status} ${entry.approvalDecision}`);
    return !/rejected|not suitable|invitation sent/.test(text) && /received|screening|hold|awaiting|pending/.test(text);
  });
  const readyAssignments = assignments.filter((entry) => APPROVAL_TRIGGER_STATUSES.has(lower(entry.accessStatus)));
  const sentAssignments = assignments.filter((entry) => lower(entry.accessStatus).includes('invitation sent'));
  const unsafeParentShare = assignments.filter((entry) => entry.parentFolderShared && lower(entry.parentFolderShared) !== 'no');
  const notApprovedPublications = publication.filter((entry) => !/^approved|yes$/i.test(norm(entry.publicStatus)));

  const risks = [];
  if (data.missingLists?.length) risks.push(risk('high', `Missing SharePoint Lists: ${data.missingLists.join(', ')}`));
  if (unsafeParentShare.length) risks.push(risk('high', `${unsafeParentShare.length} assignment(s) do not show ParentFolderShared = No.`));
  if (readyAssignments.length) risks.push(risk('medium', `${readyAssignments.length} assignment(s) are approved and waiting for private-copy automation.`));
  if (pendingContributors.length) risks.push(risk('medium', `${pendingContributors.length} contributor(s) need screening or a hold/reject/approve decision.`));
  if (!risks.length) risks.push(risk('low', 'No immediate workflow blockers found in the loaded list window.'));

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    mutationsEnabled: mutationsEnabled(env),
    listWindow: Number(env.OWS_ADMIN_LIST_TOP || 150),
    missingLists: data.missingLists || [],
    metrics: [
      metric('contributors loaded', contributors.length),
      metric('needs screening', pendingContributors.length, pendingContributors.length ? 'warn' : 'ok'),
      metric('assignments loaded', assignments.length),
      metric('approved to send', readyAssignments.length, readyAssignments.length ? 'warn' : 'ok'),
      metric('invitations sent', sentAssignments.length, 'ok'),
      metric('access logs loaded', accessLogs.length),
      metric('documents tracked', documents.length),
      metric('not public-approved', notApprovedPublications.length, notApprovedPublications.length ? 'warn' : 'ok'),
      metric('recent change logs', changes.length),
    ],
    risks,
    contributors: pendingContributors.slice(0, 25),
    recentContributors: contributors.slice(0, 10),
    assignments: assignments.slice(0, 25),
    documents: documents.slice(0, 25),
    publication: publication.slice(0, 25),
    recentChanges: changes.slice(0, 20),
  };
}
