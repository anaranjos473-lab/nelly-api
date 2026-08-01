# ATOMIC_ASSIGNMENT_001 - Resultados

## Estado actual

| Caso | Estado | HTTP | Inicio | Fin | PASS |
|---|---|---|---|---|---|
| AA-001 | `PASS` | `200 / 409` | `2026-08-01T09:49:42.448Z` | `2026-08-01T09:49:45.846Z` | `☑` |
| AA-002 | `PENDING` | `-` | `-` | `-` | `☐` |
| AA-003 | `PENDING` | `-` | `-` | `-` | `☐` |
| AA-004 | `PENDING` | `-` | `-` | `-` | `☐` |

## Observaciones

- Recertificacion completada tras el lock atomico: `accept-order` concurrente devolvio `200` para `driverA` y `409` para `driverB`.
- El `finalState` de la corrida recertificada mostro un unico ganador y rechazo correcto del segundo intento.
- La reproduccion forense inicial demostro la condicion de carrera antes del parche: dos `accept-order` concurrentes sobre el mismo `pedidoId` devolvieron `200` para ambos repartidores.
- La corrida de preparacion intento `POST /api/admin/pedidos` y recibio `403` por correo no autorizado; la reproduccion util de carrera se realizo sobre el pedido ya despachado en `LISTO`.

