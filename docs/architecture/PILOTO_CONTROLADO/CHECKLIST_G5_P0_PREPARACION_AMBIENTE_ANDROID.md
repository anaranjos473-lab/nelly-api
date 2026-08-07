# Checklist ultracorta - G5-P0 Preparacion del ambiente Android

## Objetivo

Dejar el ambiente de `Nelly Driver` limpio antes de certificar `G5`.

## Lista de campo

- [ ] El conductor de prueba no tiene `pedido_activo`.
- [ ] No hay `pedidos_en_camino` del conductor de prueba.
- [ ] No hay `pedidos_para_reparto` residuales.
- [ ] La app no muestra misiones pendientes viejas.
- [ ] GPS activo.
- [ ] Storage disponible.
- [ ] Maps funcional.
- [ ] El conductor autenticado es el correcto.

## Evidencia minima

- captura inicial;
- snapshot RTDB;
- `requestId`;
- `traceId`.

## Criterio

Si algun punto falla, `G5` no inicia.
