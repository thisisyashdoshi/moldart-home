import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  authorizeAdmin,
  buildAssignmentFields,
  buildDashboard,
  loadAdminDashboardData,
  validateAssignmentInput,
} from '../functions/_shared/ows-admin-core.mjs';
import { handleOwsAdminGet, handleOwsAdminPost } from '../functions/_shared/ows-admin-handler.mjs';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');

function request(headers = {}) {
  return new Request('https://moldartindia.com/api/ows-admin', { headers });
}

function graphItem(id, fields, modified = '2026-04-30T10:00:00Z') {
  return { id, fields, lastModifiedDateTime: modified };
}

async function runUnitTests() {
  assert.equal(authorizeAdmin(request(), {}).status, 503);
  assert.equal(authorizeAdmin(request({ Authorization: 'Bearer bad' }), { OWS_ADMIN_TOKEN: 'good' }).status, 401);
  assert.equal(authorizeAdmin(request({ Authorization: 'Bearer good' }), { OWS_ADMIN_TOKEN: 'good' }).ok, true);
  assert.equal(authorizeAdmin(request({ 'x-ows-admin-token': 'good' }), { OWS_ADMIN_TOKEN: 'good' }).ok, true);

  const invalidAssignment = validateAssignmentInput({ reviewerName: 'A', reviewerEmail: 'bad', documentCode: 'NOPE', dueDate: '30-04-2026' });
  assert.equal(invalidAssignment.ok, false);
  assert.match(invalidAssignment.errors.join('\n'), /email/i);
  assert.match(invalidAssignment.errors.join('\n'), /document code/i);

  const validAssignment = validateAssignmentInput({
    assignmentId: 'ASN-TEST123',
    reviewerName: 'Dr System Reviewer',
    reviewerEmail: 'reviewer@example.com',
    documentCode: '06_BASELINE_RESINS',
    dueDate: '2026-05-15',
    confirmNoMasterAccess: true,
    confirmPrivateCopyOnly: true,
  });
  assert.equal(validAssignment.ok, true, validAssignment.errors.join('; '));
  const built = buildAssignmentFields(validAssignment.data);
  assert.equal(built.assignmentId, 'ASN-TEST123');
  assert.equal(built.fields.AccessStatus, 'Approved - Send Access');
  assert.equal(built.fields.ParentFolderShared, 'No');
  assert.equal(built.fields.PermissionLevel, 'Private review copy only');

  const dashboard = buildDashboard({
    missingLists: [],
    items: {
      OWS_Contributors: [graphItem('1', { Title: 'Reviewer One', Email: 'one@example.com', Status: 'Received - custom intake screening needed', ApprovalDecision: 'Hold - human screening required before draft access', PreferredDraft: '01_SOY' })],
      OWS_Review_Assignments: [graphItem('2', { Title: 'ASN-READY', ReviewerEmail: 'one@example.com', DocumentCode: '01_SOY', AccessStatus: 'Approved - Send Access', ParentFolderShared: 'No' })],
      OWS_Access_Log: [],
      OWS_Change_Log: [graphItem('3', { Title: 'change', FilePath: 'Open Wood Science/file.docx', ChangeModifiedDate: '2026-04-30T11:00:00Z' })],
      OWS_Documents: [graphItem('4', { Title: '01_SOY', Status: 'Working / Expert Review', DraftVersion: 'v0.2' })],
      OWS_Publication_Pipeline: [graphItem('5', { Title: '01_SOY', PublicStatus: 'Not approved' })],
    },
  }, {});
  assert.equal(dashboard.ok, true);
  assert.equal(dashboard.contributors.length, 1);
  assert.equal(dashboard.assignments.length, 1);
  assert.equal(dashboard.risks.some((entry) => /approved and waiting/.test(entry.message)), true);

  const missingTokenResponse = await handleOwsAdminGet(request(), {});
  assert.equal(missingTokenResponse.status, 503);
  const unauthorizedResponse = await handleOwsAdminGet(request({ Authorization: 'Bearer bad' }), { OWS_ADMIN_TOKEN: 'good' });
  assert.equal(unauthorizedResponse.status, 401);

  const dryRunRequest = new Request('https://moldartindia.com/api/ows-admin', {
    method: 'POST',
    headers: { Authorization: 'Bearer good', 'Content-Type': 'application/json', Origin: 'https://moldartindia.com' },
    body: JSON.stringify({
      action: 'prepareAssignment',
      reviewerName: 'Dr System Reviewer',
      reviewerEmail: 'reviewer@example.com',
      documentCode: '06_BASELINE_RESINS',
      dueDate: '2026-05-15',
      dryRun: true,
    }),
  });
  const dryRunResponse = await handleOwsAdminPost(dryRunRequest, { OWS_ADMIN_TOKEN: 'good' });
  assert.equal(dryRunResponse.status, 200);
  const dryRunJson = await dryRunResponse.json();
  assert.equal(dryRunJson.dryRun, true);
  assert.equal(dryRunJson.assignment.fields.AccessStatus, 'Approved - Send Access');

  const unsafeLiveRequest = new Request('https://moldartindia.com/api/ows-admin', {
    method: 'POST',
    headers: { Authorization: 'Bearer good', 'Content-Type': 'application/json', Origin: 'https://moldartindia.com' },
    body: JSON.stringify({
      action: 'prepareAssignment',
      reviewerName: 'Dr System Reviewer',
      reviewerEmail: 'reviewer@example.com',
      documentCode: '06_BASELINE_RESINS',
      dryRun: false,
    }),
  });
  const unsafeLiveResponse = await handleOwsAdminPost(unsafeLiveRequest, { OWS_ADMIN_TOKEN: 'good', OWS_ADMIN_ENABLE_MUTATIONS: 'true' });
  assert.equal(unsafeLiveResponse.status, 400);

  const page = fs.readFileSync(path.join(root, 'open-wood-science', 'internal-control', 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(root, 'open-wood-science', 'internal-control', 'inline-internal-control-1.js'), 'utf8');
  assert.equal(page.includes('noindex,nofollow'), true);
  assert.equal(js.includes('/api/ows-admin'), true);
  assert.equal(js.includes('sessionStorage'), true);
  assert.equal(js.includes('localStorage'), false);
  assert.equal(page.includes('master draft or parent folder'), true);

  console.log('unit: ok');
}

async function runLiveReadTest() {
  const required = ['AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.log(`live-read: skipped; missing env ${missing.join(', ')}`);
    return;
  }
  const data = await loadAdminDashboardData({
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
    SHAREPOINT_HOSTNAME: process.env.SHAREPOINT_HOSTNAME || 'yashdoshi.sharepoint.com',
    OWS_ADMIN_LIST_TOP: '25',
  });
  const dashboard = buildDashboard(data, { OWS_ADMIN_LIST_TOP: '25' });
  assert.equal(dashboard.ok, true);
  assert.equal(Array.isArray(dashboard.metrics), true);
  console.log(`live-read: loaded ${dashboard.metrics.length} metrics; missing lists ${dashboard.missingLists.length}`);
}

await runUnitTests();
if (process.argv.includes('--live-api')) {
  await runLiveReadTest();
}
