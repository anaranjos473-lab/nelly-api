# NELLY-FISCAL RBAC V1

## Permissions

- `FISCAL_VIEW`: read fiscal reviews and summaries.
- `FISCAL_ANALYZE`: execute future read-only analysis operations.
- `FISCAL_ADMIN`: administer fiscal configuration when approved.
- `FISCAL_EXPORT`: export controlled fiscal evidence.
- `FISCAL_CERTIFY`: certify only through an explicit authorized claim; no endpoint is enabled by this change.

## Enforcement

`requireFiscalPermission(permission)` is the single middleware boundary after panel authentication. It reads explicit permission claims and controlled role mappings, returns `403` when absent, and attaches a non-persistent authorization audit object with actor, action, resource, decision, timestamp and permission evidence.

Current fiscal read endpoints require `FISCAL_VIEW`:

- `GET /api/panel/fiscal/orders/:orderId/review`
- `GET /api/panel/fiscal/summary`

## Safety

This module does not write Firebase, ledger, settlement or fiscal certification state. Authorization audit persistence and professional certification remain separate approved capabilities.
