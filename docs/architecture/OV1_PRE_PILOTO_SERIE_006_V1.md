# OV1 PRE PILOTO SERIE 006 V1

**Estado:** Aprobada  
**Ambito:** Gate pre piloto OV1  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`  
**Fecha:** 2026-07-25

## 1. Objetivo

Repetir la disciplina operativa `Doctor -> OV1 -> Doctor` para confirmar estabilidad consecutiva antes del piloto comercial controlado.

## 2. Doctor operativo previo

Se ejecuto:

```bash
npm run doctor:operational
```

Resultado:

| Indicador | Resultado |
| --- | --- |
| Salud general | 100% |
| Severidad maxima | INFO |
| Dictamen | OPERABLE |
| Checks fallidos | 0 |

## 3. Preparacion de deuda

Antes de la corrida se saneo la deuda de los tres repartidores piloto.

| Driver | Deuda | Limite | Bloqueado |
| --- | ---: | ---: | --- |
| `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | 0 | 300 | No |
| `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | 0 | 300 | No |
| `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | 0 | 300 | No |

## 4. Serie OV1

Comando ejecutado:

```bash
$env:BASE_URL='http://127.0.0.1:3001'
$env:P1_CYCLES='20'
npm run ov1:rotation
```

Resultado:

| Indicador | Resultado |
| --- | ---: |
| Ciclos solicitados | 20 |
| Ciclos completados | 20 |
| Errores | 0 |
| Dashboard GREEN | 20 |
| Backend OK | 20 |
| Finanzas OK | 20 |
| Sign-in requests | 4 |
| Token reuses | 76 |
| Refresh after 401 | 0 |

Todos los ciclos completados tuvieron:

- `dispatchOk = true`;
- `acceptOk = true`;
- `completeOk = true`;
- `dashboardOk = true`;
- `dashboardStatus = GREEN`;
- `backendOk = true`;
- `financeOk = true`.

## 5. Pedidos de la serie

| Ciclo | Pedido | Driver | Resultado |
| --- | --- | --- | --- |
| 1 | `P1_ROT_1784969220814_0` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 2 | `P1_ROT_1784969222103_1` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 3 | `P1_ROT_1784969223073_2` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 4 | `P1_ROT_1784969223993_3` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 5 | `P1_ROT_1784969225084_4` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 6 | `P1_ROT_1784969225891_5` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 7 | `P1_ROT_1784969226716_6` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 8 | `P1_ROT_1784969227560_7` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 9 | `P1_ROT_1784969228367_8` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 10 | `P1_ROT_1784969229195_9` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 11 | `P1_ROT_1784969230060_10` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 12 | `P1_ROT_1784969230880_11` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 13 | `P1_ROT_1784969231693_12` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 14 | `P1_ROT_1784969232493_13` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 15 | `P1_ROT_1784969233335_14` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 16 | `P1_ROT_1784969234144_15` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 17 | `P1_ROT_1784969234945_16` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 18 | `P1_ROT_1784969235803_17` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 19 | `P1_ROT_1784969236626_18` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 20 | `P1_ROT_1784969237508_19` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |

## 6. Doctor operativo posterior

Se ejecuto:

```bash
npm run doctor:operational
```

Resultado:

| Indicador | Resultado |
| --- | --- |
| Salud general | 100% |
| Severidad maxima | INFO |
| Dictamen | OPERABLE |
| Checks fallidos | 0 |

## 7. Snapshot final

Se ejecuto:

```bash
npm run validate:operational-port
```

Resultado:

| Indicador | Valor |
| --- | ---: |
| Snapshot OK | Si |
| Base URL | `http://127.0.0.1:3001` |
| PID | 9356 |
| Runtime started at | `2026-07-25T07:50:21.639Z` |
| Pedidos activos | 0 |
| Entregas hoy | 122 |
| Tiempo promedio de entrega | 0.7 min |
| Entregas puntuales | 99.3% |
| C4 oportunidades | 5 |
| C4 acciones | 5 |
| C5 promociones | 5 |
| Q1 signal | `calidad_operativa_con_incidencias` |
| Q1 incidencias | 1 |
| Q1 causas raiz | 1 |
| Q1 merma estimada | 20 |
| Q1 acciones correctivas | 1 |

## 8. Dictamen

La Serie 006 confirma estabilidad consecutiva:

- Doctor previo en `OPERABLE`;
- 20 ciclos OV1 completos;
- cero errores;
- Doctor posterior en `OPERABLE`;
- pedidos activos en cero;
- C4, C5 y Q1 estables;
- puerto `3001` sin reinicio ni cambio.

## 9. Recomendacion

La disciplina `Doctor -> OV1 -> Doctor` ya muestra repetibilidad.

Antes de abrir un piloto comercial con usuarios externos, conviene ejecutar una ultima revision Go/No-Go que consolide:

- series 004, 005 y 006;
- estabilidad del puerto `3001`;
- estabilidad de C4, C5 y Q1;
- ausencia de errores criticos;
- criterio operativo para detener jornada si el Doctor sale `NO OPERABLE`.

## 10. Historial

- 2026-07-25: Se ejecuta Serie 006 con 20 ciclos OV1 en verde y Doctor operativo previo/posterior en `OPERABLE`.
