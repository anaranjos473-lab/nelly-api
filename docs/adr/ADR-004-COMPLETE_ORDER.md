# ADR-004: Complete Order Contract

## Estado

Activo

## Contexto

El cierre de entrega debe dejar la persistencia en estado consistente y limpia.

## Decisión

- `complete-order` siempre termina en `ENTREGADO`.
- Limpia `pedido_activo`.
- Elimina `pedidos_en_camino`.
- Elimina `pedidos_para_reparto`.

## Consecuencias

- Android no debe inventar el cierre.
- Los campos extendidos no alteran el contrato base.

