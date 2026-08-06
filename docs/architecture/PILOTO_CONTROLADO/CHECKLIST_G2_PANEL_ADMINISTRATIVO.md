# Checklist ultracorta - G2 Panel Administrativo

## Objetivo

Usar esta lista de campo para validar rapidamente el Panel Administrativo antes de certificarlo.

## Lista

- [ ] Abre el panel sin fallas bloqueantes.
- [ ] El selector muestra solo comercios reales activos.
- [ ] No existe fallback sintetico.
- [ ] El pedido manual se crea con comercio real.
- [ ] RTDB guarda el contrato completo.
- [ ] Lista y detalle muestran el mismo pedido.
- [ ] El folio coincide en todas las vistas.
- [ ] `requestId` y `traceId` quedan registrados.

## Regla

Si algun punto falla, el gate no se cierra y solo se corrige la capa responsable.
