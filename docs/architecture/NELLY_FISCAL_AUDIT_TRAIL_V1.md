# NELLY-FISCAL Historical Audit Trail V1

## Purpose

Provide a standalone, reconstructible and append-only history for every `FiscalCase` without depending on Firebase, settlement writers or external audit services.

## Contract

Each event contains:

- `audit_event_id` and `event_hash`;
- `fiscal_case_id`, `correlation_id` and sequence;
- timestamp, actor ID and actor role;
- action, previous state, new state and reason;
- rule version, source and evidence references.

Events form a hash chain through `previous_hash`. The service freezes events and histories in memory, rejects malformed events, and verifies sequence, previous hash and event hash before a trail is accepted.

## Reconstructible lifecycle

The case projection emits the evidence trail from its canonical references:

`CASE_CREATED -> FINANCIAL_EVENT_LINKED -> LEDGER_MATCHED/EXCEPTION_DETECTED -> SETTLEMENT_MATCHED -> CFDI_VALIDATED/EXCEPTION_DETECTED -> RULE_EVALUATED -> EXCEPTION_DETECTED`

An absent source is represented as an exception or omitted optional event; it is never silently fabricated.

## Boundary

This is an immutable control-layer projection. It does not write money, change order state, close settlements, certify tax treatment or persist to a second source of truth. A future durable audit adapter must append these events without rewriting or deleting them.

## Evidence

The integration suite verifies successful reconstruction, frozen objects, hash-chain validity, tamper detection and required-field rejection.
