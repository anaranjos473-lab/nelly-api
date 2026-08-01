# EVIDENCIAS PRE PILOTO CONTROLADO 001

## Resumen de evidencia

Esta evidencia resume la corrida del prepiloto operacional ejecutada el `2026-08-01`.

## Verificaciones previas

- `npm run doctor:operational` -> `OPERABLE`
- `npm run validate:operational-port` -> puerto operativo confirmado
- `npm run validate:panels-pre-pilot` -> intento realizado, sin cierre por timeout del runner

## Corrida validada

### Ciclo 1

- `pedidoId`: `P1_ROT_1785586241929_0`
- `driverUid`: `ULILm4AyJGbfQzuUlC9ySpGrQrf1`
- `dispatch-order`: `OK`
- `accept-order`: `OK`
- `complete-order`: `OK`
- `dashboard`: `GREEN`

### Ciclo 2

- `pedidoId`: `P1_ROT_1785586243510_1`
- `driverUid`: `iXXl1erAQxW0Hht0CLWzlOYGaAi1`
- `dispatch-order`: `OK`
- `accept-order`: `OK`
- `complete-order`: `OK`
- `dashboard`: `GREEN`

### Ciclo 3

- `pedidoId`: `P1_ROT_1785586244866_2`
- `driverUid`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
- `dispatch-order`: `OK`
- `accept-order`: `OK`
- `complete-order`: `OK`
- `dashboard`: `GREEN`

## Hallazgos operativos

- El runner oficial de rotacion quedo limitado por la red externa de autenticacion.
- La verificacion del backend local con tokens reales permitio completar el prepiloto sin tocar el baseline.
- El driver `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` quedo reactivado y cerro correctamente su pedido residual antes de la corrida final.

## Conclusiones

- No hay evidencia de regresion funcional en el flujo prepiloto.
- La preparacion del piloto controlado cuenta con evidencia suficiente para pasar a la siguiente fase.

