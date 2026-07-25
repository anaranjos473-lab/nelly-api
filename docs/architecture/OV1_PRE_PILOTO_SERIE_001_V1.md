# OV1 PRE PILOTO SERIE 001 V1

**Estado:** Ejecutada con observacion operativa  
**Ambito:** Gate pre piloto OV1  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`  
**Fecha:** 2026-07-25

## 1. Objetivo

Ejecutar una primera serie previa al piloto para validar estabilidad del flujo operativo, dashboards, C4, C5 y Q1 antes de invitar comercios reales.

## 2. Entorno

| Elemento | Valor |
| --- | --- |
| Backend inicial | `http://127.0.0.1:3001` |
| Backend fresco de verificacion | `http://127.0.0.1:3017` |
| Script de serie | `.codex-tmp/p1-rotation-3-drivers.mjs` |
| Ciclos solicitados | 20 |
| Repartidores | 3 pilotos rotados |
| Autenticacion | Firebase Auth |

## 3. Resultado de la serie

| Indicador | Resultado |
| --- | --- |
| Ciclos solicitados | 20 |
| Ciclos completados | 18 |
| Ciclos en verde | 18 |
| Primer bloqueo | Ciclo 19 |
| Motivo del bloqueo | `Limite de deuda alcanzado` |
| Dispatch OK | 18/18 |
| Accept OK | 18/18 |
| Complete OK | 18/18 |
| Dashboard OK | 18/18 |
| Backend OK | 18/18 |
| Finanzas OK | 18/18 |
| Dashboard status | `GREEN` en todos los ciclos completados |

## 4. Pedidos ejecutados

| Ciclo | Pedido | Driver | Resultado |
| --- | --- | --- | --- |
| 1 | `P1_ROT_1784965426370_0` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 2 | `P1_ROT_1784965427557_1` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 3 | `P1_ROT_1784965428645_2` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 4 | `P1_ROT_1784965429683_3` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 5 | `P1_ROT_1784965430764_4` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 6 | `P1_ROT_1784965431835_5` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 7 | `P1_ROT_1784965432863_6` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 8 | `P1_ROT_1784965434036_7` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 9 | `P1_ROT_1784965435138_8` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 10 | `P1_ROT_1784965436162_9` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 11 | `P1_ROT_1784965437231_10` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 12 | `P1_ROT_1784965438268_11` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 13 | `P1_ROT_1784965439309_12` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 14 | `P1_ROT_1784965440382_13` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 15 | `P1_ROT_1784965441435_14` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 16 | `P1_ROT_1784965442511_15` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 17 | `P1_ROT_1784965443741_16` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 18 | `P1_ROT_1784965444792_17` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 19 | No completado | Rotacion piloto | Bloqueado por deuda |

## 5. Observacion operativa: proceso viejo

Durante la verificacion posterior se detecto que el backend vivo en `3001` parecia estar ejecutando una version anterior del proceso:

- el snapshot mostro `tiempo_promedio_entrega = 1307.9`;
- Q1 no aparecio como `operational_quality`.

Al levantar una instancia fresca en `3017` con el codigo actual, el snapshot quedo alineado:

| Indicador | Valor |
| --- | ---: |
| Backend | OK |
| RTDB | OK |
| Sincronizacion | OK |
| Ledger | OK |
| Finanzas | OK |
| Pedidos activos | 0 |
| Entregas hoy | 19 |
| Tiempo promedio de entrega | 1.4 min |
| Entregas puntuales | 98.6% |
| C4 oportunidades | 5 |
| C4 acciones | 5 |
| C5 promociones | 5 |
| Q1 signal | `calidad_operativa_con_incidencias` |
| Q1 incidencias | 1 |
| Q1 causas raiz | 1 |
| Q1 merma estimada | 20 |
| Q1 acciones correctivas | 1 |

## 6. Dictamen

La serie confirma que:

- el flujo operativo puede repetirse de forma estable;
- los 18 ciclos completados terminaron en verde;
- el Dashboard Operativo se mantuvo saludable;
- finanzas y ledger respondieron correctamente;
- C4, C5 y Q1 quedan visibles cuando el backend corre el codigo vigente.

La serie no completa los 20 ciclos por una restriccion funcional esperada: `Limite de deuda alcanzado`.

## 7. Acciones antes del piloto

Antes de invitar comercios reales se debe:

- reiniciar o confirmar que el backend activo corre el codigo vigente;
- usar repartidores piloto con deuda controlada o liquidada;
- registrar deuda antes y despues de cada serie;
- repetir una serie OV1 hasta completar al menos 20 ciclos sin bloqueo operativo no planificado;
- mantener vigilancia sobre tiempo promedio de entrega, Q1 y C5.

## 8. Criterio de avance

El gate pre piloto permanece **en progreso** hasta ejecutar una serie completa de al menos 20 ciclos sin errores bloqueantes y sin interrupcion por deuda no gestionada.

## 9. Historial

- 2026-07-25: Se ejecuta Serie 001 con 18 ciclos en verde y bloqueo esperado por deuda en el ciclo 19.
