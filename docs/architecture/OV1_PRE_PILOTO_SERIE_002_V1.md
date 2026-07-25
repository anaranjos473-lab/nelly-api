# OV1 PRE PILOTO SERIE 002 V1

**Estado:** Aprobada  
**Ambito:** Gate pre piloto OV1  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`  
**Fecha:** 2026-07-25

## 1. Objetivo

Repetir la serie pre piloto sobre el puerto operativo oficial `3001`, evitando el uso de puertos alternos y confirmando que el backend activo corre el codigo vigente.

## 2. Preparacion del puerto operativo

Antes de la serie se detecto que el proceso anterior de `3001` llevaba vivo desde antes de los cambios recientes. Para estabilizar la operacion diaria se aplicaron estas acciones:

- se detuvo el proceso viejo que escuchaba en `3001`;
- se levanto una instancia nueva en el mismo puerto `3001`;
- `/api/health` ahora expone `pid`, `runtime_started_at` y `port`;
- se agrego `scripts/validation/validate-operational-port.js`;
- se agrego `npm run validate:operational-port`.

La validacion del puerto operativo exige:

- health correcto;
- snapshot autenticado correcto;
- dashboard operativo en `ok`;
- RTDB, ledger y finanzas saludables;
- tiempo promedio de entrega dentro de rango operativo;
- Q1 visible como `operational_quality`;
- C4 con oportunidades y acciones;
- C5 con promociones sugeridas.

## 3. Preparacion de deuda

Para esta corrida controlada, los tres repartidores piloto se dejaron con deuda controlada antes de iniciar:

| Driver | Deuda | Limite | Bloqueado |
| --- | ---: | ---: | --- |
| `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | 0 | 300 | No |
| `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | 0 | 300 | No |
| `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | 0 | 300 | No |

Esta accion corresponde a preparacion controlada de repartidores de prueba. En operacion diaria, el manejo de deuda debe realizarse mediante liquidacion/desbloqueo operativo trazable.

## 4. Resultado de la serie

| Indicador | Resultado |
| --- | --- |
| Puerto operativo | `3001` |
| Ciclos solicitados | 20 |
| Ciclos completados | 20 |
| Errores | 0 |
| Dispatch OK | 20/20 |
| Accept OK | 20/20 |
| Complete OK | 20/20 |
| Dashboard OK | 20/20 |
| Backend OK | 20/20 |
| Finanzas OK | 20/20 |
| Dashboard status | `GREEN` en todos los ciclos |

## 5. Pedidos ejecutados

| Ciclo | Pedido | Driver | Resultado |
| --- | --- | --- | --- |
| 1 | `P1_ROT_1784966010844_0` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 2 | `P1_ROT_1784966012066_1` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 3 | `P1_ROT_1784966013229_2` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 4 | `P1_ROT_1784966014347_3` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 5 | `P1_ROT_1784966015481_4` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 6 | `P1_ROT_1784966016813_5` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 7 | `P1_ROT_1784966017913_6` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 8 | `P1_ROT_1784966018995_7` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 9 | `P1_ROT_1784966020142_8` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 10 | `P1_ROT_1784966021244_9` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 11 | `P1_ROT_1784966022324_10` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 12 | `P1_ROT_1784966023412_11` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 13 | `P1_ROT_1784966024518_12` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 14 | `P1_ROT_1784966025594_13` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 15 | `P1_ROT_1784966026692_14` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 16 | `P1_ROT_1784966027797_15` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 17 | `P1_ROT_1784966028828_16` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 18 | `P1_ROT_1784966029930_17` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 19 | `P1_ROT_1784966031001_18` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 20 | `P1_ROT_1784966032083_19` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |

## 6. Validacion final del puerto operativo

Despues de la serie se ejecuto `validate-operational-port` contra `http://127.0.0.1:3001`.

| Indicador | Valor |
| --- | ---: |
| Snapshot OK | Si |
| Pedidos activos | 0 |
| Entregas hoy | 39 |
| Tiempo promedio de entrega | 1.2 min |
| Entregas puntuales | 98.8% |
| C4 oportunidades | 5 |
| C4 acciones | 5 |
| C5 promociones | 5 |
| Q1 signal | `calidad_operativa_con_incidencias` |
| Q1 incidencias | 1 |
| Q1 causas raiz | 1 |
| Q1 merma estimada | 20 |
| Q1 acciones correctivas | 1 |

## 7. Dictamen

La Serie 002 aprueba el gate tecnico-operativo minimo previo al piloto:

- `3001` quedo como puerto operativo estable;
- ya no fue necesario cambiar de puerto para validar;
- el backend activo expone identificadores de proceso y arranque;
- la serie completo 20 ciclos en verde;
- C4, C5 y Q1 permanecieron visibles y estables despues de la carga;
- no quedaron pedidos activos ni errores criticos abiertos.

## 8. Recomendacion operativa

Antes de cada jornada de piloto se debe ejecutar:

```bash
npm run validate:operational-port
```

Si esta validacion falla, no se debe iniciar la operacion hasta reiniciar o corregir el backend activo en `3001`.

## 9. Historial

- 2026-07-25: Se ejecuta Serie 002 con puerto 3001 estabilizado y 20 ciclos completos en verde.
