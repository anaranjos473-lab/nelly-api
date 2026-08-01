# INCIDENTE PANEL SHORTID - CERRADO

## Identificacion

| Campo | Valor |
|---|---|
| Codigo | `INCIDENTE_PANEL_SHORTID` |
| Estado | `CERRADO` |
| Fecha de cierre | `2026-08-01` |
| Area | `Panel de cocina` |

## Resumen

El panel mostraba el mensaje `Pedido no encontrado en cocina.` aun cuando el pedido era visible en la UI y estaba cargado en la cola operativa.

## Causa raiz

El frontend mostraba y enviaba `shortId` como identificador visible, pero `resolverKeyPedido()` no comparaba `shortId`, solo `id_pedido`, `id` y `pedido_id`.

## Correccion aplicada

- `resolverKeyPedido()` ahora compara `shortId`.
- Se centraliza la identidad de pedido en un helper comun para futuras rutas del panel.

## Evidencia

- El pedido existe en la UI.
- El boton usa el identificador visible.
- La busqueda interna ya acepta `shortId`.

## Impacto

- Solo frontend.
- Sin cambios de backend.
- Sin cambios de contrato.

## Riesgo residual

- Revisar que no existan `shortId` duplicados.
- Mantener la identidad del pedido unificada en el panel.

## Conclusiones

El incidente queda cerrado como un desacople de identidad en frontend, resuelto con un parche minimo y localizado.

