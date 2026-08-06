# G3 - Panel de Cocina

## Objetivo

Certificar que el Panel de Cocina opera de forma consistente con el contrato del pedido, la maquina de estados y la publicacion hacia reparto, sin inventar estados ni reutilizar memoria obsoleta.

## Baseline de referencia

- `pilot-certified-v1`
- `GO_LIVE_CERTIFICATION_001`
- `G2_E2E_PANEL_ADMINISTRATIVO` aprobado
- `market_v1/restaurantes` como fuente oficial de comercios

## Alcance

Este gate valida exclusivamente:

- carga de pedidos activos en Cocina;
- visualizacion correcta de cliente, comercio, folio, notas y descripcion;
- transicion a `LISTO`;
- publicacion a `pedidos_para_reparto`;
- transicion visual a `ESPERANDO REPARTIDOR`;
- manejo basico de errores y estados no validos.

## Campos y comportamientos a certificar

- `comercio_id`
- `comercio_codigo`
- `comercio_nombre`
- `descripcion`
- `notas`
- `shortId`
- `folio`
- `estado`
- `estado_pedido`
- `logistica.estado`
- `requestId`
- `traceId`

## Secuencia obligatoria

### 1. Carga de pedidos

Verificar que el panel de Cocina carga pedidos vigentes y no mezcla residuos historicos con operaciones reales.

### 2. Visualizacion

Confirmar que el pedido muestra:

- comercio real;
- cliente;
- folio;
- descripcion;
- notas;
- sin datos sinteticos.

### 3. MARCAR LISTO

Ejecutar la transicion de Cocina a `LISTO`.

Validar:

- el pedido cambia de estado;
- el boton cambia a estado informativo o queda inactivo;
- no se pierde el contrato;
- el pedido queda listo para reparto.

### 4. Publicacion a reparto

Confirmar que el pedido aparece en `pedidos_para_reparto`.

Validar:

- la salida de Cocina queda reflejada en el nodo esperado;
- el pedido deja de mostrarse como activo de preparacion;
- la vista cambia a `ESPERANDO REPARTIDOR` si aplica.

### 5. Casos operativos

Probar al menos:

- reintento de accion;
- pedido ya listo;
- pedido ya entregado;
- pedido no encontrado.

### 6. Evidencia

Registrar:

- captura del panel de Cocina;
- captura antes y despues de `MARCAR LISTO`;
- snapshot RTDB;
- contenido de `pedidos_para_reparto`;
- `requestId`;
- `traceId`.

## Criterio de aprobacion

El `G3` solo se aprueba si:

- el panel carga correctamente;
- los pedidos mostrados corresponden al contrato real;
- `MARCAR LISTO` funciona una sola vez y cambia el estado esperado;
- el pedido aparece en `pedidos_para_reparto`;
- no hay fallbacks sintenticos ni duplicidades visibles;
- la vista de Cocina mantiene el contrato intacto.

## Criterio de rechazo

El gate se rechaza si aparece cualquiera de estos casos:

- pedidos historicos mezclados con operacion real;
- folio inconsistente;
- error `Pedido no encontrado en cocina` en un caso valido;
- `pedidos_para_reparto` no recibe el pedido;
- el boton sigue ejecutando la misma accion despues de pasar a espera;
- divergencia entre RTDB, panel y logistica.

## Evidencia requerida

- captura inicial de Cocina;
- captura despues de `MARCAR LISTO`;
- snapshot RTDB del pedido;
- snapshot de `pedidos_para_reparto`;
- captura de la cola de cocina;
- logs relevantes del panel;
- `requestId`;
- `traceId`.

## Siguiente paso

Si el gate aprueba:

1. registrar el resultado;
2. congelar el comportamiento validado de Cocina;
3. actualizar el roadmap de certificacion;
4. abrir G4 - Panel de Repartidores.

## Referencias

- [`ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md`](./ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md)
- [`CHECKLIST_G3_PANEL_DE_COCINA.md`](./CHECKLIST_G3_PANEL_DE_COCINA.md)
