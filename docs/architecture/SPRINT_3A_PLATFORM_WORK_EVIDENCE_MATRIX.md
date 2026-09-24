# SPRINT 3A PLATFORM WORK EVIDENCE - IMPLEMENTATION MATRIX

**Version:** V1

**Status:** `DESIGN READY - IMPLEMENTATION GATED`

**Date:** 2026-09-24

## Purpose

Translate platform benchmark observations into Nelly design requirements without
turning external practices, observed amounts, or legal/fiscal assumptions into
Nelly policy.

The source benchmark is `OBSERVED_PLATFORM_EVIDENCE`. It is not an approved
tariff, labor, fiscal, incentive, or settlement policy.

## Non-negotiable boundaries

- Backend remains the SSOT: `Backend -> RTDB -> Android`.
- A work event or algorithm record is evidence; it does not assign an order,
  calculate pay, or determine labor status.
- `DRIVER_STATUS_ENGINE` remains `CALCULATION_ONLY`.
- No component may create payments, commissions, tips, incentives, taxes,
  IMSS entries, contracts, signatures, weekly statements, or settlement while
  `LEGAL_FISCAL_READINESS_GATE_SPRINT_3.md` and Ledger V1 remain blocked.
- Values such as a fixed logistics margin, per-km rate, or observed third-party
  platform deductions are hypotheses or observations, never runtime defaults.

## Existing baseline

| Capability | Existing contract | State | Boundary |
| --- | --- | --- | --- |
| Work evidence | `POST /api/operational-evidence/work-events` | `IMPLEMENTED_LOCAL` | Operational facts only. |
| Work summary | `GET /api/operational-evidence/drivers/:id/work-summary` | `IMPLEMENTED_LOCAL` | No money. |
| Dispatch evidence | `POST /api/operational-evidence/dispatch-decisions` | `IMPLEMENTED_LOCAL` | Does not assign or reassign. |
| Algorithm version | `POST /api/operational-evidence/algorithm-versions` | `IMPLEMENTED_LOCAL` | Versioned criteria only. |
| Human review | `/api/operational-evidence/reviews` | `IMPLEMENTED_LOCAL` | Non-executive review. |
| Productivity | `GET /api/operational-evidence/drivers/:id/productivity` | `IMPLEMENTED_LOCAL` | Observed work metrics only. |
| Status simulation | `GET /api/operational-evidence/drivers/:id/status-simulation` | `CERTIFIED_LOCAL_CALCULATION_ONLY` | No real status change. |

## P0 - Evidence contracts safe to design

**Current state:** `IMPLEMENTED_LOCAL - PENDING PRODUCTION CERTIFICATION`

The following read-only projections are now available locally:

```text
GET /api/operational-evidence/drivers/:id/work-time-evidence
GET /api/operational-evidence/drivers/:id/route-evidence
GET /api/operational-evidence/orders/:id/assignment-evidence
```

`POST /work-events` accepts only non-monetary observed evidence. `POST
/dispatch-decisions` accepts only the P0 assignment-factor allowlist. Unknown
or monetary-shaped fields are rejected.

| ID | Requirement | Proposed data/contract | Implementation gate | Test evidence |
| --- | --- | --- | --- | --- |
| P0-01 | Task time evidence | Normalize the existing event sequence into `accepted_at`, `arrived_pickup_at`, `picked_up_at`, `arrived_dropoff_at`, `completed_at`, all as observed timestamps. | Operations owner confirms event producers and semantics. | Event ordering, missing events, idempotency, zero writes outside `work_ledger`. |
| P0-02 | Effective work time | Derive `effective_work_seconds_observed` only from recorded task facts; return `null` if the evidence is incomplete. | No labor-status interpretation. | Delivered, cancelled, incomplete, duplicated and out-of-order event cases. |
| P0-03 | Route evidence | Introduce a read-only route projection: `route_id`, `order_ids`, observed distance/time, completion state and route continuity evidence. | Dispatch/Operations defines route identity; no payout fields. | Single order, two-order route, missing route, driver isolation. |
| P0-04 | Algorithm evidence | Preserve `decision_id`, `order_id`, `algorithm_version`, `reason_codes`, `assignment_factors`, `human_override`, `review_id`. | Factors remain auditable facts; no automatic assignment behavior. | Unauthorized write, idempotent retry, visibility, review linkage. |
| P0-05 | Non-monetary productivity | Derive completed orders, observed work time, OPH and route completion ratios. | Formula labels must say `OBSERVED`, not compensation or labor status. | Zero-time, zero-order, multi-route and cancellation cases. |

