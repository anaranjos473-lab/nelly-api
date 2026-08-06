# CHECKLIST ULTRACORTA - GATE E2E-001

## Antes de empezar

- [ ] Backend correcto levantado.
- [ ] Panel actualizado.
- [ ] `PIZZERIA MIA` activo.
- [ ] Sin cambios locales extra.

## Crear pedido

- [ ] Crear un pedido nuevo.
- [ ] Registrar `requestId`.
- [ ] Registrar `traceId`.
- [ ] Registrar `pedidoId`.
- [ ] Registrar `shortId`.

## Validar datos

- [ ] RTDB tiene `comercio_id`.
- [ ] RTDB tiene `comercio_codigo`.
- [ ] RTDB tiene `comercio_nombre`.
- [ ] RTDB tiene `descripcion`.
- [ ] RTDB tiene `notas`.
- [ ] RTDB tiene `folio`.
- [ ] RTDB tiene `shortId`.

## Flujo

- [ ] Cocina muestra `PIZZERIA MIA`.
- [ ] Cocina muestra notas.
- [ ] Pasa a `LISTO`.
- [ ] Pasa a `pedidos_para_reparto`.
- [ ] Pasa a `pedidos_en_camino`.
- [ ] Pasa a `EN_CURSO`.
- [ ] Pasa a `ENTREGADO`.
- [ ] Sale de activos.

## Cierre

- [ ] Histórico conserva todos los campos.
- [ ] Guardar capturas.
- [ ] Guardar logs `TRACE_IN`, `TRACE_COMMERCE`, `TRACE_OUT`.

