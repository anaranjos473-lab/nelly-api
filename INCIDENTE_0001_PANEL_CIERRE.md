# INCIDENTE 0001: Panel de Cocina permite intento de cierre en pedidos LISTO

## Descripción
El panel de cocina presentó un comportamiento engañoso al mostrar pedidos en estado `LISTO` con una acción de cierre/entrega que el usuario podía intentar ejecutar.

## Causa raíz
El frontend de `public/panel.html` no discriminaba correctamente el estado `LISTO` antes de habilitar la acción final.

El estado debía representarse como:
- `LISTO` → `ESPERANDO REPARTIDOR` (no se puede finalizar desde cocina)
- `EN_CURSO` → `ENTREGA COMPLETADA` (único caso válido para finalizar)

## Evidencia
- `PED_1783493823323` estaba en `pedidos_para_reparto`, no en `pedidos_en_camino`.
- El backend devolvía correctamente `409` al intentar finalizar un pedido aún en `LISTO`.
- El bug era únicamente UX en el panel de cocina.

## Acción tomada
- Se modificó `public/panel.html` para:
  - mostrar `ESPERANDO REPARTIDOR` para pedidos con estado `LISTO`
  - deshabilitar el botón de acción en esos casos
  - mostrar alerta clara si el usuario intenta finalizar un pedido que no está `EN_CURSO`

## Recomendación
- Mantener la validación de estado del pedido en el frontend y en el backend.
- Revisar otros flujos UI que permitan acciones inválidas en estados intermedios.
