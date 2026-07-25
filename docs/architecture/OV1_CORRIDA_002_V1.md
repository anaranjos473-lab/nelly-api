# OV1 CORRIDA 002 V1

**Estado:** Evidencia de correccion P0/P1 registrada  
**Ambito:** Validacion Operativa del Ecosistema  
**Referencia:** `OV1_CORRIDA_001_V1.md`  
**Fecha de captura:** 2026-07-25  
**Backend de validacion:** `http://127.0.0.1:3016`

## 1. Objetivo

Registrar la segunda corrida OV1 para validar dos hallazgos de la Corrida 001:

- P0: tiempo promedio de entrega contaminado por datos historicos extremos;
- P1: Q1 no aparecia como proyeccion disponible en el snapshot operativo.

## 2. Estado general

| Indicador | Resultado |
| --- | --- |
| Snapshot autenticado | OK |
| Backend | OK |
| RTDB | OK |
| Sincronizacion | OK |
| Ledger | OK |
| Finanzas | OK |
| Pedidos activos | 0 |
| Pedidos completados | 180 |
| Cancelaciones | 0 |

## 3. Resultado P0 - Tiempo promedio

| Indicador | Corrida 001 | Corrida 002 |
| --- | --- | --- |
| Tiempo promedio de entrega | 1490.6 min | 1.7 min |
| Entregas puntuales | 0% | 98.3% |

**Lectura:** el promedio anterior estaba contaminado por duraciones historicas extremas. El calculo operativo queda filtrado para considerar duraciones razonables y evitar que datos de prueba o timestamps anomalos distorsionen las recomendaciones.

## 4. Resultado P1 - Q1 en snapshot

| Indicador | Resultado |
| --- | --- |
| Proyeccion Q1 disponible | Si |
| Incidencias | 0 |
| Tipos | 0 |
| Causas raiz | 0 |
| Merma estimada | 0 |
| Acciones correctivas | 0 |
| Signal | calidad_operativa_sin_incidencias |

**Lectura:** Q1 ya aparece en el snapshot como `operational_quality`. En esta corrida no hay incidencias registradas, por lo que la siguiente validacion debe capturar una incidencia real o controlada con causa raiz y accion correctiva.

## 5. C4 y C5

| Dominio | Resultado |
| --- | --- |
| C4 oportunidades | 5 |
| C4 acciones sugeridas | 5 |
| C5 promociones sugeridas | 5 |

**Lectura:** C4 y C5 mantienen continuidad con la Corrida 001. Todavia falta activar una promocion y medir su resultado para cerrar impacto.

## 6. Dictamen

| Pregunta | Estado | Observacion |
| --- | --- | --- |
| P0 corregido | Si | Tiempo promedio vuelve a rango operativo |
| P1 corregido | Si | Q1 aparece como proyeccion disponible |
| P2 promocion real medida | Pendiente | C5 genera sugerencias, pero falta medir ejecucion |
| P3 ciclo Q1 completo | Pendiente | Falta incidencia con causa, accion y nueva medicion |

## 7. Conclusion

OV1 Corrida 002 corrige las dos brechas tecnicas mas importantes detectadas en la Corrida 001: el indicador de tiempo promedio y la disponibilidad de Q1 en el snapshot. El siguiente trabajo de OV1 debe enfocarse en evidencia operativa real: ejecutar una promocion y registrar una incidencia Q1 con seguimiento.
