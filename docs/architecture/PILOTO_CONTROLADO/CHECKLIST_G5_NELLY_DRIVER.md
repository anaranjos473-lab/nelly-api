# Checklist ultracorta - G5 Nelly Driver

## Objetivo

Certificar `Nelly Driver` como cliente operativo definitivo de repartidores.

## Lista de campo

- [ ] La app abre correctamente.
- [ ] El repartidor ve pedidos elegibles.
- [ ] El pedido correcto muestra comercio, folio y cliente reales.
- [ ] La aceptacion cambia el pedido a `EN_CURSO`.
- [ ] `pedido_activo` queda asignado al conductor.
- [ ] `pedidos_en_camino` refleja la transicion.
- [ ] La ubicacion se actualiza sin romper el estado.
- [ ] La entrega libera el pedido correctamente.
- [ ] No aparecen duplicidades ni fallbacks sintenticos.

## Evidencia minima

- captura inicial;
- captura despues de aceptar;
- snapshot RTDB;
- `pedido_activo`;
- `pedidos_en_camino`;
- `requestId`;
- `traceId`.

## Criterio

Si algun punto falla, G5 no se cierra y solo se corrige la capa responsable.
