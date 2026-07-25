# OV1 BASELINE METRICAS PRE PILOTO V1

**Estado:** Linea base inicial  
**Ambito:** Indicadores previos al piloto comercial controlado  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`

## 1. Proposito

Registrar una linea base minima para comparar las corridas OV1 y el piloto comercial controlado contra un punto de partida conocido.

Esta linea base no reemplaza la SSOT. Resume evidencia ya observada durante OV1.

## 2. Linea base tecnica y operativa

| Indicador | Valor base | Fuente |
| --- | ---: | --- |
| Backend saludable | Si | OV1 Corridas 001-004 |
| Dashboard Operativo | Visible y saludable | OV1 Corridas 001-004 |
| Dashboard Comercial | Visible con snapshot comercial | OV1 Corridas 001-004 |
| Tiempo promedio de entrega | 1.7 min | OV1 Corrida 002 |
| Tiempo promedio de entrega mas reciente | 1.4 min | OV1 Pre Piloto Serie 001 con backend fresco |
| Entregas puntuales | 98.3% | OV1 Corrida 002 |
| Entregas puntuales mas reciente | 98.6% | OV1 Pre Piloto Serie 001 con backend fresco |
| Q1 en snapshot | Si, `operational_quality` | OV1 Corrida 002 |

## 3. Linea base comercial

| Indicador | Valor base | Fuente |
| --- | ---: | --- |
| C4 oportunidades generadas | 5 | OV1 Corridas 001-002 |
| C4 acciones sugeridas | 5 | OV1 Corridas 001-002 |
| C5 promociones sugeridas | 5 | OV1 Corridas 001-002 |
| Promociones C5 activadas | 1 controlada | OV1 Corrida 003 |
| Resultado C5 cuantificable | Pedido completado por $120 | OV1 Corrida 003 |
| Promociones C5 visibles mas recientes | 5 | OV1 Pre Piloto Serie 001 con backend fresco |

## 4. Linea base de calidad operativa

| Indicador | Valor base | Fuente |
| --- | ---: | --- |
| Incidencias Q1 registradas | 1 controlada | OV1 Corrida 004 |
| Causas raiz identificadas | 1 | OV1 Corrida 004 |
| Merma estimada | 20 | OV1 Corrida 004 |
| Acciones correctivas registradas | 1 | OV1 Corrida 004 |
| Ciclo Q1 visible | Si | OV1 Corrida 004 |
| Q1 visible mas reciente | Si, `calidad_operativa_con_incidencias` | OV1 Pre Piloto Serie 001 con backend fresco |

## 5. Indicadores a medir por corrida

| Categoria | Indicador | Frecuencia |
| --- | --- | --- |
| Operacion | Pedidos completados | Cada corrida |
| Operacion | Tiempo promedio de entrega | Cada corrida |
| Operacion | Pedidos cancelados | Cada corrida |
| Calidad | Incidencias | Cada corrida |
| Calidad | Mermas | Cada corrida |
| Calidad | Danos | Cada corrida |
| Comercial | Clientes recurrentes | Cada corrida |
| Comercial | Comercios activos | Cada corrida |
| Comercial | Promociones utilizadas | Cada corrida |
| Inteligencia | Recomendaciones emitidas | Cada corrida |
| Inteligencia | Recomendaciones aplicadas | Cada corrida |

## 6. Senales de estabilidad

La linea base se considera estable cuando, en varias corridas consecutivas:

- el tiempo promedio de entrega no vuelve a mostrar contaminacion historica;
- Q1 permanece visible en el snapshot;
- C5 mantiene promociones sugeridas y al menos una activacion medible;
- no aparecen errores criticos abiertos.

## 7. Historial

- 2026-07-25: Se crea la linea base pre piloto para comparar las siguientes corridas OV1.
- 2026-07-25: Se agrega lectura mas reciente de la Serie 001 pre piloto con backend fresco.
