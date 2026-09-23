# NELLY-FISCAL V1.1 - P0 Closure Gate

## Official status

```text
INTEGRATION CERTIFIED
FISCAL STATUS: NOT CERTIFIED
PRODUCTION STATUS: CONTROLLED / PENDING
```

The technical baseline is frozen under [`NELLY_FISCAL_V1_1_FREEZE.md`](./NELLY_FISCAL_V1_1_FREEZE.md). The next activity is professional readiness, not another FiscalCase redesign.

## Gate matrix

| Gate | Status | Evidence or next action |
|---|---|---|
| Technical implementation | COMPLETE | FinancialEvent, FiscalCase, CFDI lifecycle and reconciliation services |
| Integration certification | COMPLETE | 60 automated tests, including idempotency and mismatch handling |
| Fiscal professional review | PENDING | Validate regime, ownership, IVA, ISR, withholding, CFDI, refunds and B2B treatment |
| Historical evidence | COMPLETE | Standalone append-only hash chain records lifecycle events, IDs, references, rules, exceptions, actor and decision |
| Fiscal RBAC | IMPLEMENTED / VALIDATION COMPLETE | Middleware único, claims/roles controlados y pruebas de autorización |
| Fiscal professional certification | PENDING | Requires professional approval of applicable Mexican rules |
| Controlled pilot | PENDING | Test -> staging -> pilot -> observation, read-only fiscal behavior |
| Production readiness | BLOCKED BY PENDING GATES | Requires professional approval and controlled pilot |

## Permanent safety rule

When order, ledger, settlement, CFDI or fiscal case values differ, NELLY-FISCAL emits an explicit exception and preserves the source evidence. It must not overwrite the fiscal case, correct money, close a settlement or invent a tax treatment automatically.

## Responsibility boundary

NELLY-FISCAL reads, analyzes, classifies, flags, reconciles and reports. It does not replace a fiscal professional and it does not become an accounting subsystem.

The next separate capability may be `NELLY-ACCOUNTING`, consuming the shared `FinancialEvent` and ledger contracts. It must not be added until its scope, owner, accounting contracts and interaction with fiscal control pass the four-casillas review.

The review package is defined in [`NELLY_FISCAL_P1_PROFESSIONAL_READINESS.md`](./NELLY_FISCAL_P1_PROFESSIONAL_READINESS.md).

## RBAC boundary

Fiscal endpoints require `FISCAL_VIEW` after panel authentication. `FISCAL_ANALYZE`, `FISCAL_ADMIN`, `FISCAL_EXPORT` and `FISCAL_CERTIFY` are separate capabilities. `FISCAL_CERTIFY` is never inferred from administrator access and remains available only through an explicit claim assigned by the authorization process.
