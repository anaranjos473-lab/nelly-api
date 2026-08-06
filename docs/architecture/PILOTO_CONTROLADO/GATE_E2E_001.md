# Gate E2E-001 - Certificacion final del flujo manual

## Objetivo

Certificar que el flujo manual permanece integro desde la creacion del pedido hasta el historico, sin perdida de datos ni regresiones de estado.

## Baseline de referencia

- `GO_LIVE_CERTIFICATION_001`
- `pilot-support`
- `PIZZERIA MIA` como comercio real activo

## Alcance

Este gate valida exclusivamente:

- alta del pedido manual;
- persistencia de identidad comercial;
- persistencia de notas y descripcion;
- transiciones de Cocina;
- transiciones de Reparto;
- cierre en `ENTREGADO`;
- conservacion de datos en historico.

## Campos obligatorios a certificar

En todo el ciclo deben mantenerse visibles y persistidos:

- `comercio_id`
- `comercio_codigo`
- `comercio_nombre`
- `descripcion`
- `notas`
- `shortId`
- `folio`

## Secuencia obligatoria

### 1. Creacion

Crear un pedido nuevo y registrar:

- `pedidoId`
- `requestId`
- `traceId`
- `shortId`
- `folio`

Verificar en RTDB que el pedido nazca con:

- `comercio_id`
- `comercio_codigo`
- `comercio_nombre`
- `descripcion`
- `notas`
- `shortId`
- `folio`

### 2. Cocina

Confirmar que el pedido se visualiza correctamente en Cocina.

Validar:

- comercio visible;
- notas visibles;
- descripcion visible;
- folio correcto;
- sin datos sinteticos o fallback.

### 3. LISTO

Ejecutar la transicion de Cocina a `LISTO`.

Validar:

- no se pierden campos;
- el pedido conserva la identidad comercial;
- el pedido sigue siendo el mismo registro.

### 4. EN_CURSO

Ejecutar la transicion a reparto / aceptacion.

Validar:

- `comercio_id` sigue presente;
- `comercio_codigo` sigue presente;
- `comercio_nombre` sigue presente;
- `descripcion` sigue presente;
- `notas` sigue presente;
- `shortId` sigue presente;
- `folio` sigue presente.

### 5. ENTREGADO

Completar el pedido.

Validar:

- estado final `ENTREGADO`;
- salida de `active_orders`;
- limpieza de `pedidos_para_reparto`;
- limpieza de `pedidos_en_camino`;
- limpieza de `pedido_activo`.

### 6. Historico

Verificar el registro historico del mismo pedido.

Debe conservar:

- `comercio_id`
- `comercio_codigo`
- `comercio_nombre`
- `descripcion`
- `notas`
- `shortId`
- `folio`

## Criterio de aprobacion

El `Gate E2E-001` solo se aprueba si:

- el pedido se crea correctamente;
- el contrato llega completo a RTDB;
- Cocina muestra el pedido con datos reales;
- la transicion por el flujo no elimina campos;
- el pedido finaliza en `ENTREGADO`;
- el historico conserva exactamente el mismo contrato funcional.

## Criterio de rechazo

El gate se rechaza si aparece cualquiera de estos casos:

- comercio sintetico o fallback;
- campo faltante en alguna etapa;
- `notes` o `notas` inconsistente;
- folio duplicado o regenerado;
- el pedido reaparece como activo tras recarga;
- el historico pierde informacion.

## Evidencia requerida

- `TRACE_IN`
- `TRACE_COMMERCE`
- `TRACE_OUT`
- payload de creacion
- snapshot RTDB en cada fase
- captura de Cocina
- captura de Reparto
- captura de Historico
- `requestId`
- `traceId`

## Siguiente paso

Una vez aprobado este gate:

1. eliminar trazas temporales;
2. hacer commit de limpieza;
3. congelar baseline;
4. emitir certificacion final del flujo manual.

## Referencias

- [`CHECKLIST_EJECUCION_GATE_E2E_001.md`](./CHECKLIST_EJECUCION_GATE_E2E_001.md)
- [`CHECKLIST_ULTRACORTA_GATE_E2E_001.md`](./CHECKLIST_ULTRACORTA_GATE_E2E_001.md)
- [`FORMATO_CAPTURA_EVIDENCIA_GATE_E2E_001.md`](./FORMATO_CAPTURA_EVIDENCIA_GATE_E2E_001.md)
- [`PLANTILLA_CIERRE_GATE_E2E_001.md`](./PLANTILLA_CIERRE_GATE_E2E_001.md)
- [`GO_LIVE_CERTIFICATION_001.md`](./GO_LIVE_CERTIFICATION_001.md)
