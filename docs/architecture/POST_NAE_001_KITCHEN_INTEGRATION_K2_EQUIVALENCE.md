# POST-NAE-001-K2: Matriz de equivalencia RTDB vs DataAccessService

## Estado

Listo para iniciar

## Propósito

Demostrar, con evidencia objetiva, si `active_orders` puede reemplazar a RTDB para la cola operativa de Cocina sin pérdida funcional.

## Objetivo oficial

Determinar si la cola operativa visible puede construirse únicamente con `DataAccessService v1` y si las diferencias restantes requieren ampliar el contrato o permanecer temporalmente en RTDB.

## Principio rector

- No cambiar implementación.
- No eliminar listeners.
- No modificar `DataAccessService`.
- No alterar el comportamiento certificado.

## Aplicación del Manifiesto de las 4 Casillas

### 1. Comprender

Para cada dato usado por Cocina se debe responder:

- de dónde sale hoy;
- quién lo consume;
- con qué propósito.

### 2. Evidencia

Cada fila de la matriz debe apoyarse en:

- estructura real de RTDB;
- respuesta real de `active_orders`;
- punto exacto del render que consume el dato.

### 3. No romper

Durante K2 no se modifica la cola, el scheduler, el contrato ni la UI certificada.

### 4. Cambio mínimo

La única salida de K2 es conocimiento verificable.

## Matriz de equivalencia inicial

| Campo | RTDB | `active_orders` | Consumidor | Estado | Decisión |
|---|---|---|---|---|---|
| ID | Sí | Sí (`id`) | Cola / detalle | Equivalente | Migrar |
| Estado | Sí | Sí (`estado`) | Cola / tarjeta | Equivalente | Migrar |
| Comercio | Sí | Sí (`comercio_nombre`) | Tarjeta / foco | Equivalente | Migrar |
| Cliente | Sí | Sí (`cliente_nombre`) | Tarjeta / foco | Equivalente | Migrar |
| Dirección | Sí | Sí en UI RTDB, por confirmar en contrato | Tarjeta / entrega | Dudoso | Validar |
| Hora de creación | Sí | Sí (`createdAt` y variantes documentadas) | Ordenamiento | Equivalente parcial | Revisar |
| Prioridad | Sí | No expuesta como campo formal en contrato | Ordenamiento / riesgo | Faltante | No migrar todavía |
| Observaciones | Sí | Por confirmar | Tarjeta / detalle | Dudoso | Validar |
| `shortId` / folio diario | Sí | Sí (`shortId`) | Render visible | Equivalente | Migrar |
| `fase` operativa | Sí | Derivable desde `estado` | Render y foco | Equivalente parcial | Revisar |
| `pedidosPendientes` | Sí | No como estructura | Render interno | No equivalente | No migrar todavía |
| `pedidosReparto` | Sí | No como estructura | Render interno | No equivalente | No migrar todavía |
| `pedidosEnCamino` | Sí | No como estructura | Render interno | No equivalente | No migrar todavía |
| `pedidosEntregados` | Sí | Parcial | Historial visual | Dudoso | Validar |

## Clasificación por fila

### Equivalente

El contrato cubre completamente el dato.

Salida:

- migrar.

### Dudoso

Existe información similar pero requiere validación.

Salida:

- revisar.

### Faltante

El contrato no expone todavía el dato necesario.

Salida:

- no migrar;
- decidir si hay que ampliar el contrato o adaptar la UI.

### No utilizado

El dato existe en RTDB pero ningún consumidor relevante lo usa para la cola certificada.

Salida:

- candidato a limpieza futura.

## Criterio de salida

K2 se considerará cerrado cuando podamos afirmar, con evidencia:

- la cola operativa puede construirse únicamente con `active_orders`, o bien;
- las diferencias restantes están identificadas y documentadas.

## Evidencia confirmada hasta ahora

### Confirmado en contrato

- `id`
- `shortId`
- `estado`
- `cliente_nombre`
- `comercio_nombre`
- `createdAt`
- `created_at`
- `timestampActualizacion`
- `finalizado_at`
- `entregado_en`

### Confirmado en implementación

- `getActiveOrders()` devuelve `snapshot.orders_active`.
- Cocina ya consume `DATA_ACCESS_ENDPOINT` para cachear `active_orders`.
- La UI operativa sigue leyendo `kitchenState.orders.*`, por lo que la equivalencia todavía no es total.

### Pendiente de validar

| Campo | RTDB | `active_orders` | Consumidor | Estado | Decisión |
|---|---|---|---|---|---|
| ID | Sí | Sí | Cola / detalle | Equivalente | Migrar |
| Estado | Sí | Sí | Cola / tarjeta | Equivalente | Migrar |
| Comercio | Sí | Sí | Tarjeta / foco | Equivalente | Migrar |
| Cliente | Sí | Sí | Tarjeta / foco | Equivalente | Migrar |
| Dirección | Sí | Sí en UI, no formalizado como campo obligatorio del contrato | Tarjeta / entrega | Equivalente parcial | Revisar |
| Hora de creación | Sí | Sí | Ordenamiento / antiguedad | Equivalente parcial | Revisar |
| Prioridad | Sí | Derivable desde `createdAt` y estado | Ordenamiento / riesgo | Equivalente parcial | Revisar |
| Observaciones | Sí | Sí en UI, no formalizado como bloque contractual propio | Tarjeta / detalle | Equivalente parcial | Revisar |
| `shortId` | Sí | Sí | Render visible | Equivalente | Migrar |
| `fase` operativa | Sí | Derivable desde `estado` | Render y foco | Equivalente parcial | Revisar |
| `pedidosPendientes` | Sí | No como estructura | Render interno | No equivalente | No migrar todavía |
| `pedidosReparto` | Sí | No como estructura | Render interno | No equivalente | No migrar todavía |
| `pedidosEnCamino` | Sí | No como estructura | Render interno | No equivalente | No migrar todavía |
| `pedidosEntregados` | Sí | Parcial | Historial visual | Equivalente parcial | Revisar |

