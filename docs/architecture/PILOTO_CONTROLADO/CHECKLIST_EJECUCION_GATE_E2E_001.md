# CHECKLIST DE EJECUCION - GATE E2E-001

## Objetivo

Certificar el flujo completo del pedido manual desde su creacion hasta el historico, preservando integro el contrato del pedido.

## Fase 0 - Preparacion

- [ ] Backend ejecutando la version correcta del baseline a certificar.
- [ ] Panel publicado y actualizado.
- [ ] Android actualizado, si participa en la prueba.
- [ ] `PIZZERIA MIA` activo en `market_v1/restaurantes`.
- [ ] No existen cambios locales pendientes distintos a la instrumentacion temporal.

### Resultado esperado

Baseline listo para certificar.

## Fase 1 - Crear un unico pedido

Crear un solo pedido con datos faciles de identificar.

Ejemplo:

- Cliente: `TEST E2E`
- Producto: `Pizza Familiar`
- Descripcion: `Pizza Familiar`
- Notas: `Sin cebolla`
- Referencia: `Porton negro`

### Identificadores de la ejecucion

- [ ] `requestId`
- [ ] `traceId`
- [ ] `pedidoId`
- [ ] `shortId`
- [ ] Hora de inicio

## Fase 2 - Validacion en RTDB

Confirmar que el pedido contiene:

- [ ] `comercio_id`
- [ ] `comercio_codigo`
- [ ] `comercio_nombre`
- [ ] `descripcion`
- [ ] `notas`
- [ ] `shortId`
- [ ] `folio`
- [ ] `estado = PENDIENTE`

### Criterio

Ningun campo obligatorio ausente.

## Fase 3 - Cocina

Abrir el pedido.

Verificar:

- [ ] Se muestra `PIZZERIA MIA`.
- [ ] Las notas son visibles.
- [ ] La descripcion corresponde al pedido.
- [ ] El folio coincide con RTDB.

Cambiar a:

- [ ] `LISTO`

## Fase 4 - Reparto

Validar:

- [ ] El pedido aparece en `pedidos_para_reparto`.
- [ ] Se acepta correctamente.
- [ ] Desaparece de `pedidos_para_reparto`.
- [ ] Aparece en `pedidos_en_camino`.
- [ ] Estado = `EN_CURSO`.
- [ ] Conserva `comercio_id`.
- [ ] Conserva `comercio_codigo`.
- [ ] Conserva `comercio_nombre`.
- [ ] Conserva `descripcion`.
- [ ] Conserva `notas`.
- [ ] Conserva `shortId`.
- [ ] Conserva `folio`.

## Fase 5 - Entrega

Completar la entrega.

Verificar:

- [ ] Estado = `ENTREGADO`.
- [ ] Sin errores.
- [ ] Sin perdida de informacion.

## Fase 6 - Historico

Abrir el pedido archivado.

Comparar con RTDB inicial.

Confirmar que siguen presentes:

- [ ] `comercio_id`
- [ ] `comercio_codigo`
- [ ] `comercio_nombre`
- [ ] `descripcion`
- [ ] `notas`
- [ ] `shortId`
- [ ] `folio`

### Criterio

El contrato del pedido permanece integro.

## Evidencia minima

Guardar:

- [ ] Captura del pedido en RTDB.
- [ ] Captura en Cocina.
- [ ] Captura en Reparto.
- [ ] Captura en Entregado.
- [ ] Captura en Historico.
- [ ] Logs de `TRACE_IN`, `TRACE_COMMERCE` y `TRACE_OUT` solo para esta certificacion.

## Criterio de aprobacion

El Gate aprueba unicamente si:

- todos los campos obligatorios permanecen intactos desde la creacion hasta el historico;
- no hay perdida de datos;
- no aparecen regresiones funcionales;
- no se utilizan fallbacks ni valores sinteticos.

## Acciones posteriores, solo si aprueba

- [ ] Eliminar `TRACE_IN`.
- [ ] Eliminar `TRACE_COMMERCE`.
- [ ] Eliminar `TRACE_OUT`.
- [ ] Commit exclusivo de limpieza.
- [ ] Actualizar `GO_LIVE_CERTIFICATION_001`.
- [ ] Emitir la certificacion formal del Baseline Piloto V1.
- [ ] Congelar el baseline y abrir unicamente incidencias o nuevas funcionalidades mediante cambios controlados.

## Politica de evidencia

Ningun Gate puede marcarse como `Aprobado` unicamente por observacion manual. Cada criterio de aceptacion debe estar respaldado por al menos una evidencia verificable:

- captura;
- log;
- JSON de RTDB;
- registro de ejecucion.

## Regla de gobierno

- Rama `pilot-support`: solo correcciones criticas y certificadas.
- Rama `main`: solo recibe cambios que ya pasaron por un Gate de certificacion.
- Toda nueva funcionalidad debe desarrollarse en una rama independiente y demostrar evidencia antes de fusionarse.

## Referencias

- [`GATE_E2E_001.md`](./GATE_E2E_001.md)
- [`GO_LIVE_CERTIFICATION_001.md`](./GO_LIVE_CERTIFICATION_001.md)

