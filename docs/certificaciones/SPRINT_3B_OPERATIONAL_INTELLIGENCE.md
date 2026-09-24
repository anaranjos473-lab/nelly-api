# SPRINT 3B OPERATIONAL INTELLIGENCE - CERTIFICACION LOCAL

**Status:** `CERTIFIED LOCAL - PENDING PRODUCTION RELEASE`

**Date:** 2026-09-24

## Scope

Sprint 3B reads frozen Sprint 3A-P0 work evidence and derives operational
analytics. It does not modify P0 records, order state, dispatch behavior,
Radar, Ledger, financial records, fiscal records, contracts, labor status or
settlement.

## Contracts

```text
GET /api/operational-intelligence/drivers/:id/summary
GET /api/operational-intelligence/drivers/:id/route-productivity
GET /api/operational-intelligence/drivers/:id/bottlenecks
GET /api/operational-intelligence/drivers/:id/eta-accuracy
```

All endpoints require Firebase authentication, limit drivers to their own
evidence unless privileged, read only `work_ledger/{driver_id}`, and return
`writes_performed: false` where applicable.

## Derived operational evidence

- travel to pickup, merchant wait, pickup handoff, pickup to dropoff and
  dropoff handoff durations;
- total observed effective time and ETA deviation/accuracy;
- completed orders per route, observed OPH and observed distance per order;
- longest observed stage per task.

`longest_observed_stage` is not a finding of driver, merchant, customer or
system responsibility. Its response keeps `attribution: NOT_DETERMINED` and
marks customer/system delay as unobserved without dedicated source evidence.

## No-effect controls

```text
writes_performed: false
effects: []
money.status: NOT_COMPUTED
fiscal.status: NOT_COMPUTED
labor_status.status: NOT_DETERMINED
```

No value from 3B is a payout, tariff, penalty, incentive, tip, tax, IMSS base,
labor classification or settlement input by default.

## Evidence

`tests/operational-intelligence.test.js` verifies time quality, route
productivity, ETA accuracy, no mutation and denial of cross-driver access.

```text
83/83 suites PASS
312/312 tests PASS
validate:routes PASS
validate:firebase PASS
git diff --check PASS (no errors; pre-existing CRLF notices only)
```

## Boundary

Sprint 3B is a distinct read-only analytics layer over P0. P1 remains
`BLOCKED`, with no earnings, tariff, tips, incentives, fiscal, IMSS, statement
or settlement implementation authorized.
