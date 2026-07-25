# OV1 PRE PILOTO SERIE 005 V1

**Estado:** Aprobada  
**Ambito:** Gate pre piloto OV1  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`  
**Fecha:** 2026-07-25

## 1. Objetivo

Ejecutar la disciplina operativa completa antes de avanzar al piloto:

1. Doctor operativo previo.
2. Preparacion controlada de repartidores piloto.
3. Corrida OV1 con token cache.
4. Doctor operativo posterior.
5. Snapshot final detallado.

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
| Checks totales | 11 |
| Checks fallidos | 0 |

Capas validadas:

- infraestructura;
- operacion;
- finanzas;
- eventos;
- observabilidad;
- metricas;
- notificaciones;
- IA inicial.

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
| 1 | `P1_ROT_1784968886125_0` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 2 | `P1_ROT_1784968887404_1` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 3 | `P1_ROT_1784968888367_2` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 4 | `P1_ROT_1784968889338_3` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 5 | `P1_ROT_1784968890125_4` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 6 | `P1_ROT_1784968890947_5` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 7 | `P1_ROT_1784968891834_6` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 8 | `P1_ROT_1784968892675_7` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 9 | `P1_ROT_1784968893479_8` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 10 | `P1_ROT_1784968894247_9` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 11 | `P1_ROT_1784968895074_10` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 12 | `P1_ROT_1784968895861_11` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 13 | `P1_ROT_1784968896704_12` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 14 | `P1_ROT_1784968897548_13` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 15 | `P1_ROT_1784968898359_14` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 16 | `P1_ROT_1784968899358_15` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 17 | `P1_ROT_1784968900187_16` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 18 | `P1_ROT_1784968901015_17` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 19 | `P1_ROT_1784968902147_18` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 20 | `P1_ROT_1784968902975_19` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |

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
| Checks totales | 11 |
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
| Entregas hoy | 102 |
| Tiempo promedio de entrega | 0.8 min |
| Entregas puntuales | 99.2% |
| C4 oportunidades | 5 |
| C4 acciones | 5 |
| C5 promociones | 5 |
| Q1 signal | `calidad_operativa_con_incidencias` |
| Q1 incidencias | 1 |
| Q1 causas raiz | 1 |
| Q1 merma estimada | 20 |
| Q1 acciones correctivas | 1 |

## 8. Dictamen

La Serie 005 confirma:

- el Doctor operativo previo permitio iniciar la jornada;
- la serie OV1 completo 20 ciclos sin errores;
- el token cache se mantuvo efectivo;
- el Doctor operativo posterior permanecio en 100%;
- el puerto `3001` siguio estable;
- el snapshot final quedo sin pedidos activos;
- C4, C5 y Q1 permanecieron visibles y consistentes.

## 9. Recomendacion

Mantener como rutina oficial:

```bash
npm run doctor:operational
npm run ov1:rotation
npm run doctor:operational
```

Si el Doctor operativo sale `NO OPERABLE`, no iniciar la corrida hasta atender la capa, codigo y accion sugerida.

## 10. Historial

- 2026-07-25: Se ejecuta Serie 005 con Doctor previo, 20 ciclos OV1, Doctor posterior y snapshot final en verde.
