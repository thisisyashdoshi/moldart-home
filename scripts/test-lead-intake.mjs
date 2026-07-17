#!/usr/bin/env node
import { handleLeadIntakePost } from '../functions/_shared/lead-intake-handler.mjs';

const body = {
  lead_type: 'contact_inquiry',
  name: 'Test Buyer',
  company: 'Example Panels Pvt Ltd',
  email: 'buyer@example.com',
  phone: '+919999999999',
  inquiry_route: 'Buyer RFQ',
  interest: 'General Inquiry',
  application: 'Panel sourcing',
  quantity_context: 'Trial order',
  target_timing: 'This month',
  destination: 'Mumbai',
  message: 'Testing the owned Moldart lead intake validation and dry-run path.',
  source_page: '/contact/',
  consent_context: 'Local dry-run test consent context.',
  privacy_accepted: 'yes',
};

async function submit(payload) {
  const request = new Request('https://moldartindia.com/api/lead-intake', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://moldartindia.com',
      'user-agent': 'lead-intake-test',
    },
    body: JSON.stringify(payload),
  });
  const response = await handleLeadIntakePost(request, {
    LEAD_INTAKE_DRY_RUN: 'true',
    ALLOWED_ORIGINS: 'https://moldartindia.com',
  });
  return { response, json: await response.json() };
}

const accepted = await submit(body);
const rejected = await submit({ ...body, privacy_accepted: '' });
const summary = {
  accepted: { status: accepted.response.status, ...accepted.json },
  missingPrivacyAcceptance: { status: rejected.response.status, ...rejected.json },
};
console.log(JSON.stringify(summary, null, 2));

const missingConsentRejected =
  rejected.response.status === 400 &&
  rejected.json.errors?.includes('Please confirm the Privacy Notice before submitting.');
if (!accepted.response.ok || !accepted.json.ok || !missingConsentRejected) process.exit(1);
