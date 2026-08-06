# Checklist ultracorta - G3 Panel de Cocina

## Objetivo

Usar esta lista de campo para certificar rapidamente el Panel de Cocina.

## Lista

- [ ] El panel de Cocina abre sin fallas bloqueantes.
- [ ] Los pedidos visibles son reales y vigentes.
- [ ] El pedido muestra comercio, cliente, folio, descripcion y notas.
- [ ] `MARCAR LISTO` cambia el estado correctamente.
- [ ] El pedido aparece en `pedidos_para_reparto`.
- [ ] La vista pasa a `ESPERANDO REPARTIDOR` o equivalente informativo.
- [ ] El boton no repite la misma transicion.
- [ ] `requestId` y `traceId` quedan registrados.

## Regla

Si algun punto falla, G3 no se cierra y solo se corrige la capa responsable.
