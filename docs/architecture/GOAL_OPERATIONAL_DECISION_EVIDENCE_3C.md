# GOAL OPERATIONAL DECISION EVIDENCE 3C

**Status:** `CERTIFIED LOCAL - PENDING PRODUCTION RELEASE`

**Date:** 2026-09-24

## Four Casillas

| Question | Answer |
| --- | --- |
| Problem | Operations needs to reconstruct an observed dispatch decision and its observed execution outcome without changing dispatch behavior. |
| User | Candidate driver for their own decision evidence, or a privileged operational actor. |
| Work Center | Operations Intelligence. |
| Impact | Reads P0 evidence and recorded dispatch decisions. It does not modify P0, orders, Radar, Ledger, fiscal, legal, Android or settlement. |

## Contracts

```text
GET /api/operational-decision-evidence/orders/:id/summary
GET /api/operational-decision-evidence/drivers/:id/metrics
```

## Boundary

Sprint 3C only returns recorded decision inputs and observed execution outcomes.
`completion_rate_observed` and `route_continuity_rate_observed` are descriptive
metrics, not proof of algorithmic causality or a basis for compensation. All
responses are read-only with `writes_performed: false`, `effects: []`, and no
money, fiscal, labor, Ledger or settlement computation.
