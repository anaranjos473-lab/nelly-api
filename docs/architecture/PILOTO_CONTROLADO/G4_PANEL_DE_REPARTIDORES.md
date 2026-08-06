# G4 - Panel de Repartidores

## Objetivo

Certificar que el Panel de Repartidores consume correctamente el pool de pedidos, permite la aceptacion operativa, mantiene el pedido activo del conductor y respeta la cadena `LISTO -> EN_CURSO -> ENTREGADO` sin duplicidades ni estados inventados.

## Baseline de referencia

- `pilot-certified-v1`
- `GO_LIVE_CERTIFICATION_001`
- `G2_E2E_PANEL_ADMINISTRATIVO` aprobado
- `G3_PANEL_DE_COCINA` aprobado
- `market_v1/restaurantes` como fuente oficial de comercios

## Alcance

Este gate valida exclusivamente:

- carga de pedidos disponibles para reparto;
- visualizacion correcta de folio, comercio, cliente y estado operativo;
- aceptacion de un pedido por un repartidor elegible;
- creacion de `repartidores/{uid}/pedido_activo`;
- movimiento a `pedidos_en_camino`;
- coherencia visual del panel de repartidores y/o vista logistica;
- manejo basico de errores y pedidos no disponibles.

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

## Secuencia obligatoria

### 1. Carga de pedidos disponibles

Verificar que el panel muestra solo pedidos listos para reparto.

### 2. Visualizacion

Confirmar que el pedido muestra:

- comercio real;
- cliente;
- folio;
- estado listo para aceptacion;
- sin datos sinteticos.

### 3. Aceptacion del pedido

Ejecutar la aceptacion por un repartidor elegible.

Validar:

- el pedido cambia a `EN_CURSO`;
- `repartidores/{uid}/pedido_activo` se crea;
- `pedidos_en_camino/{pedidoId}` se crea;
- `pedidos_para_reparto/{pedidoId}` se limpia;
- no se pierde el contrato.

### 4. Casos operativos

Probar al menos:

- pedido ya tomado por otro repartidor;
- pedido no disponible;
- repartidor sin elegibilidad;
- reintento de aceptacion.

### 5. Evidencia

Registrar:

- captura del panel de repartidores;
- captura antes y despues de aceptar;
- snapshot RTDB;
- contenido de `pedidos_en_camino`;
- `repartidores/{uid}/pedido_activo`;
- `requestId`;
- `traceId`.

## Criterio de aprobacion

El `G4` solo se aprueba si:

- el panel carga correctamente;
- los pedidos mostrados corresponden al contrato real;
- la aceptacion funciona una sola vez para un pedido elegible;
- el pedido aparece en `pedidos_en_camino`;
- `repartidores/{uid}/pedido_activo` queda asignado;
- no hay fallbacks sintenticos ni duplicidades visibles;
- la vista de repartidores mantiene el contrato intacto.

## Criterio de rechazo

El gate se rechaza si aparece cualquiera de estos casos:

- pedidos historicos mezclados con operacion real;
- folio inconsistente;
- pedido aceptado por dos repartidores;
- `pedidos_en_camino` no recibe el pedido;
- `pedido_activo` no se crea o queda inconsistente;
- divergencia entre RTDB, panel y logistica.

## Evidencia requerida

- captura inicial del panel de repartidores;
- captura despues de aceptar un pedido;
- snapshot RTDB del pedido;
- snapshot de `pedidos_en_camino`;
- snapshot de `repartidores/{uid}/pedido_activo`;
- logs relevantes del panel;
- `requestId`;
- `traceId`.

## Estado actual

**Estado del gate G4:** `OPEN`

## Siguiente paso

Ejecutar una corrida controlada de reparto sobre un pedido listo y documentar el resultado.

## Referencias

- [`ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md`](./ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md)
- [`CHECKLIST_G4_PANEL_DE_REPARTIDORES.md`](./CHECKLIST_G4_PANEL_DE_REPARTIDORES.md)
