# OV1 PRE PILOTO SERIE 004 V1

**Estado:** Aprobada  
**Ambito:** Gate pre piloto OV1  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`  
**Fecha:** 2026-07-25

## 1. Objetivo

Validar la mejora del script operativo de corridas OV1 para reutilizar tokens durante una serie completa, reduciendo la dependencia de autenticaciones repetidas contra Firebase Auth sin modificar la arquitectura de Nelly ni los contratos del flujo operativo.

## 2. Cambio validado

Se incorporo el script oficial:

```bash
npm run ov1:rotation
```

El script ejecuta la rotacion de pedidos con tres repartidores piloto y mantiene cache de token por sesion.

Estrategia aplicada:

- autenticar panel y repartidores solo cuando sea necesario;
- reutilizar tokens vigentes durante la serie;
- refrescar token si expira;
- refrescar y reintentar una vez si un endpoint devuelve `401`;
- mantener el puerto operativo oficial `3001`.

## 3. Precheck operativo

Antes de iniciar se ejecuto:

```bash
npm run validate:operational-port
```

Resultado:

| Indicador | Valor |
| --- | ---: |
| Base URL | `http://127.0.0.1:3001` |
| Health | OK |
| PID | 9356 |
| Runtime started at | `2026-07-25T07:50:21.639Z` |
| Pedidos activos | 0 |
| Entregas hoy antes | 59 |
| Tiempo promedio de entrega | 1.0 min |
| Entregas puntuales | 99% |
| C4 oportunidades | 5 |
| C4 acciones | 5 |
| C5 promociones | 5 |
| Q1 signal | `calidad_operativa_con_incidencias` |

## 4. Preparacion de deuda

Antes de la corrida completa se saneo la deuda de los tres repartidores piloto.

| Driver | Deuda | Limite | Bloqueado |
| --- | ---: | ---: | --- |
| `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | 0 | 300 | No |
| `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | 0 | 300 | No |
| `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | 0 | 300 | No |

## 5. Validacion corta

Primero se ejecuto una corrida de 3 ciclos para confirmar la estrategia de token cache.

| Indicador | Resultado |
| --- | ---: |
| Ciclos solicitados | 3 |
| Ciclos completados | 3 |
| Errores | 0 |
| Sign-in requests | 4 |
| Token reuses | 8 |
| Refresh after 401 | 0 |

Dictamen: la reutilizacion de tokens funciono correctamente antes de ejecutar la serie completa.

## 6. Serie completa

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

## 7. Pedidos de la serie completa

| Ciclo | Pedido | Driver | Resultado |
| --- | --- | --- | --- |
| 1 | `P1_ROT_1784967244810_0` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 2 | `P1_ROT_1784967246106_1` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 3 | `P1_ROT_1784967247009_2` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 4 | `P1_ROT_1784967247938_3` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 5 | `P1_ROT_1784967248757_4` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 6 | `P1_ROT_1784967249822_5` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 7 | `P1_ROT_1784967250621_6` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 8 | `P1_ROT_1784967251438_7` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 9 | `P1_ROT_1784967252237_8` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 10 | `P1_ROT_1784967253059_9` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 11 | `P1_ROT_1784967253858_10` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 12 | `P1_ROT_1784967254696_11` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 13 | `P1_ROT_1784967255547_12` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 14 | `P1_ROT_1784967256333_13` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 15 | `P1_ROT_1784967257143_14` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 16 | `P1_ROT_1784967257965_15` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 17 | `P1_ROT_1784967258757_16` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 18 | `P1_ROT_1784967259609_17` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 19 | `P1_ROT_1784967260440_18` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 20 | `P1_ROT_1784967261199_19` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |

## 8. Snapshot final

Al cierre se ejecuto nuevamente:

```bash
npm run validate:operational-port
```

Resultado:

| Indicador | Valor |
| --- | ---: |
| Snapshot OK | Si |
| PID | 9356 |
| Runtime started at | `2026-07-25T07:50:21.639Z` |
| Pedidos activos | 0 |
| Entregas hoy | 82 |
| Tiempo promedio de entrega | 0.9 min |
| Entregas puntuales | 99.1% |
| C4 oportunidades | 5 |
| C4 acciones | 5 |
| C5 promociones | 5 |
| Q1 signal | `calidad_operativa_con_incidencias` |
| Q1 incidencias | 1 |
| Q1 causas raiz | 1 |
| Q1 merma estimada | 20 |
| Q1 acciones correctivas | 1 |

## 9. Dictamen

La Serie 004 confirma:

- el puerto `3001` permanece estable;
- no se requirio puerto alterno;
- no se requirio reinicio del backend;
- la serie completa de 20 ciclos cerro en verde;
- el runner redujo llamadas a Firebase Auth de forma efectiva;
- C4, C5 y Q1 permanecieron visibles y estables;
- no hubo errores bloqueantes;
- no hubo refrescos por `401`.

## 10. Recomendacion

Mantener `npm run ov1:rotation` como script oficial para corridas OV1 repetidas.

Para operacion diaria:

1. Ejecutar `npm run validate:operational-port`.
2. Sanear deuda de repartidores piloto solo cuando sea una corrida controlada.
3. Ejecutar `npm run ov1:rotation`.
4. Ejecutar nuevamente `npm run validate:operational-port`.

No se recomienda volver al runner temporal que autenticaba contra Firebase Auth en cada ciclo.

## 11. Historial

- 2026-07-25: Se valida el runner OV1 con token cache mediante corrida corta de 3 ciclos.
- 2026-07-25: Se ejecuta Serie 004 con 20 ciclos en verde y 76 reutilizaciones de token.
