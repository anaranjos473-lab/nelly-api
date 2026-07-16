# Certificación P17 — Ganancias del repartidor

## Estado

✅ CERRADO Y VALIDADO EN PRODUCCIÓN

## Objetivo

Corregir el problema por el cual la ganancia diaria del repartidor (`ganancia_hoy`) permanecía en `0` después de completar una entrega.

## Evidencia de certificación

Se ejecutó una entrega completa en producción y se verificó que:

- El pedido finalizó en estado `ENTREGADO`.
- Se registró la ganancia neta del pedido.
- Se actualizó el saldo financiero del repartidor.
- `ganancia_hoy` mostró un valor distinto de cero.

## Valores observados

- `ganancia_hoy`: `66`
- `saldo_ganancias`: `365.75`

## Resultado

La evidencia confirma que el defecto corregido por P17 ya no se reproduce. El backend calcula y registra correctamente las ganancias del repartidor al finalizar una entrega.

## Estado consolidado del proyecto

| Componente | Estado |
| --- | --- |
| P12 | ✅ Estable |
| P13 | ✅ Estable |
| P14 | ✅ Cerrado |
| P14.1 | ✅ Cerrado |
| Backend E2E | ✅ Certificado |
| P17 | ✅ Cerrado y validado en producción |

## Línea base recomendada

Esta versión puede tomarse como baseline estable para continuar el desarrollo.

Los siguientes trabajos deberían centrarse en:

- Validación visual del Radar.
- Preparación de la versión candidata para publicación.
- Incorporación de nuevas funcionalidades sin modificar los componentes ya certificados, salvo que aparezca un defecto reproducible.

Este documento constituye una referencia para futuras regresiones: si reaparece un problema relacionado con las ganancias del repartidor, podrá compararse contra esta versión certificada.
