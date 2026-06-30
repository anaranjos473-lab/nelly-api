# CHECKPOINT C3.1 – Contrato Backend ↔ Driver

## Objetivo
Confirmar si el estado que consume el Driver realmente llega a LISTO cuando Cocina despacha un pedido.

## Pedido utilizado
PED_1782639607602

## Evidencia registrada
Para el pedido verificado en RTDB se observó:

- `pedidos/PED_1782639607602/estado` = `ENTREGADO`
- `pedidos/PED_1782639607602/estado_pedido` = `ENTREGADO`
- `pedidos/PED_1782639607602/fase_panel` = `Despacho`
- `pedidos_para_reparto/PED_1782639607602` = `null`
- `pedidos_en_camino/PED_1782639607602` = `null`

## Nota de interpretación
Este snapshot corresponde a un pedido ya completado, no a un pedido pendiente de aceptación. Por eso no demuestra un contrato roto en el momento de despacho; solo muestra limpieza histórica después del ciclo.

## Resultado esperado
Responder una sola pregunta:

> ¿El nodo `pedidos` llega realmente a `LISTO` cuando Cocina despacha?

## Validación
- [ ] `pedidos/{pedidoId}/estado` = `LISTO`
- [ ] `pedidos/{pedidoId}/estado_pedido` = `LISTO`
- [ ] `pedidos/{pedidoId}/logistica/estado` = `LISTO`
- [ ] `pedidos_para_reparto/{pedidoId}` existe y coincide con el estado esperado
- [ ] El Driver recibe ese estado sin alteraciones

## Conclusión
- [ ] Si `pedidos/{pedidoId}` llega a `LISTO`: Backend certificado y el problema queda aislado en Android.
- [ ] Si `pedidos/{pedidoId}` NO llega a `LISTO` pero `pedidos_para_reparto/{pedidoId}` sí lo hace: el contrato Backend ↔ Driver está roto y no se toca Android todavía.

## Próximo paso
- Ejecutar la validación RTDB para un Pedido C real.
- Documentar el resultado en este archivo.
- Hacer commit pequeño con evidencia cuando termine la verificación.
