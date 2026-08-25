# CONTRACT_AUDIT_001 - EVIDENCIA

## Capa de lectura

- Pedido de foco: `PED_1787351220159`
- Pedidos muestreados: `20`
- Endpoint: `/api/data-architecture/data-access`

## Reglas de interpretacion

- `EN_CURSO` y `ENTREGADO` se consideran visibles para Driver.
- `LISTO` y `PENDIENTE` se consideran visibles para Panel.
- Un pedido certificado/entregado no deberia permanecer en `active_orders`.

## Tabla resumida

| PedidoId | shortId | Fecha creacion | Estado RTDB | Repartidor asignado | active_orders | today_orders | historical_orders | Panel | Driver | Diagnostico |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PED_1787351220159 | PIZZERIA-MIA-20260821-001 | 2026-08-21T22:27:00.159Z | PENDIENTE | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1787346763084 | TIENDA-NELLY-20260821-001 | 2026-08-21T21:12:43.084Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1786055066332 | PIZZERIA-MIA-20260806-006 | 2026-08-06T22:24:26.332Z | ENTREGADO | 8mo8182LJsgV7vKMSpiCekFKAG23 | No | No | Sí | No | Sí | CORRECTO |
| PED_1786053513809 | PIZZERIA-MIA-20260806-005 | 2026-08-06T21:58:33.809Z | ENTREGADO | 8mo8182LJsgV7vKMSpiCekFKAG23 | No | No | Sí | No | Sí | CORRECTO |
| PED_1786052360696 | PIZZERIA-MIA-20260806-004 | 2026-08-06T21:39:20.696Z | ENTREGADO | 8mo8182LJsgV7vKMSpiCekFKAG23 | No | No | Sí | No | Sí | CORRECTO |
| PED_1786004890313 | PIZZERIA-MIA-20260806-003 | 2026-08-06T08:28:10.313Z | PENDIENTE | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785652376541 | 0802-97 | 2026-08-02T06:32:56.541Z | PENDIENTE | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785624210328 | 0801-43 | 2026-08-01T22:43:30.328Z | PENDIENTE | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785622255006 | 0801-34 | 2026-08-01T22:10:56.481Z | EN_CURSO | driver_trans_transition_001 | Sí | No | No | Sí | Sí | CORRECTO |
| P1_1785621165407_0 | 0801-95 | 2026-08-01T21:54:45.255Z | LISTO | N/D | Sí | No | No | Sí | Sí | CORRECTO |
| PED_1785615024187 | 0801-82 | 2026-08-01T20:11:50.062Z | ENTREGADO | 9XPSCLkFUWeZnxWoFgZEf0uzkTe2 | No | No | Sí | No | Sí | CORRECTO |
| PED_1785612556528 | 0801-68 | 2026-08-01T19:29:16.528Z | ENTREGADO | 9XPSCLkFUWeZnxWoFgZEf0uzkTe2 | No | No | Sí | No | Sí | CORRECTO |
| PED_1785589003953 | 0801-63 | 2026-08-01T12:56:43.953Z | ENTREGADO | driver_test_001 | No | No | Sí | No | Sí | CORRECTO |
| PED_1785588908331 | 0801-93 | 2026-08-01T12:55:08.331Z | ENTREGADO | driver_test_001 | No | No | Sí | No | Sí | CORRECTO |
| PED_1785588888544 | 0801-36 | 2026-08-01T12:54:48.544Z | ENTREGADO | driver_test_001 | No | No | Sí | No | Sí | CORRECTO |
| PED_1785586862522 | 0801-47 | 2026-08-01T12:21:02.522Z | ENTREGADO | driver_test_001 | No | No | Sí | No | Sí | CORRECTO |
| PED_1785586830840 | 0801-26 | 2026-08-01T12:20:30.840Z | ENTREGADO | driver_test_001 | No | No | Sí | No | Sí | CORRECTO |
| PED_1785586774077 | 0801-77 | 2026-08-01T12:19:34.077Z | ENTREGADO | driver_test_001 | No | No | Sí | No | Sí | CORRECTO |
| P1_ROT_1785586244866_2 | 0801-19 | 2026-08-01T12:10:44.878Z | ENTREGADO | 9XPSCLkFUWeZnxWoFgZEf0uzkTe2 | No | No | Sí | No | Sí | CORRECTO |
| P1_ROT_1785586243510_1 | 0801-66 | 2026-08-01T12:10:43.516Z | ENTREGADO | iXXl1erAQxW0Hht0CLWzlOYGaAi1 | No | No | Sí | No | Sí | CORRECTO |