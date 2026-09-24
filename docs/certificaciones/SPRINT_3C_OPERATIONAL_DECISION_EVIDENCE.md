# SPRINT 3C OPERATIONAL DECISION EVIDENCE - CERTIFICACION LOCAL

**Status:** `CERTIFIED LOCAL - PENDING PRODUCTION RELEASE`

**Date:** 2026-09-24

## Scope

Sprint 3C reads the frozen P0 work evidence and existing dispatch-decision
records to reconstruct why a recorded operational decision was made and what
execution outcome was observed. It never writes to RTDB and never assigns,
reassigns, prices, pays, settles or changes an order.

## Contracts

```text
GET /api/operational-decision-evidence/orders/:id/summary
GET /api/operational-decision-evidence/drivers/:id/metrics
```

The order projection is visible to a candidate driver or privileged actor. The
driver metrics projection is visible to that driver or a privileged actor.

## No-effect boundary

```text
writes_performed: false
effects: []
money.status: NOT_COMPUTED
fiscal.status: NOT_COMPUTED
labor_status.status: NOT_DETERMINED
```

`completion_rate_observed` and `route_continuity_rate_observed` describe only
the recorded decision and observed work-event outcome. They do not attribute
causality to the algorithm and are not inputs to earnings, tariff, tips,
incentives, fiscal, IMSS, contracts or settlement.

## Evidence

`tests/operational-decision-evidence.test.js` verifies authorization,
decision reconstruction, observed outcome metrics and zero RTDB mutation.

```text
84/84 suites PASS
314/314 tests PASS
validate:routes PASS
validate:firebase PASS
git diff --check PASS (no errors; pre-existing CRLF notices only)
```
