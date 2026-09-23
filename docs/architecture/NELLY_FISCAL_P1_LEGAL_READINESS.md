# NELLY-FISCAL V1.1 - Legal Readiness Package

## Status

```text
NELLY-FISCAL V1.1: FROZEN
TECHNICAL P0: CLOSED
LEGAL REVIEW: PENDING
FISCAL PROFESSIONAL REVIEW: PENDING
CONTROLLED PILOT: PENDING
```

This package is for legal review of the frozen system and its operating model. It does not ask counsel to approve source code or replace a fiscal professional's opinion.

## Materials for counsel

- [V1.1 technical freeze](./NELLY_FISCAL_V1_1_FREEZE.md)
- [P1 professional readiness](./NELLY_FISCAL_P1_PROFESSIONAL_READINESS.md)
- [P0 closure](./NELLY_FISCAL_P0_CLOSURE.md)
- `FinancialEvent`, `FiscalCase`, ledger, settlement and CFDI control boundaries.
- RBAC permissions and authorization audit.
- Historical append-only evidence trail.

## Legal review questions

### 1. Operating model

- Is Nelly an intermediary, marketplace, logistics provider, commission agent or a combination by flow?
- What are the legal relationships between Nelly, commerce, customer and driver?
- Who is responsible to the customer for fulfillment, delivery and claims?

### 2. Economic and contractual flow

- Who collects and who receives each amount?
- How are delivery fees, commissions, tips, refunds, cancellations and settlements contracted?
- Which terms, disclosures and acceptance records are required for customers, commerce and drivers?

### 3. Personal data and evidence

- What legal basis, notice and consent are required for customer, driver and commerce data?
- What applies to location, delivery evidence, photographs, contact data and payment references?
- What retention, access, deletion, export and incident-response rules apply?

### 4. Pilot risk

- Required contracts, terms and conditions, privacy notice and consent flows.
- Allocation of delivery risk, claims, refunds and chargebacks.
- Driver relationship, labor, commercial and subcontracting considerations.
- Intellectual property, platform terms, electronic commerce and consumer obligations.

## Review record

```text
review_id:
counsel_or_firm:
jurisdiction:
review_date:
scope:
assumptions:
required_contracts:
required_disclosures:
pilot_conditions:
required_system_changes:
legal_risks:
approval_or_opinion_reference:
```

## Change boundary

Legal review does not modify the frozen baseline. If counsel or the fiscal professional identifies a required technical change, create a new goal, version `V1.2`, and ADR with evidence of the obligation and regression coverage. Do not silently alter V1.1.
