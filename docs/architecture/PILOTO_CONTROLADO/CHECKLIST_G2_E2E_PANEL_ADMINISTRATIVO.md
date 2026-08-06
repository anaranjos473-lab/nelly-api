# Checklist ultracorta - G2-E2E Panel Administrativo

## Objetivo

Usar esta lista de campo para certificar el Panel Administrativo con un pedido real.

## Lista

- [ ] El panel abre sin fallas bloqueantes.
- [ ] El selector muestra solo comercios reales.
- [ ] Se crea un pedido manual.
- [ ] El formulario valida campos obligatorios.
- [ ] RTDB guarda comercio, notas, descripcion y folio.
- [ ] Lista y detalle coinciden.
- [ ] El folio coincide en todas las vistas.
- [ ] `requestId` y `traceId` quedan registrados.
- [ ] No aparece fallback sintetico.

## Regla

Si algun punto falla, G2-E2E no se cierra y solo se corrige la capa responsable.
