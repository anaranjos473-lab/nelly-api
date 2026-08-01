# ECOSYSTEM_CERT_RESULTS

## Estado actual

| Caso | Estado | HTTP | Inicio | Fin | PASS |
|---|---|---|---|---|---|
| POS-001 | `PASS` | `200` | `2026-08-01T09:08:59.315Z` | `2026-08-01T09:09:25.246Z` | `☑` |
| POS-002 | `PASS` | `200 / 409` | `2026-08-01T03:58:24.6234090-06:00` | `2026-08-01T03:58:25.2587358-06:00` | `☑` |
| POS-003 | `PENDING` | `-` | `-` | `-` | `☐` |
| POS-004 | `PENDING` | `-` | `-` | `-` | `☐` |
| POS-005 | `PENDING` | `-` | `-` | `-` | `☐` |
| POS-006 | `PENDING` | `-` | `-` | `-` | `☐` |
| NEG-001 | `PENDING` | `-` | `-` | `-` | `☐` |
| NEG-002 | `PENDING` | `-` | `-` | `-` | `☐` |
| NEG-003 | `PENDING` | `-` | `-` | `-` | `☐` |
| NEG-004 | `PENDING` | `-` | `-` | `-` | `☐` |
| NEG-005 | `PENDING` | `-` | `-` | `-` | `☐` |
| NEG-006 | `PENDING` | `-` | `-` | `-` | `☐` |

## Observaciones

- `POS-001` completado correctamente con flujo `PENDIENTE -> LISTO -> EN_CURSO -> ENTREGADO`.
- `POS-002` fue recertificado tras el parche atomico: `driverA` obtuvo `200` y `driverC` obtuvo `409`, preservando la adjudicacion atomica.
- El hallazgo historico inicial queda documentado en `ATOMIC_ASSIGNMENT_001` como evidencia de la causa raiz ya corregida.

## Evidencia

- `POS-001`:
  - `traceId` del pedido: `PED_1785575341667`
  - `driverId`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `HTTP`: `201 / 200 / 200 / 200`
- `POS-002`:
  - `pedidoId`: `ECOSYS_POS2_1785578304736`
  - `driverA`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `driverC`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
  - `HTTP`: `200 / 409`
  - `resultado`: un unico ganador con rechazo del segundo intento concurrente

