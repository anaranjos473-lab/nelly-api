# SPRINT 3A P0 WORK EVIDENCE - CERTIFICACION LOCAL

**Status:** `CERTIFIED LOCAL - PENDING PRODUCTION RELEASE`

**Change state:** `FROZEN`

**Date:** 2026-09-24

## Scope

Sprint 3A P0 extends operational evidence only:

- observed task-time sequence: accepted, pickup arrival, pickup, dropoff arrival
  and completion;
- observed route evidence and route continuity;
- traceable assignment evidence with algorithm version, reason codes, factors,
  human override and review reference;
- observed orders per hour (OPH).

## Contracts

```text
POST /api/operational-evidence/work-events
GET  /api/operational-evidence/drivers/:id/work-time-evidence
GET  /api/operational-evidence/drivers/:id/route-evidence
GET  /api/operational-evidence/orders/:id/assignment-evidence
GET  /api/operational-evidence/drivers/:id/productivity
```

## Controls

- Work and route projections are read-only and return `writes_performed: false`.
- `observed_evidence` permits only distance, ETA, H3 zone and route continuity.
- Assignment factors use a non-monetary allowlist.
- Monetary-shaped fields such as `base_pay` and `offer_amount` are rejected.
- No endpoint writes Ledger, payments, payouts, commissions, tips, incentives,
  taxes, IMSS, contracts, fiscal records, settlement or labor status.

## Evidence

`tests/operational-evidence.test.js` verifies:

- canonical task timestamps and observed effective work time;
- route projection and assignment reconstruction;
- no mutation during read projections;
- rejection of monetary fields in P0 evidence;
- no financial, fiscal, settlement or labor-status fields in the P0 response.

Local run on 2026-09-24:

```text
82/82 suites PASS
310/310 tests PASS
validate:routes PASS
validate:firebase PASS
git diff --check PASS (no errors; pre-existing CRLF notices only)
```

## Boundary

This certification does not authorize a production release. Economic, fiscal,
legal, IMSS, contract, statement and settlement capabilities remain blocked by
the applicable Ledger and Legal/Fiscal gates.

Any modification to the P0 event schema, read projections, authorization or
no-effect controls requires a new scoped goal, regression evidence and a new
certification record.
