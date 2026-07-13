import { describe, expect, it } from 'vitest';
import { canTransition } from '@/lib/state-machines';

describe('workflow state machines', () => {
  it('allows valid RFQ transitions', () => {
    expect(canTransition('rfq', 'DRAFT', 'SUBMITTED')).toBe(true);
    expect(canTransition('rfq', 'QUOTED', 'APPROVED')).toBe(true);
  });

  it('rejects invalid RFQ transitions', () => {
    expect(canTransition('rfq', 'DRAFT', 'APPROVED')).toBe(false);
  });

  it('rejects invalid order jumps', () => {
    expect(canTransition('order', 'DRAFT', 'PRODUCTION')).toBe(false);
    expect(canTransition('order', 'DELIVERED', 'PRODUCTION')).toBe(false);
  });

  it('allows sequential shipment progression', () => {
    expect(canTransition('shipment', 'BOOKED', 'ON_BOARD')).toBe(true);
    expect(canTransition('shipment', 'IN_TRANSIT', 'ARRIVED')).toBe(true);
  });
});
