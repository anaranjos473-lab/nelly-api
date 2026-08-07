# Checklist ultracorta - G5 Nelly Driver

## Objetivo

Certificar `Nelly Driver` como cliente operativo definitivo de repartidores.

## Lista de campo

- [ ] Inicio de sesion correcto.
- [ ] Perfil del repartidor cargado.
- [ ] Radar muestra pedidos validos.
- [ ] El pedido correcto muestra comercio, folio y cliente reales.
- [ ] Aceptacion cambia el pedido a `EN_CURSO`.
- [ ] `pedido_activo` queda asignado.
- [ ] `pedidos_en_camino` refleja la transicion.
- [ ] La ubicacion se actualiza sin romper el estado.
- [ ] La entrega limpia `pedido_activo` y conserva el historial.
- [ ] No hay duplicidades ni fallbacks sintenticos.

## Evidencia minima

- captura inicial;
- captura despues de aceptar;
- snapshot RTDB;
- `pedido_activo`;
- `pedidos_en_camino`;
- `requestId`;
- `traceId`.

## Bloques de certificacion

- [ ] Bloque A - Inicio de operacion
- [ ] Bloque B - Radar
- [ ] Bloque C - Aceptacion
- [ ] Bloque D - Pedido activo
- [ ] Bloque E - Evidencia
- [ ] Bloque F - GPS
- [ ] Bloque G - Entrega

## Criterio

Si algun punto falla, G5 no se cierra y solo se corrige la capa responsable.
