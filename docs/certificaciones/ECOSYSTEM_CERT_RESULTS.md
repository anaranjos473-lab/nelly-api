# ECOSYSTEM_CERT_RESULTS

## Estado actual

| Caso | Estado | HTTP | Inicio | Fin | PASS |
|---|---|---|---|---|---|
| POS-001 | `PASS` | `200` | `2026-08-01T09:08:59.315Z` | `2026-08-01T09:09:25.246Z` | `☑` |
| POS-002 | `FAIL` | `200 / 200` | `2026-08-01T09:10:30.411Z` | `2026-08-01T09:10:30.411Z` | `☐` |
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
- `POS-002` fallo de integridad: ambos repartidores obtuvieron `200` sobre el mismo pedido, lo que rompe la adjudicacion atomica.
- La certificacion se detiene en `POS-002` hasta abrir un frente de correccion independiente.

## Evidencia

- `POS-001`:
  - `traceId` del pedido: `PED_1785575341667`
  - `driverId`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `HTTP`: `201 / 200 / 200 / 200`
- `POS-002`:
  - `pedidoId`: `ECOSYS_POS2_1785575430411`
  - `driverA`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `driverC`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
  - `HTTP`: `200 / 200 / 200`
  - `resultado`: doble aceptacion concurrente del mismo pedido
