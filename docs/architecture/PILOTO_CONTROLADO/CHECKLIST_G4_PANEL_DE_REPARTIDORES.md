# Checklist ultracorta - G4 Panel de Repartidores

## Objetivo

Usar esta lista de campo para certificar rapidamente el Panel de Repartidores.

## Lista

- [ ] El panel de Repartidores abre sin fallas bloqueantes.
- [ ] Los pedidos visibles son reales y listos para reparto.
- [ ] El pedido muestra comercio, cliente, folio y estado correcto.
- [ ] Un repartidor elegible puede aceptar el pedido.
- [ ] El pedido pasa a `EN_CURSO`.
- [ ] `repartidores/{uid}/pedido_activo` queda asignado.
- [ ] El pedido aparece en `pedidos_en_camino`.
- [ ] `requestId` y `traceId` quedan registrados.

## Regla

Si algun punto falla, G4 no se cierra y solo se corrige la capa responsable.
