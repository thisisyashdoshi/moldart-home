const transitions = {
  rfq: {
    DRAFT: ['SUBMITTED', 'CANCELLED'],
    SUBMITTED: ['UNDER_REVIEW', 'CANCELLED'],
    UNDER_REVIEW: ['QUOTED', 'REVISED', 'CANCELLED'],
    QUOTED: ['REVISED', 'APPROVED', 'CLOSED', 'CANCELLED'],
    REVISED: ['UNDER_REVIEW', 'QUOTED', 'CANCELLED'],
    APPROVED: ['CLOSED'],
    CLOSED: [],
    CANCELLED: [],
  },
  quote: {
    DRAFT: ['ISSUED', 'CANCELLED'],
    ISSUED: ['REVISED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'SUPERSEDED'],
    REVISED: ['ISSUED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
    ACCEPTED: ['SUPERSEDED'],
    REJECTED: [],
    EXPIRED: [],
    SUPERSEDED: [],
    CANCELLED: [],
  },
  order: {
    DRAFT: ['AWAITING_PI', 'CANCELLED'],
    AWAITING_PI: ['PI_ISSUED', 'CANCELLED'],
    PI_ISSUED: ['DEPOSIT_PENDING', 'CANCELLED'],
    DEPOSIT_PENDING: ['DEPOSIT_RECEIVED', 'CANCELLED'],
    DEPOSIT_RECEIVED: ['PRODUCTION'],
    PRODUCTION: ['QC_READY', 'CANCELLED'],
    QC_READY: ['BALANCE_PENDING'],
    BALANCE_PENDING: ['BALANCE_RECEIVED'],
    BALANCE_RECEIVED: ['BOOKED'],
    BOOKED: ['ON_BOARD'],
    ON_BOARD: ['IN_TRANSIT'],
    IN_TRANSIT: ['DOCS_SENT'],
    DOCS_SENT: ['DELIVERED'],
    DELIVERED: ['CLOSED'],
    CLOSED: [],
    CANCELLED: [],
  },
  payment: {
    PENDING: ['DUE'],
    DUE: ['REPORTED', 'WAIVED'],
    REPORTED: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['RECONCILED', 'FAILED'],
    FAILED: ['REPORTED'],
    RECONCILED: [],
    WAIVED: [],
  },
  shipment: {
    PLANNING: ['BOOKED', 'CANCELLED'],
    BOOKED: ['ON_BOARD', 'CANCELLED'],
    ON_BOARD: ['IN_TRANSIT'],
    IN_TRANSIT: ['ARRIVED'],
    ARRIVED: ['CUSTOMS'],
    CUSTOMS: ['DELIVERED'],
    DELIVERED: ['CLOSED'],
    CLOSED: [],
    CANCELLED: [],
  },
} as const;

type TransitionMap = typeof transitions;

export function canTransition<T extends keyof TransitionMap>(
  machine: T,
  from: keyof TransitionMap[T],
  to: string,
) {
  return Array.from(transitions[machine][from] as readonly string[]).includes(to);
}

export const workflowTransitions = transitions;
