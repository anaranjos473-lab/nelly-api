# NELLY-FISCAL V1.1 - Integration Certification

## Status

`INTEGRATION CERTIFIED / FISCAL PRODUCTION NOT CERTIFIED`

This certification covers the software control layer and its service boundaries. It does not certify Mexican tax treatment, SAT XML validity, bank reconciliation, or contractual ownership of customer money.

## Certified scope

- `FinancialEvent` creates a deterministic idempotency identity.
- The existing financial core persists the event-derived movement in `ledger`.
- Repeating the same idempotency key returns the existing movement without duplication.
- Reusing the key with incompatible data raises `IDEMPOTENCY_CONFLICT`.
- `FiscalCase` joins the order review, financial event, CFDI evidence, settlement snapshot and exceptions.
- CFDI matching checks order reference, UUID, total, ledger reference and settlement reference.
- Read-only reconciliation compares order total with available ledger and settlement amounts.
- Differences become `RECONCILIATION_EXCEPTION`; no automatic correction is performed.
- Cash, electronic payment, tips, refunds, cancellations and explicit commission entries remain traceable evidence.
- Missing or incomplete evidence remains pending or exceptional and never becomes certified automatically.

## Evidence

Run:

```text
node --experimental-vm-modules node_modules/jest/bin/jest.js tests/nelly-fiscal.test.js tests/nelly-fiscal-integration.test.js tests/delivery_panel.test.js --runInBand --forceExit --cacheDirectory=.jest-cache
```

The dedicated integration suite uses an in-memory RTDB adapter. It does not write production Firebase data.

## Explicit non-scope

- No tax rate is published or applied automatically.
- No CFDI XML is generated, validated against SAT or cancelled externally.
- No settlement record is created, closed or corrected by NELLY-FISCAL.
- No accounting entry is invented from an order without a financial-core movement.
- No revenue ownership is inferred for Nelly, commerce, driver or third parties.
- No authenticated panel action is bypassed; the panel route remains protected by existing middleware.

## Exit criteria

The integration layer may move to a later release only after a fiscal professional approves the applicable rules, contracts define ownership, and settlement/CFDI adapters are separately implemented and certified.
