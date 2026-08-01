# CONTRACT_AUDIT_001 - RESULTADOS

## Resumen

- Pedidos analizados: 5
- Correctos: 5
- Inconsistencias: 0
- Pedido de foco: PED_1785200134315

## Tabla de auditoria

| PedidoId | shortId | Fecha creacion | Estado RTDB | Repartidor asignado | active_orders | today_orders | historical_orders | Panel | Driver | Diagnostico |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PED_1785200134315 | 0728-93 | 2026-07-28T00:55:34.315Z | ENTREGADO | driver_piloto | No | No | Sí | No | Sí | CORRECTO |
| POS-002_1785573747643 | 0801-64 | 2026-08-01T08:42:27.854Z | EN_CURSO | 8mo8182LJsgV7vKMSpiCekFKAG23 | Sí | No | No | Sí | Sí | CORRECTO |
| NEG-003_1785573751096 | 0801-14 | 2026-08-01T08:42:31.331Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| ATOMIC_1785577782448 | 0801-50 | 2026-08-01T09:49:43.813Z | EN_CURSO | 8mo8182LJsgV7vKMSpiCekFKAG23 | Sí | No | No | Sí | Sí | CORRECTO |
| TRACE_VERIFY_1785565930802 | TRACE-01 | 2026-08-01T06:32:10.847Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |

## Observaciones

- `active_orders` y `today_orders` se tomaron del contrato de lectura.
- `historical_orders` se tomo del mismo contrato.
- `Panel` y `Driver` se derivan por heuristica de visibilidad operativa; no modifican datos.