P0 does not define a payout, revenue, cost, earning, margin, tax, withholding,
tip, incentive, mission, settlement or Ledger posting.

## P1 - Economic design requiring approved contracts

| ID | Requirement | Status | Blocker |
| --- | --- | --- | --- |
| P1-01 | Earnings component schema (`BASE_PAY`, `DISTANCE_PAY`, `TIME_PAY`, `WAIT_PAY`, `DYNAMIC_PAY`, `INCENTIVE`, `MISSION`, `TIP`, `ADJUSTMENT`, `OTHER`) | `BLOCKED` | Ledger accounts, sign convention, policy version, source of funds, idempotency and atomic posting. |
| P1-02 | Gross earnings and gross-per-hour | `BLOCKED` | P1-01 and approved definition of payable/revenue; no monetary aggregate before Ledger V1. |
| P1-03 | Customer delivery fee, driver payout and platform margin | `BLOCKED` | Tariff owner, approved formula, taxes, refunds, cancellation and merchant commission policy. |
| P1-04 | Incentive and mission evidence | `BLOCKED` | Eligibility, source of funds, duration, cancellation, payout, abuse controls and Ledger policy. |
| P1-05 | Tip evidence and allocation | `BLOCKED` | Payment confirmation, allocation, refund and settlement rules. |
| P1-06 | Driver statement with monetary values | `BLOCKED` | Earnings schema, Ledger, fiscal/contract policy and statement period definition. |
| P1-07 | Fiscal evidence persistence | `BLOCKED` | Legal/Fiscal decision on consent, retention, source validation and permitted fields. |
| P1-08 | Social-security evidence persistence | `BLOCKED` | Legal/IMSS decision on applicability, purpose, retention and actor rights. |
| P1-09 | Settlement | `BLOCKED` | Ledger V1 contract and the Legal/Fiscal readiness gate. |

## Radar boundary

Radar may show observed order data and non-monetary operational estimates after
their producer and accuracy contract are certified. It may not present a
guaranteed payout, hourly earnings, tip, incentive, margin or batching value
until the corresponding P1 contract is approved and the backend produces the
value.

## Required API and data design before P1 implementation

Every proposed financial record must define:

```text
event_id
idempotency_key
order_id / route_id / driver_id
currency and amount_minor
financial_policy_id and policy_version
source_event and source_reference
occurred_at and recorded_at
status and correction/reversal linkage
ledger transaction reference
```

These fields are a design checklist only. They do not authorize persisting a
financial record or computing an amount.

## Certification sequence

1. Release and smoke-certify the existing local Sprint 1/2/3A evidence routes.
2. Certify P0 evidence extensions independently, with no monetary fields.
3. Obtain attributable Finance, Architecture, Legal/Fiscal and Operations
   decisions for each P1 item.
4. Freeze Ledger V1 and tariff contracts through ADRs and policy versions.
5. Implement one P1 contract in an isolated change with failure, retry,
   concurrency, refund and reconciliation tests.
6. Certify production evidence before enabling any economic effect.

## Explicit exclusions

This matrix does not implement or authorize `IMSS_ENGINE`, `FISCAL_ENGINE`,
`CONTRACT_ENGINE`, `E_SIGNATURE`, `WEEKLY_STATEMENT`, `SETTLEMENT_ENGINE`, a
labor-status decision, or an automatic financial allocation.