### Lectura operativa real de Cocina

En `public/panel.html`, Cocina sigue usando:

- `pedido.shortId || pedido.id_pedido || pedido.id` para identificar filas;
- `pedido.estado` para clasificar la fase;
- `pedido.cliente_nombre` / `pedido.cliente` para el encabezado;
- `pedido.direccion` para el detalle;
- `pedido.createdAt` / `pedido.created_at` / `pedido.fecha_creacion` para antiguedad y prioridad;
- `pedido.observaciones` / `pedido.notas` / `pedido.referencia` para el detalle visible;
- `pedido.tipo_ubicacion`, `pedido.metodo_entrega`, `pedido.referencia_ubicacion`, `pedido.notas_ubicacion` para la ubicacion humanizada;
- `pedido.historico_acciones` o, si no existe, una cronologia derivada de campos temporales;
- `kitchenState.orders.pedidosPendientes`, `pedidosReparto`, `pedidosEnCamino`, `pedidosEntregados` para el render principal y los accesos operativos.

### Clasificacion final de la primera pasada

- **Migrar**
  - `id`
  - `estado`
  - `comercio`
  - `cliente`
  - `shortId`

- **Revisar**
  - `hora de creación`
  - `fase operativa`
  - `prioridad`

- **Validar**
  - `direccion`
  - `observaciones`
- `pedidosEntregados`

- **No migrar todavía**
  - `pedidosPendientes`
  - `pedidosReparto`
  - `pedidosEnCamino`

## Gate hacia K3

K3 solo puede iniciar si:

- todos los campos críticos de la cola operativa están clasificados;
- no existen campos críticos marcados como `Faltante`;
- las diferencias restantes están aprobadas y documentadas.

## Veredicto formal actualizado

K2 está sustancialmente completado, pero el gate de salida aun no esta completamente satisfecho.

La razón no son los campos estructurales principales, sino las estructuras operativas internas de Cocina:

- `pedidosPendientes`
- `pedidosReparto`
- `pedidosEnCamino`

Estas estructuras siguen siendo alimentadas por RTDB y todavía no existe una equivalencia funcional demostrada que permita reconstruir toda la cola operativa solo desde `active_orders`.

### Campos ya demostrados como base sólida

| Campo | Estado |
|---|---|
| ID | ✅ |
| Estado | ✅ |
| Comercio | ✅ |
| Cliente | ✅ |
| `shortId` | ✅ |

### Campos con base razonable pero aún en validación

- `createdAt`
- `direccion`
- `observaciones`
- `prioridad`

### Cierre pendiente de K2

Antes de abrir K3 debe validarse cómo se derivan funcionalmente:

- `pedidosPendientes`
- `pedidosReparto`
- `pedidosEnCamino`
- `pedidosEntregados`

desde `active_orders`, sin depender de RTDB.

## K2.1 - Operational View Equivalence

Esta validación puente no es un nuevo proyecto. Es el cierre natural de K2.

### Objetivo

Demostrar que la vista operativa de Cocina puede reconstruirse desde `active_orders`.

### Pregunta a responder

¿Puede el render principal construirse únicamente a partir de `active_orders`, sin depender de estructuras internas alimentadas por RTDB?

### Resultado esperado

| Vista Cocina | Fuente RTDB actual | Regla desde `active_orders` | Estado |
|---|---|---|---|
| Pendientes | `kitchenState.orders.pedidosPendientes` | Por definir | Pendiente |
| Reparto | `kitchenState.orders.pedidosReparto` | Por definir | Pendiente |
| En camino | `kitchenState.orders.pedidosEnCamino` | Por definir | Pendiente |
| Entregados | `kitchenState.orders.pedidosEntregados` | Por definir | Pendiente |

## Gate definitivo hacia K3

K3 podrá iniciar únicamente cuando pueda afirmarse:

> Toda la cola operativa de Cocina puede derivarse funcionalmente de `active_orders`, sin depender de estructuras internas alimentadas por RTDB.

## Estado final del frente

- K1: cerrado
- K2: 95% completado
- K2.1: pendiente
- K3: bloqueado
- K4: pendiente
- K5: pendiente

## No alcance

- No se elimina ningún listener.
- No se cambia ninguna tarjeta o vista.
- No se toca `DataAccessService`.
- No se modifica el comportamiento certificado de Cocina.

## Relación

- [`POST_NAE_001_KITCHEN_INTEGRATION.md`](./POST_NAE_001_KITCHEN_INTEGRATION.md)
- [`POST_NAE_001_KITCHEN_INTEGRATION_EXECUTION.md`](./POST_NAE_001_KITCHEN_INTEGRATION_EXECUTION.md)
- [`POST_NAE_001_KITCHEN_INTEGRATION_K1_INVENTORY.md`](./POST_NAE_001_KITCHEN_INTEGRATION_K1_INVENTORY.md)

## Historial de cambios

- 2026-07-30: se abre K2 como fase de equivalencia previa a cualquier migración.
