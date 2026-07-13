# Workflow state machines

## RFQ lifecycle
### States
- `draft`
- `submitted`
- `under_review`
- `quoted`
- `revised`
- `approved`
- `closed`
- `cancelled`

### Allowed transitions
- `draft -> submitted`
- `draft -> cancelled`
- `submitted -> under_review`
- `submitted -> cancelled`
- `under_review -> quoted`
- `under_review -> revised`
- `under_review -> cancelled`
- `quoted -> revised`
- `quoted -> approved`
- `quoted -> closed`
- `quoted -> cancelled`
- `revised -> under_review`
- `revised -> quoted`
- `revised -> cancelled`
- `approved -> closed`

### Invalid examples
- `draft -> approved`
- `closed -> quoted`
- `cancelled -> under_review`

## Quote lifecycle
### States
- `draft`
- `issued`
- `revised`
- `accepted`
- `rejected`
- `expired`
- `superseded`
- `cancelled`

### Allowed transitions
- `draft -> issued`
- `draft -> cancelled`
- `issued -> revised`
- `issued -> accepted`
- `issued -> rejected`
- `issued -> expired`
- `issued -> superseded`
- `revised -> issued`
- `revised -> accepted`
- `revised -> rejected`
- `revised -> expired`
- `accepted -> superseded`

### Invalid examples
- `draft -> accepted`
- `rejected -> issued`
- `expired -> accepted`

## Order lifecycle
### States
- `draft`
- `awaiting_pi`
- `pi_issued`
- `deposit_pending`
- `deposit_received`
- `production`
- `qc_ready`
- `balance_pending`
- `balance_received`
- `booked`
- `on_board`
- `in_transit`
- `docs_sent`
- `delivered`
- `closed`
- `cancelled`

### Allowed transitions
- `draft -> awaiting_pi`
- `awaiting_pi -> pi_issued`
- `pi_issued -> deposit_pending`
- `deposit_pending -> deposit_received`
- `deposit_received -> production`
- `production -> qc_ready`
- `qc_ready -> balance_pending`
- `balance_pending -> balance_received`
- `balance_received -> booked`
- `booked -> on_board`
- `on_board -> in_transit`
- `in_transit -> docs_sent`
- `docs_sent -> delivered`
- `delivered -> closed`
- `draft -> cancelled`
- `awaiting_pi -> cancelled`
- `pi_issued -> cancelled`
- `deposit_pending -> cancelled`
- `production -> cancelled`

### Invalid examples
- `draft -> production`
- `deposit_pending -> booked`
- `delivered -> production`

## Payment lifecycle
### States
- `pending`
- `due`
- `reported`
- `under_review`
- `reconciled`
- `failed`
- `waived`

### Allowed transitions
- `pending -> due`
- `due -> reported`
- `reported -> under_review`
- `under_review -> reconciled`
- `under_review -> failed`
- `due -> waived`
- `failed -> reported`

### Invalid examples
- `pending -> reconciled`
- `waived -> due`

## Shipment lifecycle
### States
- `planning`
- `booked`
- `on_board`
- `in_transit`
- `arrived`
- `customs`
- `delivered`
- `closed`
- `cancelled`

### Allowed transitions
- `planning -> booked`
- `booked -> on_board`
- `on_board -> in_transit`
- `in_transit -> arrived`
- `arrived -> customs`
- `customs -> delivered`
- `delivered -> closed`
- `planning -> cancelled`
- `booked -> cancelled`

### Invalid examples
- `planning -> delivered`
- `closed -> in_transit`

## Enforcement rule
Every state transition must be validated on the server before mutation.
Mutation handlers should:
1. load current state
2. check role permission
3. verify transition against the machine
4. persist change
5. write audit log
6. write history row if applicable
7. enqueue notifications when needed
