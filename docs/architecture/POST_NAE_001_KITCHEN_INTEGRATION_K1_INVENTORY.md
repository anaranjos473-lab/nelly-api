# POST-NAE-001-K1: Inventario de dependencias RTDB en Cocina

## Estado

Completado

## Propósito

Registrar, con evidencia del código, qué listeners RTDB siguen activos en Cocina, qué consumidores los usan y qué parte de esa información ya está cubierta por `DataAccessService v1`.

## Alcance

- Inventario de listeners RTDB en `public/panel.html`.
- Inventario de consumidores de UI que dependen de esos listeners.
- Matriz inicial de equivalencia entre RTDB y `active_orders`.
- Clasificación preliminar de cada dependencia.

## Fuentes inspeccionadas

- `public/panel.html`
- `public/js/premium-kitchen/render/render-manager.js`

## Hallazgos

### 1. Listeners RTDB detectados en Cocina

| Listener | Archivo | Función observada | Estado K1 |
|---|---|---|---|
| `onValue(ref(db, 'pedidos'))` | `public/panel.html` | Cola operativa inicial del panel superior (`lista-pedidos`) | Revisar |
| `onValue(ref(rtdb, 'pedidos'))` | `public/panel.html` | Rescate manual de pedidos y sincronización operativa de Cocina | Revisar |
| `onValue(pedidosRef, ...)` | `public/panel.html` | Historial / filtro de ventas sobre la colección `pedidos` | Revisar |
| `onValue(dbRef, ...)` | `public/panel.html` | Sincronización operativa principal de `kitchenState.orders.*` | Revisar |
| `onValue(completadosRef, ...)` | `public/panel.html` | Carga de pedidos entregados desde `pedidos_completados` | Revisar |
| `onValue(ref(rtdb, "liquidaciones_auditoria"), ...)` | `public/panel.html` | Alertas de auditoría de liquidaciones | Revisar |
| `onValue(ref(ref), ...)` de `.info/connected` | `public/panel.html` | Estado de conexión general de Firebase | Temporal / no operativo |

### 2. Consumidores de UI detectados

| Consumidor | Dependencia observada | Lectura funcional |
|---|---|---|
| `lista-pedidos` | `onValue(ref(db, 'pedidos'))` | Vista de cola simple con estado `PENDIENTE` |
| `operation-focus-queue` | `kitchenState.orders.pedidosPendientes`, `pedidosReparto`, `pedidosEnCamino`, `pedidosEntregados` | Cola operativa principal |
| `actualizarPanel()` | `renderManager.renderOrderLists(...)` y `renderManager.renderCounters(...)` | Kanban, contadores y KPIs |
| `verDetallePedido()` | Maps de `kitchenState.orders.*` | Detalle de pedido |
| `reimprimirTicket()` | Maps de `kitchenState.orders.*` | Reimpresión |
| `abrirChatCliente()` / `sugerirCambioPedido()` | Maps de `kitchenState.orders.*` | Acciones operativas sobre pedido |
| `filtrarVentas()` | `onValue(ref(rtdb, 'pedidos'))` | Historial / analítica temporal |
| `liquidaciones_auditoria` | `onValue(ref(rtdb, "liquidaciones_auditoria"))` | Notificaciones de liquidación |

### 3. Matriz de equivalencia inicial

| Información | RTDB | `active_orders` | Estado |
|---|---:|---:|---|
| Pedido activo visible | Sí | Sí | Equivalente parcial |
| Pedido en preparación | Sí | Sí | Equivalente parcial |
| Pedido en reparto / en camino | Sí | Sí | Equivalente parcial |
| Pedido entregado del día | Sí | Parcialmente | Requiere verificación |
| Historial de ventas | Sí | No en cola activa | No migrable todavía |
| Liquidaciones de auditoría | Sí | No | Debe permanecer temporalmente en RTDB |
| Estado de conexión Firebase | Sí | No | Temporal / transversal |

## Clasificación preliminar

- **Migrable inmediatamente**
  - Cola operativa simple si la equivalencia de campos se confirma.
  - Vistas que solo muestran pedidos activos y estados operativos directos.

- **Requiere ampliar el contrato**
  - Detalle de pedido si faltan campos como `fase`, `shortId`, `cliente_nombre` o métricas operativas.
  - Historial temporal si `active_orders` no expone la misma granularidad que el flujo de ventas.

- **Debe permanecer temporalmente en RTDB**
  - `liquidaciones_auditoria`.
  - `/.info/connected`.
  - Cualquier vista histórica todavía no cubierta por `DataAccessService`.

- **Obsoleta**
  - No se marcó ninguna dependencia como obsoleta en K1, porque este paso solo inventaría.

## Conclusión de K1

K1 confirma que Cocina sigue dependiendo de una mezcla de lectura entre RTDB y `DataAccessService v1`.

El punto más sensible no es el contrato NAE, sino la UI de Cocina, porque:

- el render principal usa `kitchenState.orders.*`;
- la cola visible todavía recibe datos desde `onValue(ref(rtdb, 'pedidos'))` y `onValue(dbRef, ...)`;
- existen listeners auxiliares para completados, liquidaciones y ventas históricas.

Por lo tanto:

- `K1` queda cerrado como inventario;
- `K2` debe validar equivalencia funcional antes de migrar;
- no se elimina ningún listener todavía.

## Evidencia clave

- `public/panel.html:62`
- `public/panel.html:2376`
- `public/panel.html:4005`
- `public/panel.html:4187`
- `public/panel.html:5134`
- `public/panel.html:5159`
- `public/panel.html:5168`
- `public/panel.html:5190`
- `public/panel.html:3131`
- `public/panel.html:3371`
- `public/panel.html:3382`
- `public/panel.html:5244`
- `public/js/premium-kitchen/render/render-manager.js:270`
- `public/js/premium-kitchen/render/render-manager.js:300`

## Relación

- [`POST_NAE_001_KITCHEN_INTEGRATION.md`](./POST_NAE_001_KITCHEN_INTEGRATION.md)
- [`POST_NAE_001_KITCHEN_INTEGRATION_EXECUTION.md`](./POST_NAE_001_KITCHEN_INTEGRATION_EXECUTION.md)

## Historial de cambios

- 2026-07-30: inventario K1 cerrado con listeners, consumidores y clasificación inicial.
