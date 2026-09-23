# NELLY Legal-Fiscal Cross Certification V1

## Purpose

Validate real Nelly business cases across the frozen `NELLY-FISCAL V1.1` and active `NELLY LEGAL OS V1` boundaries without reopening either system.

## Gate behavior

- `ALIGNED`: both external conditions are satisfied; no change request is created.
- `LEGAL_REVIEW_REQUIRED`: legal risk or escalation remains.
- `FISCAL_REVIEW_REQUIRED`: fiscal certification or rule validation remains.
- `JOINT_REVIEW_REQUIRED`: both legal and fiscal review remain.
- `BLOCKED`: legal gate explicitly blocks the case.

The output is read-only. A required technical change produces only `OPEN_V1_2_ADR_IF_SYSTEM_CHANGE_IS_REQUIRED`; it does not edit V1.1.

## Initial case matrix

| Domain | Legal | Fiscal | Cross result |
|---|---|---|---|
| Commission to commerce | Contract/model | IVA/CFDI | Joint review |
| Driver payment | Relationship and liability | Treatment | Joint review |
| Customer refund | Responsibility and consumer | Fiscal treatment | Joint review |
| Nelly Logistics | Contract and liability | Billing/taxes | Joint review |
| Nelly Store | E-commerce | Income/CFDI | Joint review |
| Commerce advertising | Advertising contract | Billing | Joint review |
| Data/geolocation | Privacy | Not inherently required | Legal review |
| Driver radar | Evidence and relationship | Technical boundary | Legal/technical review |
| Cancellation/deactivation | Contract and consumer | Operations/fiscal if money moves | Case-specific |

## Evidence

The cross-gate suite covers joint escalation, legal-only review, fiscal-only review, blocking, alignment, immutability of the frozen fiscal case and V1.2/ADR change control.
