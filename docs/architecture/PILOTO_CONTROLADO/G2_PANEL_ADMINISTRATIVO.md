# G2 - Panel Administrativo

## Objetivo

Certificar que el Panel Administrativo opera de forma consistente con la SSOT, el contrato del pedido y los flujos administrativos del piloto, sin fallbacks sintéticos ni lecturas ambiguas.

## Baseline de referencia

- `pilot-certified-v1`
- `GO_LIVE_CERTIFICATION_001`
- `pilot-support`
- `market_v1/restaurantes` como fuente oficial de comercios

## Alcance

Este gate valida exclusivamente:

- alta y consulta de comercios;
- alta y consulta de pedidos manuales;
- consistencia visual entre formulario, lista y detalle;
- uso de comercio real activo;
- respeto al contrato del pedido;
- ausencia de datos sintéticos o duplicados visuales.

## Hipotesis de certificacion

El panel debe reflejar fielmente la SSOT y no inventar entidades, comercios ni folios. Cualquier pedido mostrado debe corresponder a un registro real persistido por el backend.

## Campos y comportamientos a certificar

- `comercio_id`
- `comercio_codigo`
- `comercio_nombre`
- `descripcion`
- `notas`
- `shortId`
- `folio`
- `estado`
- `requestId`
- `traceId`

## Secuencia obligatoria

### 1. Carga del panel

Verificar que el panel administrativo abre correctamente y que no hay fallback sintetico activo.

### 2. Comercio activo

Validar que el selector de comercio usa solo comercios reales activos desde `market_v1/restaurantes`.

### 3. Creacion manual

Crear un pedido manual y verificar que el formulario envia el comercio correcto, las notas y la descripcion esperadas.

### 4. Persistencia

Comprobar que RTDB guarda el pedido con contrato completo.

### 5. Consistencia visual

Confirmar que lista, detalle y resumen muestran el mismo pedido, el mismo comercio y el mismo folio.

### 6. Flujo operativo

Si el panel dispara acciones operativas, validar que no rompe el contrato del pedido ni su identificador.

## Criterio de aprobacion

El `G2` solo se aprueba si:

- el panel carga sin fallas bloqueantes;
- el selector muestra solo comercios reales;
- el pedido manual nace con contrato completo;
- no aparece `COMERCIO-*` sintetico como sustituto;
- la vista de lista y detalle coinciden;
- el panel respeta el contrato del backend.

## Criterio de rechazo

El gate se rechaza si aparece cualquiera de estos casos:

- fallback sintetico;
- comercio inexistente o inventado;
- folio inconsistente entre lista y detalle;
- datos incompletos en RTDB;
- divergencia entre formulario, contrato y panel;
- errores de consola o red que bloqueen el uso administrativo.

## Evidencia requerida

- captura del panel administrativo;
- captura del selector de comercios;
- captura del formulario antes de crear el pedido;
- payload enviado;
- snapshot RTDB del pedido;
- `requestId`;
- `traceId`;
- captura de lista y detalle del pedido.

## Siguiente paso

Una vez aprobado este gate:

1. registrar el resultado;
2. actualizar el roadmap de certificacion;
3. congelar el comportamiento validado;
4. abrir el siguiente gate del roadmap.

## Referencias

- [`ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md`](./ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md)
- [`CHECKLIST_G2_PANEL_ADMINISTRATIVO.md`](./CHECKLIST_G2_PANEL_ADMINISTRATIVO.md)
