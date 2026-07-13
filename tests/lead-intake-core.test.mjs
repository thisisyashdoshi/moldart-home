import { describe, expect, it } from 'vitest';

import {
  buildLeadRecord,
  leadInsertBindings,
  leadInsertStatement,
  validateLead,
} from '../functions/_shared/lead-intake-core.mjs';

const validLead = {
  lead_type: 'contact_inquiry',
  name: 'Test Buyer',
  company: 'Example Panels Pvt Ltd',
  email: 'BUYER@EXAMPLE.COM',
  phone: '+91 99999 99999',
  inquiry_route: 'Buyer RFQ',
  interest: 'Press plates',
  message: 'Testing a valid Moldart RFQ submission path.',
  consent_context: 'Unit test consent context.',
};

describe('lead intake core', () => {
  it('validates and normalizes a real RFQ lead', () => {
    const validation = validateLead(validLead);

    expect(validation.ok).toBe(true);
    expect(validation.data.email).toBe('buyer@example.com');
    expect(validation.data.normalizedPhone).toBe('+919999999999');
    expect(validation.warnings).toEqual([]);
  });

  it('rejects incomplete contact leads', () => {
    const validation = validateLead({ name: 'A', company: '', email: 'bad', phone: '123', message: '' });

    expect(validation.ok).toBe(false);
    expect(validation.errors).toContain('Full name is required.');
    expect(validation.errors).toContain('Company is required.');
    expect(validation.errors).toContain('Valid email address is required.');
  });

  it('treats honeypot submissions as spam without accepting them as valid', () => {
    const validation = validateLead({ ...validLead, website: 'https://spam.example' });

    expect(validation.spam).toBe(true);
    expect(validation.ok).toBe(false);
  });

  it('requires download context for resource-gate leads', () => {
    const validation = validateLead({ ...validLead, lead_type: 'resource_download', message: '' });

    expect(validation.ok).toBe(false);
    expect(validation.errors).toContain('Download context is required.');
  });

  it('keeps D1 insert statement and bindings aligned', () => {
    const validation = validateLead(validLead);
    const record = buildLeadRecord(validation, { urlPath: '/contact/', userAgent: 'vitest' });
    const placeholders = (leadInsertStatement().match(/\?/g) || []).length;

    expect(leadInsertBindings(record)).toHaveLength(placeholders);
    expect(record.sourcePage).toBe('/contact/');
  });
});
