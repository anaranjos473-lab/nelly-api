# OV1 PRE PILOTO SERIE 003 V1

**Estado:** Aprobada con observacion externa  
**Ambito:** Gate pre piloto OV1  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`  
**Fecha:** 2026-07-25

## 1. Objetivo

Ejecutar una nueva serie OV1 sobre el puerto operativo oficial `3001`, confirmando estabilidad diaria sin cambiar de puerto ni levantar instancias alternas.

## 2. Precheck operativo

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
| Pedidos activos | 0 |
| Entregas hoy antes | 39 |
| Tiempo promedio de entrega | 1.2 min |
| Entregas puntuales | 98.8% |
| C4 oportunidades | 5 |
| C4 acciones | 5 |
| C5 promociones | 5 |
| Q1 signal | `calidad_operativa_con_incidencias` |

## 3. Preparacion de deuda

Los tres repartidores piloto fueron preparados con deuda controlada:

| Driver | Deuda | Limite | Bloqueado |
| --- | ---: | ---: | --- |
| `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | 0 | 300 | No |
| `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | 0 | 300 | No |
| `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | 0 | 300 | No |

## 4. Resultado de la serie principal

| Indicador | Resultado |
| --- | --- |
| Ciclos solicitados | 20 |
| Ciclos completados antes de observacion | 18 |
| Ciclos en verde | 18 |
| Error observado | `HTTP 503` |
| Origen aparente | Firebase/Google Auth externo |
| Causa reportada | `backendError`, `UNAVAILABLE` |
| Reinicio de backend requerido | No |
| Cambio de puerto requerido | No |

Los 18 ciclos completados tuvieron:

- `dispatchOk = true`;
- `acceptOk = true`;
- `completeOk = true`;
- `dashboardOk = true`;
- `dashboardStatus = GREEN`;
- `backendOk = true`;
- `financeOk = true`.

## 5. Pedidos de la serie principal

| Ciclo | Pedido | Driver | Resultado |
| --- | --- | --- | --- |
| 1 | `P1_ROT_1784966627614_0` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 2 | `P1_ROT_1784966629150_1` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 3 | `P1_ROT_1784966630227_2` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 4 | `P1_ROT_1784966631294_3` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 5 | `P1_ROT_1784966632376_4` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 6 | `P1_ROT_1784966633555_5` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 7 | `P1_ROT_1784966634630_6` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 8 | `P1_ROT_1784966635822_7` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 9 | `P1_ROT_1784966636960_8` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 10 | `P1_ROT_1784966638097_9` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 11 | `P1_ROT_1784966639177_10` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 12 | `P1_ROT_1784966640223_11` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 13 | `P1_ROT_1784966641286_12` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 14 | `P1_ROT_1784966642316_13` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 15 | `P1_ROT_1784966643460_14` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 16 | `P1_ROT_1784966644509_15` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| 17 | `P1_ROT_1784966645526_16` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |
| 18 | `P1_ROT_1784966646555_17` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | GREEN |
| 19 | No completado | Autenticacion externa | `HTTP 503 backendError` |

## 6. Reanudacion controlada

Sin reiniciar `3001` y sin cambiar de puerto, se ejecutaron 2 ciclos adicionales.

| Ciclo | Pedido | Driver | Resultado |
| --- | --- | --- | --- |
| R1 | `P1_ROT_1784966730332_0` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | GREEN |
| R2 | `P1_ROT_1784966731615_1` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | GREEN |

Resultado de reanudacion:

- ciclos solicitados: 2;
- ciclos completados: 2;
- errores: 0;
- dashboard: GREEN;
- backend: OK;
- finanzas: OK.

## 7. Snapshot final

Al cierre se ejecuto nuevamente:

```bash
npm run validate:operational-port
```

Resultado:

| Indicador | Valor |
| --- | ---: |
| Snapshot OK | Si |
| Pedidos activos | 0 |
| Entregas hoy | 59 |
| Tiempo promedio de entrega | 1.0 min |
| Entregas puntuales | 99% |
| C4 oportunidades | 5 |
| C4 acciones | 5 |
| C5 promociones | 5 |
| Q1 signal | `calidad_operativa_con_incidencias` |
| Q1 incidencias | 1 |
| Q1 causas raiz | 1 |
| Q1 merma estimada | 20 |
| Q1 acciones correctivas | 1 |

## 8. Dictamen

La Serie 003 confirma:

- `3001` permanece estable;
- no se requirio puerto alterno;
- no se requirio reinicio del backend;
- el flujo completo se mantuvo en verde en los ciclos ejecutados;
- el 503 fue externo y transitorio;
- la recuperacion operativa fue inmediata con 2 ciclos adicionales en verde;
- C4, C5 y Q1 permanecieron estables en el snapshot final.

## 9. Recomendacion

Antes de abrir piloto comercial, conviene ajustar el script de corrida para reducir dependencia de autenticacion repetida contra Firebase Auth en cada ciclo.

Recomendacion concreta:

- reutilizar tokens durante una serie cuando sigan vigentes;
- autenticar panel y repartidores una vez al inicio;
- refrescar token solo si expira;
- mantener `npm run validate:operational-port` como precheck y postcheck.

Esto no cambia la arquitectura de Nelly. Solo hace la herramienta de validacion mas resistente ante fallas transitorias de servicios externos.

## 9.1 Seguimiento aplicado

La recomendacion queda implementada en:

```bash
npm run ov1:rotation
```

El script operativo usa cache de token por sesion y solo refresca si el token expira o si un endpoint devuelve `401`.

## 10. Historial

- 2026-07-25: Se ejecuta Serie 003 con 18 ciclos en verde, 503 externo transitorio y 2 ciclos de recuperacion en verde.
- 2026-07-25: Se registra que la recomendacion de reutilizacion de tokens quedo implementada como script operativo.
