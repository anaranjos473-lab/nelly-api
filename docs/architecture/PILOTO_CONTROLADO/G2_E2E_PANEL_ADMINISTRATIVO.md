# G2-E2E - Panel Administrativo

## Objetivo

Certificar funcionalmente el Panel Administrativo en su flujo real de operacion: carga, seleccion de comercio, creacion manual, persistencia, consistencia visual y manejo de errores.

## Baseline de referencia

- `pilot-certified-v1`
- `GO_LIVE_CERTIFICATION_001`
- `G2_PANEL_ADMINISTRATIVO`
- `market_v1/restaurantes` como fuente oficial de comercios

## Alcance

Este gate certifica exclusivamente:

- inicializacion del panel administrativo;
- seleccion de comercio activo real;
- creacion de pedido manual;
- validacion de formulario;
- persistencia en RTDB;
- consistencia entre formulario, lista, detalle y contrato;
- manejo de casos negativos basicos.

## Bloques de ejecucion

### Bloque A - Inicializacion

- [ ] El panel carga correctamente.
- [ ] El usuario autenticado tiene acceso.
- [ ] El panel muestra comercios activos.
- [ ] No hay errores bloqueantes en consola.

### Bloque B - Creacion manual

- [ ] Crear un pedido manual.
- [ ] Validar campos obligatorios.
- [ ] Validar comercio seleccionado.
- [ ] Validar coordenadas.
- [ ] Validar notas y descripcion.
- [ ] Validar persistencia en RTDB.

### Bloque C - Consistencia de datos

- [ ] Vista previa correcta.
- [ ] Folio correcto.
- [ ] Comercio correcto.
- [ ] Notas correctas.
- [ ] Descripcion correcta.
- [ ] `shortId` correcto.

### Bloque D - Casos negativos

- [ ] Comercio inexistente.
- [ ] Campos obligatorios vacios.
- [ ] Coordenadas invalidas.
- [ ] Reintento de envio.

### Bloque E - Evidencia

- [ ] Captura de inicializacion.
- [ ] Captura del selector de comercios.
- [ ] Captura del formulario antes de crear el pedido.
- [ ] Payload enviado.
- [ ] Snapshot RTDB del pedido.
- [ ] Captura de lista y detalle.
- [ ] `requestId`.
- [ ] `traceId`.

## Criterio de aprobacion

El `G2-E2E` solo se aprueba si:

- todos los bloques criticos pasan;
- no hay regresiones en el panel;
- el contrato del pedido permanece integro;
- el comercio real unico se mantiene como fuente de verdad;
- cada caso deja evidencia verificable.

## Criterio de rechazo

El gate se rechaza si aparece cualquiera de estos casos:

- fallback sintetico;
- comercio inventado;
- datos incompletos;
- divergencia entre formulario, RTDB y vista previa;
- errores bloqueantes de consola o red;
- inconsistencias entre lista y detalle.

## Siguiente paso

Si el gate aprueba:

1. registrar el resultado;
2. congelar el comportamiento validado del modulo;
3. actualizar el roadmap de certificacion;
4. abrir G3 - Panel de Cocina.

## Referencias

- [`G2_PANEL_ADMINISTRATIVO.md`](./G2_PANEL_ADMINISTRATIVO.md)
- [`CHECKLIST_G2_PANEL_ADMINISTRATIVO.md`](./CHECKLIST_G2_PANEL_ADMINISTRATIVO.md)
- [`G2_PANEL_ADMINISTRATIVO_EVIDENCIA.md`](./G2_PANEL_ADMINISTRATIVO_EVIDENCIA.md)
