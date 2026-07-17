import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateIntake,
  buildSharePointFields,
  getGraphToken,
  getSharePointListContext,
  deleteContributorItem,
  graphJson,
  owsIntakeConstants,
} from '../functions/_shared/ows-intake-core.mjs';
import { handleOwsIntakePost } from '../functions/_shared/ows-intake-handler.mjs';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');

function validPayload(overrides = {}) {
  return {
    fullName: 'System Test Reviewer',
    email: `ows-intake-test-${Date.now()}@example.com`,
    phone: '+91 9999999999',
    country: 'India',
    organization: 'System Test Organization',
    designation: 'Quality and process reviewer',
    yearsExperience: '10-20 years',
    primaryExpertise: ['Factory production / process expert', 'Quality control / testing laboratory'],
    materialExpertise: ['Baseline UF / MUF / MF / PF resins', 'Formaldehyde scavengers / emission reduction', 'Wax / hydrophobes / water resistance'],
    boardExpertise: ['MDF / HDF', 'Particleboard / chipboard'],
    preferredDraft: '06_BASELINE_RESINS',
    profileProof: 'https://example.org/researcher/system-test-reviewer',
    experienceEvidence: '- MDF/HDF process and QC review using non-confidential process-control checks.\n- Internal lab testing exposure using publicly discussable test categories and standards.\n- Production issue triage role covering resin, wax, scavenger and panel-quality variables.',
    optionalCvLink: '',
    publicCreditConsent: 'Ask me before publication',
    conflictOfInterest: 'None',
    confidentialityConfirmation: owsIntakeConstants.CONFIRMATION,
    reviewMethodConfirmation: owsIntakeConstants.REVIEW_METHOD,
    dataConsent: true,
    sourcePage: 'https://moldartindia.com/open-wood-science/reviewer-intake/',
    website: '',
    ...overrides,
  };
}

async function getSiteAndList(token, listName) {
  const env = {
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
    SHAREPOINT_HOSTNAME: process.env.SHAREPOINT_HOSTNAME || 'yashdoshi.sharepoint.com',
    OWS_CONTRIBUTORS_LIST: listName,
  };
  return getSharePointListContext(env, token);
}

async function listCount(token, siteId, listId) {
  const json = await graphJson(token, `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?$top=999`);
  return json.value?.length ?? 0;
}

async function runUnitTests() {
  const valid = validPayload({ email: 'unit-valid@example.com' });
  const ok = validateIntake(valid);
  assert.equal(ok.ok, true, ok.errors.join('; '));
  assert.equal(ok.evidenceBullets.length, 3);
  const fields = buildSharePointFields(ok);
  assert.equal(fields.Status, 'Received - custom intake screening needed');
  assert.match(fields.ApprovalDecision, /Hold/);
  assert.match(fields.AssignedDocumentCode, /not assigned\/no access/);

  const validNeutralPhone = validateIntake(validPayload({ phone: '+91 9999999999', email: 'neutral-phone@example.com' }));
  assert.equal(validNeutralPhone.ok, true, 'Neutral test phone with country code should pass validation.');

  const missingCountryCode = validateIntake(validPayload({ phone: '9999999999', email: 'missing-country@example.com' }));
  assert.equal(missingCountryCode.ok, false);
  assert.match(missingCountryCode.errors.join('\n'), /country code/i);

  const placeholderProfile = validateIntake(validPayload({ profileProof: 'LinkedIn', email: 'placeholder@example.com' }));
  assert.equal(placeholderProfile.ok, false);
  assert.match(placeholderProfile.errors.join('\n'), /profile URL|official verification/i);

  const weakEvidence = validateIntake(validPayload({ experienceEvidence: 'Factory experience, lab testing', email: 'weak@example.com' }));
  assert.equal(weakEvidence.ok, false);
  assert.match(weakEvidence.errors.join('\n'), /3 non-confidential bullets/i);

  const pagePath = path.join(root, 'open-wood-science', 'reviewer-intake', 'index.html');
  const page = fs.readFileSync(pagePath, 'utf8');
  assert.equal(page.includes('+91 XXXXXXXXXX'), true, 'Page must use neutral phone placeholder.');
  assert.equal(page.includes('+91-7208088788'), true, 'Page should show Moldart company number in contact context.');
  assert.equal(page.includes('+91-7208188788'), true, 'Page should show Moldart company number in contact context.');
  assert.equal((page.match(/Technical experience evidence/g) || []).length >= 1, true);
  assert.equal(page.includes('Phone country code - select one'), false);
  assert.equal(page.includes('Verifiable profile type - choose'), false);
  assert.equal(page.includes('Completeness confirmation'), false);

  const invalidRequest = new Request('https://moldartindia.com/api/ows-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://moldartindia.com' },
    body: JSON.stringify({ fullName: 'Incomplete' }),
  });
  const invalidResponse = await handleOwsIntakePost(invalidRequest, {});
  assert.equal(invalidResponse.status, 400);

  const spamRequest = new Request('https://moldartindia.com/api/ows-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://moldartindia.com' },
    body: JSON.stringify(validPayload({ website: 'filled by bot' })),
  });
  const spamResponse = await handleOwsIntakePost(spamRequest, {});
  assert.equal(spamResponse.status, 200);
  assert.equal((await spamResponse.json()).ok, true);

  console.log('unit: ok');
}

async function runLiveApiTest() {
  const required = ['AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET'];
  for (const key of required) assert.ok(process.env[key], `Missing env ${key}`);

  const env = {
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
    SHAREPOINT_HOSTNAME: process.env.SHAREPOINT_HOSTNAME || 'yashdoshi.sharepoint.com',
    OWS_CONTRIBUTORS_LIST: 'OWS_Contributors',
    OWS_DISABLE_MAIL: 'true',
    OWS_SEND_FROM: 'yash@moldartindia.com',
    OWS_INTERNAL_NOTIFY: 'yash@moldartindia.com',
  };

  const token = await getGraphToken(env);
  const contributors = await getSharePointListContext(env, token);
  const assignments = await getSiteAndList(token, 'OWS_Review_Assignments');
  const accessLog = await getSiteAndList(token, 'OWS_Access_Log');
  const beforeAssignments = await listCount(token, assignments.siteId, assignments.listId);
  const beforeAccess = await listCount(token, accessLog.siteId, accessLog.listId);

  const payload = validPayload();
  const request = new Request('https://moldartindia.com/api/ows-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://moldartindia.com' },
    body: JSON.stringify(payload),
  });
  const response = await handleOwsIntakePost(request, env);
  const result = await response.json();
  assert.equal(response.status, 201, JSON.stringify(result));
  assert.equal(result.ok, true);
  assert.ok(result.itemId);

  try {
    const afterAssignments = await listCount(token, assignments.siteId, assignments.listId);
    const afterAccess = await listCount(token, accessLog.siteId, accessLog.listId);
    assert.equal(afterAssignments, beforeAssignments, 'API must not create OWS_Review_Assignments.');
    assert.equal(afterAccess, beforeAccess, 'API must not create OWS_Access_Log.');
    console.log(`live-api: created test OWS_Contributors item ${result.itemId}; no access/assignment created`);
  } finally {
    await deleteContributorItem(token, contributors.siteId, contributors.listId, result.itemId);
    console.log(`live-api: deleted test OWS_Contributors item ${result.itemId}`);
  }
}

await runUnitTests();
if (process.argv.includes('--live-api')) {
  await runLiveApiTest();
}
