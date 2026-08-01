# CONTRACT_AUDIT_001 - EVIDENCIA

## Capa de lectura

- Pedido de foco: `DIAG_COMPLETE_1785523659638`
- Pedidos muestreados: `25`
- Endpoint: `/api/data-architecture/data-access`

## Reglas de interpretacion

- `EN_CURSO` y `ENTREGADO` se consideran visibles para Driver.
- `LISTO` y `PENDIENTE` se consideran visibles para Panel.
- Un pedido certificado/entregado no deberia permanecer en `active_orders`.

## Tabla resumida

| PedidoId | shortId | Fecha creacion | Estado RTDB | Repartidor asignado | active_orders | today_orders | historical_orders | Panel | Driver | Diagnostico |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DIAG_COMPLETE_1785523659638 | N/D | N/D | PENDIENTE | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785615024187 | 0801-82 | 2026-08-01T20:11:50.062Z | ENTREGADO | 9XPSCLkFUWeZnxWoFgZEf0uzkTe2 | No | Sí | No | Sí | Sí | CORRECTO |
| PED_1785612556528 | 0801-68 | 2026-08-01T19:29:16.528Z | ENTREGADO | 9XPSCLkFUWeZnxWoFgZEf0uzkTe2 | No | Sí | No | Sí | Sí | CORRECTO |
| P1_1785612340280_0 | 0801-42 | 2026-08-01T19:27:44.518Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785589003953 | 0801-63 | 2026-08-01T12:56:43.953Z | ENTREGADO | driver_test_001 | No | Sí | No | Sí | Sí | CORRECTO |
| PED_1785588908331 | 0801-93 | 2026-08-01T12:55:08.331Z | ENTREGADO | driver_test_001 | No | Sí | No | Sí | Sí | CORRECTO |
| PED_1785588888544 | 0801-36 | 2026-08-01T12:54:48.544Z | ENTREGADO | driver_test_001 | No | Sí | No | Sí | Sí | CORRECTO |
| PED_1785586862522 | 0801-47 | 2026-08-01T12:21:02.522Z | ENTREGADO | driver_test_001 | No | Sí | No | Sí | Sí | CORRECTO |
| PED_1785586830840 | 0801-26 | 2026-08-01T12:20:30.840Z | ENTREGADO | driver_test_001 | No | Sí | No | Sí | Sí | CORRECTO |
| PED_1785586774077 | 0801-77 | 2026-08-01T12:19:34.077Z | ENTREGADO | driver_test_001 | No | Sí | No | Sí | Sí | CORRECTO |
| PED_1785586755698 | 0801-57 | 2026-08-01T12:19:15.698Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| P1_ROT_1785586244866_2 | 0801-19 | 2026-08-01T12:10:44.878Z | ENTREGADO | 9XPSCLkFUWeZnxWoFgZEf0uzkTe2 | No | Sí | No | Sí | Sí | CORRECTO |
| P1_ROT_1785586243510_1 | 0801-66 | 2026-08-01T12:10:43.516Z | ENTREGADO | iXXl1erAQxW0Hht0CLWzlOYGaAi1 | No | Sí | No | Sí | Sí | CORRECTO |
| P1_ROT_1785586241929_0 | 0801-70 | 2026-08-01T12:10:41.946Z | ENTREGADO | ULILm4AyJGbfQzuUlC9ySpGrQrf1 | No | Sí | No | Sí | Sí | CORRECTO |
| P1_ROT_1785586215562_0 | 0801-40 | 2026-08-01T12:10:15.605Z | ENTREGADO | ULILm4AyJGbfQzuUlC9ySpGrQrf1 | No | Sí | No | Sí | Sí | CORRECTO |
| P1_ROT_1785585927429_2 | 0801-17 | 2026-08-01T12:05:27.450Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| P1_ROT_1785585926142_1 | 0801-12 | 2026-08-01T12:05:26.148Z | ENTREGADO | iXXl1erAQxW0Hht0CLWzlOYGaAi1 | No | Sí | No | Sí | Sí | CORRECTO |
| P1_ROT_1785585924549_0 | 0801-89 | 2026-08-01T12:05:24.853Z | ENTREGADO | ULILm4AyJGbfQzuUlC9ySpGrQrf1 | No | Sí | No | Sí | Sí | CORRECTO |
| PED_1785584965086 | 0801-30 | 2026-08-01T11:49:25.086Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785584874136 | 0801-25 | 2026-08-01T11:47:54.136Z | ENTREGADO | 9XPSCLkFUWeZnxWoFgZEf0uzkTe2 | No | Sí | No | Sí | Sí | CORRECTO |
| PED_1785584750916 | 0801-99 | 2026-08-01T11:45:50.916Z | EN_CURSO | 9XPSCLkFUWeZnxWoFgZEf0uzkTe2 | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785584324979 | 0801-86 | 2026-08-01T11:38:44.979Z | EN_CURSO | 9XPSCLkFUWeZnxWoFgZEf0uzkTe2 | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785584296878 | 0801-90 | 2026-08-01T11:38:16.878Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785584189533 | 0801-45 | 2026-08-01T11:36:29.533Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785583737288 | 0801-39 | 2026-08-01T11:28:57.288Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |