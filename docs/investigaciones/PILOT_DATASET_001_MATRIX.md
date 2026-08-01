# PILOT_DATASET_001 - Matriz de evidencia por capa

Matriz viva para auditar pedidos de referencia y ubicar el primer punto donde reaparecen los historicos dentro de la cadena de datos.

## Instrucciones

- Usar 10 pedidos representativos.
- Incluir pedidos historicos, de certificacion y operativos.
- Registrar una fila por pedido.
- Marcar el primer punto donde el pedido deja de ser consistente.
- Si una capa no aplica, escribir `N/D`.

## Cabecera de apertura

```text
INCIDENT_ID: PILOT_DATASET_001
SEVERITY: S2
STATUS: INVESTIGATING
OWNER:
DATE: 2026-08-01
BASELINE: ECOSYSTEM_CERT_001 / NAE v1.0 / P17
RELATED_CERTIFICATIONS: ECOSYSTEM_CERT_001, NAE_E2E_CERTIFICATION, POST-NAE-001, CONTRACT_AUDIT_001
RELATED_COMMITS:
SOURCE: docs/architecture/OPEN_INVESTIGATIONS.md
RELATED_FRENTS: KITCHEN_SYNC_001, CONTRACT_AUDIT_001
```

## Matriz de pedidos

| # | PedidoId | shortId | Estado RTDB | active_orders | today_orders | historical_orders | Panel | Driver | Primer punto inconsistente | Capa probable | Evidencia |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `PED_1785200134315` | N/D | N/D | Presente en activo vivo | N/D | N/D | Visible en panel vivo | N/D | Contrato activo | CONTRACT / DATASET | Traza viva: `active_orders = 87` y memoria replicada en panel |
| 2 | `PED_1785583276094` | `0801-41` | `PENDIENTE` | Presente en activo vivo | N/D | N/D | Visible en panel | N/D | Contrato activo | CONTRACT / CACHE | `window.__nellyArchiveEngineContractSnapshot` y `archiveEngineActiveOrdersCache` |
| 3 | `PED_1785584324979` | `0801-??` | `EN_CURSO` | Presente en activo vivo | N/D | N/D | Visible en panel | N/D | Contrato activo | CONTRACT / PANEL | `active_orders = 87`, propagado a `window.__nellyOperationOrders` |
| 4 | `PED_1785584965086` | `0801-??` | `EN_CURSO` | Presente en activo vivo | N/D | N/D | Visible en panel | N/D | Contrato activo | CONTRACT / PANEL | Pedido aparece en contrato y en memoria del panel |
| 5 | `PED_1785575341667` | N/D | N/D | N/D | N/D | N/D | N/D | N/D | Pendiente | UNKNOWN | Sin traza directa en la sesion viva |
| 6 | `ECOSYS_POS2_1785578304736` | `0801-78` | `EN_CURSO` | Presente en activo vivo | N/D | N/D | Visible en panel | N/D | Contrato activo | CONTRACT / DATASET | Visible en la traza viva como pedido operativo activo |
| 7 | `ECOSYS_POS3_1785581675675_0` | `0801-86` | `EN_CURSO` | Presente en activo vivo | N/D | N/D | Visible en panel | N/D | Contrato activo | CONTRACT / DATASET | Visible en la traza viva como pedido operativo activo |
| 8 | `PED_1785581897982` | N/D | N/D | N/D | N/D | N/D | N/D | N/D | Pendiente | UNKNOWN | Sin traza directa en la sesion viva |
| 9 | `PED_1785582055382` | N/D | N/D | N/D | N/D | N/D | N/D | N/D | Pendiente | UNKNOWN | Sin traza directa en la sesion viva |
| 10 | `PED_1785583637223` | `0801-??` | `EN_CURSO` | Presente en activo vivo | N/D | N/D | Visible en panel | N/D | Contrato activo | CONTRACT / PANEL | Aparece en el snapshot contractual y en la memoria viva |

## Criterio de lectura

- Si `Estado RTDB` ya es historico pero aparece en `active_orders`, la sospecha cae en `Archive Engine` o contrato.
- Si `active_orders` esta limpio pero aparece en `Panel`, la sospecha cae en cache o reconstruccion local.
- Si `Panel` esta limpio pero `Driver` no, la sospecha cae en el contrato de consumo del driver.
- Si una fila no puede completarse, documentar el motivo en `Evidencia`.

## Resumen por capa

| Capa | Cantidad de coincidencias | Observacion |
|---|---|---|
| RTDB | N/D | No se consulto directamente en esta corrida |
| active_orders | 87 | El contrato vivo trae pedidos historicos y operativos mezclados |
| today_orders | 30 | Presente en el snapshot contractual |
| historical_orders | 330 | Presente en el snapshot contractual |
| Panel | 87 | `window.__nellyOperationOrders` y `window.__nellyPedidosCocinaCanonical` replican el contrato |
| Driver | N/D | No se inspecciono en esta corrida |

## Hallazgos

- Hallazgo 1: La primera inconsistencia observable aparece en el contrato vivo, donde `active_orders` llega con 87 pedidos y mezcla historial con operacion.
- Hallazgo 2: La caché del panel replica el contrato sin filtrar y termina en `window.__nellyPedidosCocinaCanonical` y `window.__nellyOperationOrders`.
- Hallazgo 3: El render no parece ser la fuente primaria; solo muestra el estado ya contaminado por contrato y memoria.

## Decision preliminar

- Capa causal mas probable: `CONTRACT / DATASET`
- Frente a mantener abierto: `PILOT_DATASET_001`
- Siguiente accion: auditar por pedido en RTDB y contrastar con `active_orders`, `today_orders`, `historical_orders`, panel y driver en una corrida controlada
