# CONTRACT_AUDIT_001 - MATRIZ DE TRAZABILIDAD DEL CONTRATO DE LECTURA

## Identificacion

| Campo | Valor |
| --- | --- |
| Codigo | `CONTRACT_AUDIT_001` |
| Version | `1.0` |
| Fecha | `2026-08-01` |
| Estado | `BORRADOR DE AUDITORIA` |
| Alcance | `RTDB -> Archive Engine -> Contract -> Panel -> Driver` |

## Objetivo

Verificar si un pedido concreto mantiene consistencia a traves de toda la cadena de lectura y visualizacion, sin tocar el baseline ni aplicar parches.

## Pedido de referencia

| Campo | Valor |
| --- | --- |
| Pedido principal | `PED_1785200134315` |
| Tipo | `Pedido certificado E2E` |
| Estado documental | `Certificado y cerrado` |

## Matriz de auditoria

| PedidoId | shortId | Fecha creacion | Estado RTDB | En active_orders | En today_orders | En historical_orders | Visible en Panel | Visible en Driver | Diagnostico |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `PED_1785200134315` | `N/D` | `N/D` | `N/D` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` |
| `PED_1785583276094` | `N/D` | `2026-08-01` | `PENDIENTE` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` |
| `PED_1785584324979` | `N/D` | `2026-08-01` | `EN_CURSO` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` |
| `PED_1785584965086` | `N/D` | `2026-08-01` | `LISTO` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` | `Pendiente` |

## Hipotesis de trabajo

### KITCHEN_SYNC_001

- `moverAReparto()` depende de que el pedido siga presente en `pedidosPendientes`.
- Si una sincronizacion recalifica el pedido antes del clic, el panel puede perder la referencia operativa.

### PILOT_DATASET_001

- El driver solo consume el contrato de lectura.
- Si ve pedidos de certificacion como activos, el problema esta antes del render, en la clasificacion o en el dataset.

### CONTRACT_AUDIT_001

- La cadena debe coincidir en todas las capas para el mismo pedido.
- Si una capa publica un pedido que otra ya considera historico, existe inconsistencia de contrato.

## Evidencia requerida por capa

| Capa | Evidencia requerida |
| --- | --- |
| RTDB | Pedido, estado, timestamps, puntero de driver si existe |
| Archive Engine | Bucket asignado y motivo de clasificacion |
| Contract | JSON de `/api/data-architecture/data-access` |
| Panel | Estado en `kitchenState.orders` y coleccion visible |
| Driver | Lista de pedidos visibles y criterio de inclusion |

## Criterio de cierre

La auditoria solo se considerara cerrada cuando al menos un pedido de referencia tenga trazabilidad completa y el diagnostico permita atribuir el origen del defecto a una sola capa.

## Estado de ejecucion

- Script automatizado preparado en `scripts/validation/contract-audit-001.mjs`.
- Reportes destino preparados:
  - `CONTRACT_AUDIT_001_RESULTS.md`
  - `CONTRACT_AUDIT_001_EVIDENCE.md`
  - `contract-audit-report.json`
- La ejecucion completa quedo bloqueada en este entorno por acceso de red a Google OAuth al inicializar Firebase Admin.
