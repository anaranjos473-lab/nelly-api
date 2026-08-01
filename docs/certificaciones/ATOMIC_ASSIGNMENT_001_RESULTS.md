# ATOMIC_ASSIGNMENT_001 - Resultados

## Estado actual

| Caso | Estado | HTTP | Inicio | Fin | PASS |
|---|---|---|---|---|---|
| AA-001 | `PENDING` | `-` | `-` | `-` | `☐` |
| AA-002 | `PENDING` | `-` | `-` | `-` | `☐` |
| AA-003 | `PENDING` | `-` | `-` | `-` | `☐` |
| AA-004 | `PENDING` | `-` | `-` | `-` | `☐` |

## Observaciones

- Frente abierto para certificar la adjudicacion atomica en `accept-order`.
- La certificacion queda bloqueada hasta cerrar la causa raiz del hallazgo concurrente detectado en `ECOSYSTEM_CERT_001`.
- Reproduccion forense inicial completada: dos `accept-order` concurrentes sobre el mismo `pedidoId` devolvieron `200` para ambos repartidores.
- El `finalState` mostro `driverA_pedido_activo` y `driverB_pedido_activo` apuntando al mismo pedido, confirmando una adjudicacion no atomica.
- La corrida de preparacion intento `POST /api/admin/pedidos` y recibio `403` por correo no autorizado; la reproduccion util de carrera se realizo sobre el pedido ya despachado en `LISTO`.
