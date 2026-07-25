# ADR Index

Este indice reune las decisiones arquitectonicas que guian el proyecto. Antes de cambiar contratos o rutas de datos, revisa primero el ADR correspondiente.

## ADRs Principales

| ADR | Tema | Estado | Archivo |
| --- | --- | --- | --- |
| ADR-RADAR-001 | Pool de pedidos en el Radar de NellyDriver | Aprobada como arquitectura objetivo | [`docs/architecture/ADR_RADAR_DRIVER_POOL_PEDIDOS.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ADR_RADAR_DRIVER_POOL_PEDIDOS.md) |
| ADR-ESTADOS-001 | Contrato de estados del pedido | Activo | [`docs/architecture/CONTRATO_ESTADOS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/CONTRATO_ESTADOS_V1.md) |
| ADR-SSOT-001 | Mapa oficial SSOT del ecosistema | Activo | [`docs/architecture/NELLY_OMEGA_MAPA_OFICIAL.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/NELLY_OMEGA_MAPA_OFICIAL.md) |
| ADR-DATA-001 | Modelo de datos canonico operativo | Activo | [`DATA_MODEL.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/DATA_MODEL.md) |
| ADR-002 | Canonizacion del modelo de datos | Activo | [`docs/adr/ADR-002-DATA_MODEL.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/ADR-002-DATA_MODEL.md) |
| ADR-003 | Flujo Radar Driver | Activo | [`docs/adr/ADR-003-RADAR_DRIVER.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/ADR-003-RADAR_DRIVER.md) |
| ADR-004 | Contrato complete-order | Activo | [`docs/adr/ADR-004-COMPLETE_ORDER.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/ADR-004-COMPLETE_ORDER.md) |
| ADR-005 | Finanzas canonicas | Activo | [`docs/adr/ADR-005-FINANZAS.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/ADR-005-FINANZAS.md) |
| ADR-006 | Autenticacion | Activo | [`docs/adr/ADR-006-AUTHENTICATION.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/ADR-006-AUTHENTICATION.md) |
| ADR-007 | Separacion de bloqueo manual y bloqueo por deuda | Activo | [`docs/adr/ADR-007-BLOQUEO-REPARTIDORES.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/ADR-007-BLOQUEO-REPARTIDORES.md) |
| ADR-008 | Maquina de estados logistica de ultima milla | Propuesta | [`docs/adr/ADR-008-MAQUINA_ESTADOS_LOGISTICA.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/ADR-008-MAQUINA_ESTADOS_LOGISTICA.md) |
| ADR-009 | Comparativo maquina de estados logistica | Propuesta | [`docs/adr/ADR-009-COMPARATIVO_MAQUINA_ESTADOS_LOGISTICA.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/ADR-009-COMPARATIVO_MAQUINA_ESTADOS_LOGISTICA.md) |
| ADR-010 | Decision final maquina de estados logistica | Propuesta | [`docs/adr/ADR-010-DECISION_MAQUINA_ESTADOS_LOGISTICA.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/ADR-010-DECISION_MAQUINA_ESTADOS_LOGISTICA.md) |
| PLAN-MAQUINA-ESTADOS | Migracion maquina de estados logistica | Propuesto | [`docs/architecture/PLAN_MIGRACION_MAQUINA_ESTADOS_LOGISTICA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/PLAN_MIGRACION_MAQUINA_ESTADOS_LOGISTICA_V1.md) |
| MATRIZ-MAQUINA-ESTADOS | Matriz operativa de migracion | Propuesto | [`docs/architecture/MATRIZ_MIGRACION_MAQUINA_ESTADOS_LOGISTICA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MATRIZ_MIGRACION_MAQUINA_ESTADOS_LOGISTICA_V1.md) |
| ROADMAP-MAQUINA-ESTADOS | Roadmap ejecutivo de migracion | Propuesto | [`docs/architecture/ROADMAP_EJECUTIVO_MAQUINA_ESTADOS_LOGISTICA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ROADMAP_EJECUTIVO_MAQUINA_ESTADOS_LOGISTICA_V1.md) |
| RESUMEN-DIRECCION-MAQUINA-ESTADOS | Resumen para direccion | Propuesto | [`docs/architecture/RESUMEN_DIRECCION_MAQUINA_ESTADOS_LOGISTICA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/RESUMEN_DIRECCION_MAQUINA_ESTADOS_LOGISTICA_V1.md) |
| PLAN-EVIDENCIA-PILOTO-MAQUINA-ESTADOS | Evidencia del piloto para futura decision | Propuesto | [`docs/architecture/PLAN_EVIDENCIA_PILOTO_MAQUINA_ESTADOS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/PLAN_EVIDENCIA_PILOTO_MAQUINA_ESTADOS_V1.md) |

## Criterio de Uso

- Si el cambio toca estados de pedido, leer ADR-ESTADOS-001.
- Si el cambio toca Radar o aceptacion de pedidos, leer ADR-RADAR-001.
- Si el cambio toca rutas de datos, leer ADR-DATA-001.
- Si el cambio toca responsabilidades generales del sistema, leer ADR-SSOT-001.
- Si el cambio toca bloqueo de repartidores, leer ADR-007.
- Si el cambio toca la maquina de estados logistica de ultima milla, leer ADR-008.
- Si el cambio toca la comparativa entre contratos de estados, leer ADR-009.
- Si el cambio toca la decision final sobre adopcion, leer ADR-010.
- Si el cambio toca la migracion por fases de la maquina enriquecida, leer PLAN-MAQUINA-ESTADOS.
- Si el cambio toca la matriz operativa de migracion, leer MATRIZ-MAQUINA-ESTADOS.
- Si el cambio toca el resumen ejecutivo de migracion, leer ROADMAP-MAQUINA-ESTADOS.
- Si el cambio toca el resumen para direccion, leer RESUMEN-DIRECCION-MAQUINA-ESTADOS.
- Si el cambio toca la evidencia del piloto para futura decision, leer PLAN-EVIDENCIA-PILOTO-MAQUINA-ESTADOS.

## Regla

No propongas cambios sobre contratos ya certificados sin consultar el ADR y la certificacion relacionada.
