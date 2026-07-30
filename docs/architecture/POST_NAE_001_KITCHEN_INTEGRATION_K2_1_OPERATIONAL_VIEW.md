# POST-NAE-001-K2.1: Operational View Equivalence

## Estado

Listo para validacion operacional

## Propósito

Demostrar si la vista operativa de Cocina puede reconstruirse funcionalmente desde `active_orders` sin depender de estructuras internas alimentadas por RTDB.

## Relación con K2

Esta validación no es un nuevo proyecto. Es el cierre natural de K2 y existe para resolver la última duda antes de abrir K3.

## Pregunta central

¿Puede el render principal de Cocina construirse únicamente a partir de `active_orders`?

## Vista objetivo

| Vista Cocina | Fuente RTDB actual | Regla esperada desde `active_orders` | Estado |
|---|---|---|---|
| Pendientes | `kitchenState.orders.pedidosPendientes` | `estado == PENDIENTE` o fase equivalente de cocina | Pendiente |
| Reparto | `kitchenState.orders.pedidosReparto` | `estado == LISTO` o fase equivalente de despacho | Pendiente |
| En camino | `kitchenState.orders.pedidosEnCamino` | `estado == EN_CURSO` o equivalente logístico | Pendiente |
| Entregados | `kitchenState.orders.pedidosEntregados` | `estado == ENTREGADO` o flujo histórico del dia | Pendiente |

## Evidencia que debe producirse

- Reglas exactas de derivación por vista.
- Lista de campos mínimos usados para reconstruir la cola.
- Confirmación de que el render principal puede ordenarse y filtrarse sin RTDB.
- Identificación de cualquier dato que siga siendo exclusivo de RTDB.

## Lo que ya se sabe

- `active_orders` expone los campos estructurales principales para identificación y ordenamiento.
- Cocina sigue renderizando con `kitchenState.orders.*`.
- `pedidosPendientes`, `pedidosReparto`, `pedidosEnCamino` y `pedidosEntregados` todavía no tienen una equivalencia funcional demostrada solo con el contrato.

## Regla de derivacion observada

La UI actual de Cocina ya expresa una logica de fase que puede servir como base de reconstruccion desde `active_orders`:

- `PENDIENTE` -> `COCINA`
- `LISTO` -> `DESPACHO`
- `EN_CURSO` -> `EN_REPARTO`
- `ENTREGADO` -> `ENTREGADO`

Ademas, la antiguedad y el orden visible dependen principalmente de:

- `createdAt`
- `created_at`
- `fecha_creacion`
- `timestamp`

Y el folio visible depende de:

- `shortId`
- `id_pedido`
- `id`

## Reconstruccion funcional propuesta

| Vista Cocina | Regla desde `active_orders` | Campos minimos |
|---|---|---|
| Pendientes | `estado == PENDIENTE` o fase derivada `COCINA` | `id`, `shortId`, `estado`, `cliente_nombre`, `createdAt` |
| Reparto | `estado == LISTO` o fase derivada `DESPACHO` | `id`, `shortId`, `estado`, `cliente_nombre`, `createdAt`, `monto_total` |
| En camino | `estado == EN_CURSO` o fase derivada `EN_REPARTO` | `id`, `shortId`, `estado`, `cliente_nombre`, `repartidor_id` o equivalente, `createdAt` |
| Entregados | `estado == ENTREGADO` | `id`, `shortId`, `estado`, `cliente_nombre`, `createdAt`, `finalizado_at` o `entregado_en` |

## Lectura funcional de la vista

La reconstruccion operativa no requiere nuevas reglas de negocio si se conserva:

- el orden por antiguedad;
- la fase derivada desde `estado`;
- el folio derivado desde `shortId` o `id`;
- la busqueda por `cliente_nombre`, `direccion` y `shortId`;
- los indicadores de prioridad basados en edad del pedido.

## Criterio de cierre

K2.1 se considerará cerrado cuando exista evidencia reproducible de que:

- las cuatro vistas operativas pueden derivarse de `active_orders`;
- el render observado coincide con el comportamiento esperado;
- no fue necesario consultar RTDB para construir la cola principal.

## Estado de derivacion por vista

| Vista Cocina | Fuente RTDB actual | Regla desde `active_orders` | Estado |
|---|---|---|---|
| Pendientes | `kitchenState.orders.pedidosPendientes` | `estado == PENDIENTE` o fase `COCINA` | Derivable |
| Reparto | `kitchenState.orders.pedidosReparto` | `estado == LISTO` o fase `DESPACHO` | Derivable |
| En camino | `kitchenState.orders.pedidosEnCamino` | `estado == EN_CURSO` o fase `EN_REPARTO` | Derivable |
| Entregados | `kitchenState.orders.pedidosEntregados` | `estado == ENTREGADO` | Derivable |

## Conclusión operativa provisional

K2.1 deja de ser un ejercicio de arquitectura y pasa a ser un ejercicio de validacion operacional.

La siguiente evidencia debe provenir del sistema funcionando:

- clasificación correcta;
- ausencia de duplicados;
- desaparición de la vista anterior al cambiar de estado;
- mantenimiento del orden por `createdAt` o la regla definida;
- coincidencia de la información visible con el pedido esperado.

## Veredicto recomendado

- K1: cerrado
- K2: sustancialmente completado
- K2.1: listo para validacion operacional
- K3: bloqueado hasta aprobar la prueba real

## Gate hacia K3

K3 solo podrá iniciarse cuando:

- K2.1 esté cerrado;
- la cola completa sea derivable desde `active_orders`;
- la dependencia operativa de RTDB quede documentada como no necesaria para la vista certificada.

## Estado del frente

- K1: cerrado
- K2: 95% completado
- K2.1: abierto
- K3: bloqueado

## Historial de cambios

- 2026-07-30: se abre la validación puente de equivalencia operativa.
