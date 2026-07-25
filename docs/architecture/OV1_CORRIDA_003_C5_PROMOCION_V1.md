# OV1 CORRIDA 003 C5 PROMOCION V1

**Estado:** Ejecutada con evidencia controlada  
**Ambito:** Validacion Operativa del Ecosistema  
**Foco:** C5 - Promociones Ligeras  
**Referencia:** `OV1_CHECKLIST_OPERATIVA_V1.md`

## 1. Objetivo

Ejecutar una promocion real o controlada derivada de C5 y medir si genera un resultado cuantificable.

## 2. Promocion seleccionada

| Campo | Valor |
| --- | --- |
| Fecha | 2026-07-25 |
| Comercio | Pizzeria La Ruta |
| Cliente o segmento | ALBERTO |
| Promocion sugerida | recordatorio_con_incentivo_ligero |
| Origen C4 | promover_recompra - seguimiento_manual_y_recordatorio |
| Evidencia base | 37 pedidos - 0 dias sin compra |
| Responsable | OV1 controlado |

## 3. Medicion antes de aplicar

| Indicador | Valor |
| --- | --- |
| Ultima compra | 0 dias sin compra |
| Pedidos previos | 37 |
| Ticket promedio | 5.56 |
| Dias sin compra | 0 |
| Ventas del comercio | 1000 |
| Promociones previas activas | 5 promociones sugeridas |

## 4. Ejecucion

| Verificacion | Resultado | Evidencia |
| --- | --- | --- |
| Promocion activada | Si | Pedido `OV1_C5_Q1_1784963855786` |
| Cliente alcanzado | Si | Cliente `ALBERTO` |
| Canal utilizado | Control operativo OV1 |
| Fecha y hora de contacto | 2026-07-25T07:17:34.985Z | Reporte de corrida |
| Condicion ofrecida | recordatorio_con_incentivo_ligero | Promocion derivada de C5 |
| Vigencia | Corrida controlada | OV1 |

## 5. Medicion despues de aplicar

| Indicador | Valor | Observacion |
| --- | --- | --- |
| Cliente regreso | Si | Pedidos de ALBERTO pasan de 37 a 38 |
| Pedido generado | Si | `OV1_C5_Q1_1784963855786` |
| Venta asociada | 120 | `montoPedido` reportado por complete-order |
| Ticket del pedido | 120 | Pedido controlado |
| Tiempo hasta respuesta | Inmediato en corrida controlada | Misma corrida |
| Resultado comercial | Cuantificable | +1 pedido completado; venta asociada 120 |

## 6. Dictamen C5

| Pregunta | Estado | Observacion |
| --- | --- | --- |
| La promocion tuvo resultado cuantificable | Si | +1 pedido completado y montoPedido 120 |
| El resultado fue positivo, neutro o negativo | Positivo controlado | Cliente regreso en la corrida |
| La promocion se baso en la SSOT | Si | Derivada de oportunidad C4 para ALBERTO |
| C5 puede considerarse validado por impacto inicial | Si, con alcance controlado | Falta repetir con comercio/cliente real fuera de corrida controlada |

## 7. Criterio de salida

Esta corrida se considera suficiente para C5 cuando exista al menos una promocion activada con resultado cuantificable, aunque el resultado sea negativo.

## 8. Historial

- 2026-07-25: Se crea la plantilla de OV1 Corrida 003 para validar impacto de C5.
- 2026-07-25: Se ejecuta promocion controlada de C5 con pedido completado y resultado cuantificable.
