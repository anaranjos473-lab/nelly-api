# G5 - Nelly Driver

## Objetivo

Certificar la aplicacion Android `Nelly Driver` como cliente operativo definitivo de repartidores, consumiendo correctamente el flujo de reparto ya validado por `G4` y reflejando sin ambiguedades el estado operativo desde `LISTO` hasta `ENTREGADO`.

## Baseline de referencia

- `pilot-certified-v1`
- `GO_LIVE_CERTIFICATION_001`
- `G2_PANEL_ADMINISTRATIVO` aprobado
- `G3_PANEL_DE_COCINA` aprobado
- `G4` validado como cliente provisional de asignacion
- `panel de repartidores` restringido a soporte / diagnostico tras G5

## Alcance

Este gate valida exclusivamente `Nelly Driver` como cliente oficial de reparto:

- carga de pedidos disponibles;
- visualizacion del pedido correcto;
- aceptacion de un pedido elegible;
- sincronizacion de estado con backend;
- actualizacion de ubicacion;
- cierre operativo correcto;
- manejo basico de errores y reintentos.

## Campos y comportamientos a certificar

- `pedidoId`
- `shortId`
- `folio`
- `comercio_id`
- `comercio_codigo`
- `comercio_nombre`
- `estado`
- `estado_pedido`
- `logistica.estado`
- `repartidor_id`
- `driverUid`
- `requestId`
- `traceId`
- `pedido_activo`
- `pedidos_en_camino`

## Secuencia obligatoria

### 1. Carga inicial

Verificar que la app muestra pedidos elegibles y el estado real del conductor.

### 2. Visualizacion

Confirmar que el pedido muestra:

- comercio real;
- cliente;
- folio;
- estado disponible para aceptar;
- sin datos sinteticos.

### 3. Aceptacion

Ejecutar la aceptacion de un pedido elegible.

Validar:

- el pedido cambia a `EN_CURSO`;
- `pedido_activo` se crea para el conductor;
- `pedidos_en_camino/{pedidoId}` se mantiene o se crea segun corresponda;
- `pedidos_para_reparto/{pedidoId}` queda limpio;
- no se pierde el contrato.

### 4. Ubicacion y seguimiento

Probar al menos:

- actualizacion de ubicacion;
- continuidad de estado;
- reintento de red;
- salida y reingreso a la app.

### 5. Cierre

Completar la entrega y validar:

- `ENTREGADO`;
- liberacion de `pedido_activo`;
- contrato intacto;
- no duplicidades.

### 6. Evidencia

Registrar:

- captura de la app;
- captura antes y despues de aceptar;
- snapshot RTDB;
- `pedido_activo`;
- `pedidos_en_camino`;
- `requestId`;
- `traceId`.

## Criterio de aprobacion

El `G5` solo se aprueba si:

- la app carga correctamente;
- los pedidos mostrados corresponden al contrato real;
- la aceptacion funciona una sola vez para un pedido elegible;
- el pedido aparece en `pedidos_en_camino`;
- `pedido_activo` queda asignado;
- la ubicacion se sincroniza sin romper el estado;
- el cierre libera correctamente el pedido;
- no hay fallbacks sintenticos ni duplicidades visibles.

## Criterio de rechazo

El gate se rechaza si aparece cualquiera de estos casos:

- pedidos historicos mezclados con operacion real;
- pedido aceptado por dos conductores;
- `pedidos_en_camino` no refleja la transicion;
- `pedido_activo` no se crea o queda inconsistente;
- divergencia entre app, RTDB y backend;
- perdida de contrato durante la transicion.

## Evidencia requerida

- captura inicial de la app;
- captura despues de aceptar un pedido;
- snapshot RTDB del pedido;
- snapshot de `pedidos_en_camino`;
- snapshot de `pedido_activo`;
- logs relevantes del dispositivo;
- `requestId`;
- `traceId`.

## Estado actual

**Estado del gate G5:** `OPEN`

## Siguiente paso

Ejecutar una corrida controlada en `Nelly Driver` sobre un pedido listo y documentar el resultado.

## Referencias

- [`ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md`](./ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md)
- [`CHECKLIST_G5_NELLY_DRIVER.md`](./CHECKLIST_G5_NELLY_DRIVER.md)
