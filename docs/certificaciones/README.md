# Certifications

Register of functional certifications and approved baselines.

For the domain certification standard, use:

- [docs README](../README.md)
- [DOMAIN_CERT_001 Index](../INDEX_DOMAIN_CERT_001.md)

## State of Certifications

| Certification | State | Observations |
|---|---|---|
| P17 | `CLOSED` | Certified production baseline for delivery closure and driver earnings. |
| RC-03 | `IN VALIDATION` | Operational flow validated. Pending comparative financial validation for `Saldo`, `Proximo corte`, `ISR`, and `IVA`. |
| NAE Fase 2 | `IMPLEMENTED` | Archive Engine phase 2 added with scheduler, indices and operational certification pending. |
| NAE E2E Execution | `CLOSED` | Evidence execution completed for the NAE E2E certification. |
| NAE E2E Certification | `APPROVED` | Functional certification approved by acta of closure. |
| NAE Cleanup | `PLANNED` | Post-certification sprint to remove temporary fallbacks and freeze `DataAccessService v1`. |
| NAE Release Report v1.0 | `CERTIFIED` | Final frozen release report for NAE v1.0. |
| Incident Render Kitchen 404 Data Access | `CLOSED` | Deploy desynchronization on Render caused `/api/data-architecture/data-access` to return 404 until `main` was aligned and redeployed. |
| Kitchen Premium E2E Pre-B3 | `APPROVED` | Functional baseline for B3 entry frozen from the certified end-to-end validation. |
| DOMAIN_CERT_001 | `CERTIFIED` | Rector protocol for formal domain certification of Nelly Delivery. |
| PANEL_VISUAL_001 | `APPROVED` | Visual and functional certification of the full panel across desktop and mobile. |
| Incident Panel ShortId | `CLOSED` | Frontend identity mismatch between visible `shortId` and `resolverKeyPedido()` fixed by aligning the panel resolver. |
| Runner Fail Fast | `CLOSED` | Diagnostic runner stops at the first causal failure and avoids cascading errors. |

## Documents

- [`CERTIFICACION_P17.md`](./../CERTIFICACION_P17.md)
- [`RC-03.md`](./RC-03.md)
- [`NAE_FASE2.md`](./NAE_FASE2.md)
- [`NAE_FASE2_OPERACIONAL.md`](./NAE_FASE2_OPERACIONAL.md)
- [`NAE_E2E_EXECUTION.md`](./NAE_E2E_EXECUTION.md)
- [`NAE_E2E_CERTIFICATION.md`](./NAE_E2E_CERTIFICATION.md)
- [`ACTA_CIERRE_NAE_E2E_V1.md`](./ACTA_CIERRE_NAE_E2E_V1.md)
- [`NAE_CLEANUP.md`](./NAE_CLEANUP.md)
- [`NAE_RELEASE_REPORT_v1.0.md`](./NAE_RELEASE_REPORT_v1.0.md)
- [`INCIDENTE_RENDER_KITCHEN_404_DATA_ACCESS.md`](./INCIDENTE_RENDER_KITCHEN_404_DATA_ACCESS.md)
- [`functional-metrics-baseline.json`](./functional-metrics-baseline.json)
- [`../CERTIFICACION_DOMAIN_CERT_001.md`](./../CERTIFICACION_DOMAIN_CERT_001.md)
- [`../INDEX_DOMAIN_CERT_001.md`](./../INDEX_DOMAIN_CERT_001.md)
- [`ACTA_DOMAIN_CERT_001_FINAL.md`](./ACTA_DOMAIN_CERT_001_FINAL.md)
- [`ACTA_PANEL_VISUAL_001.md`](./ACTA_PANEL_VISUAL_001.md)
- [`ACTA_DOMAIN_CERT_001.md`](./ACTA_DOMAIN_CERT_001.md)
- [`DATASET_DOMAIN_CERT_001.md`](./DATASET_DOMAIN_CERT_001.md)
- [`DOMAIN_CERT_DATASET.md`](./DOMAIN_CERT_DATASET.md)
- [`DOMAIN_CERT_CASES.md`](./DOMAIN_CERT_CASES.md)
- [`DOMAIN_CERT_RESULTS.md`](./DOMAIN_CERT_RESULTS.md)
- [`ACTA_DOMAIN_CERT_TEMPLATE.md`](./ACTA_DOMAIN_CERT_TEMPLATE.md)
- [`REGRESSION_SUITE_DOMAIN.md`](./REGRESSION_SUITE_DOMAIN.md)
- [`CHANGELOG_DOMAIN_CERT.md`](./CHANGELOG_DOMAIN_CERT.md)
- [`CERT_HISTORY/README.md`](./CERT_HISTORY/README.md)
- [`DOMAIN_CERT_001/README.md`](./DOMAIN_CERT_001/README.md)
- [`INCIDENTE_PANEL_SHORTID_CERRADO.md`](./INCIDENTE_PANEL_SHORTID_CERRADO.md)
- [`CERTIFICACION_RUNNER_FAIL_FAST.md`](./CERTIFICACION_RUNNER_FAIL_FAST.md)

## Rule

A certification is only added when there is reproducible evidence and a clear functional scope.
