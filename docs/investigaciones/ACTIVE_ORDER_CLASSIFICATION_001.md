# ACTIVE_ORDER_CLASSIFICATION_001 - Clasificacion de pedidos activos

## Manifiesto de apertura

```text
INCIDENT_ID: ACTIVE_ORDER_CLASSIFICATION_001
SEVERITY: S2
STATUS: RESOLVED (UNDER OBSERVATION)
OWNER: Nelly OS
DATE: 2026-08-01
BASELINE: ECOSYSTEM_CERT_001 / GO_LIVE_CERTIFICATION_001 / P17
RELATED_CERTIFICATIONS: DATASET_FINALIZATION_001, CONTRACT_AUDIT_001, GO_LIVE_CERTIFICATION_001
RELATED_COMMITS: Pendiente
SOURCE: docs/investigaciones/INDEX.md
RELATED_FRENTS: DATASET_FINALIZATION_001, CONTRACT_AUDIT_001, KITCHEN_SYNC_001
```

## 1. Clasificacion

- Tipo de incidente: Clasificacion operativa de pedidos vivos
- Categoria: DATASET
- Severidad: S2
- Frente abierto: No
- Impacto inicial: Verificar si pedidos `DIAG_COMPLETE_*` y `P1_ROT_*` permanecen activos por una razon operativa valida

### Hallazgo

- La muestra auditada no presento pedidos `ENTREGADO` publicados simultaneamente en `active_orders`.
- Los pedidos revisados se encontraron en estados compatibles con operacion: `PENDIENTE`, `LISTO` o `EN_CURSO`.
- No se identifico evidencia suficiente de una inconsistencia de clasificacion en la muestra validada.

## 2. Evidencia

### Muestra validada

| Pedido | Estado RTDB | Dispatch | Accept | Complete | Dictamen |
|---|---|---|---|---|---|
| `DIAG_COMPLETE_1785523659638` | `PENDIENTE` | No visible | No visible | No visible | `Compatible con estado activo` |
| `DIAG_COMPLETE_1785570974126` | `LISTO` | Si | No visible | No visible | `Compatible con estado activo` |
| `DIAG_COMPLETE_1785566591790` | `LISTO` | Si | No visible | No visible | `Compatible con estado activo` |
| `P1_ROT_1785585927429_2` | `LISTO` | Si | No visible | No visible | `Compatible con estado activo` |

### Matriz forense

| Evidencia | Dictamen |
|---|---|
| `ENTREGADO` + `active_orders` | `ACTIVO INCONSISTENTE` |
| `LISTO` o `EN_CURSO` + sin `complete-order` | `COMPATIBLE CON ESTADO ACTIVO` |
| `LISTO` o `EN_CURSO` + con `complete-order` | `REVISAR PERSISTENCIA DEL CIERRE` |
| Evidencia incompleta | `INDETERMINADO` |

## 3. Resultado

- Resultado: `RESOLVED (UNDER OBSERVATION)`
- Conclusión: no existe evidencia suficiente para afirmar una clasificacion incorrecta por parte de `active_orders` en la muestra revisada.
- Monitoreo: mantener observacion temporal durante el piloto para detectar cualquier `ENTREGADO` publicado como activo.

## 4. Criterio de vigilancia

- Registrar cualquier caso donde `estado = ENTREGADO` y el pedido permanezca en `active_orders`.
- Capturar `pedidoId`, `traceId`, `estado_anterior`, `estado_actual`, `timestamp` y fuente.
- No modificar logica, contratos ni render para esta observacion.

## 5. Cierre

- `panel.html`: no es causa raiz demostrada.
- `render-manager.js`: no es causa raiz demostrada.
- `DATASET_FINALIZATION_001`: resuelto para las familias historicas auditadas.
- `ACTIVE_ORDER_CLASSIFICATION_001`: resuelto bajo observacion.

