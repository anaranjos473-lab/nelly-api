# MANDADITOS_RISK_MATRIX_V1

## Proposito

Matriz corta de riesgos para validar mandaditos antes de implementar FIN-006 ServicioNellyCalculator.

Este documento no define tarifas ni politicas. Solo identifica riesgos, evidencia requerida y acciones operativas.

## Matriz

| Escenario | Riesgo | Evidencia requerida | Responsable | Accion |
| --- | --- | --- | --- | --- |
| Compra de comida | Ticket incompleto o cambio de precio | Ticket, total pagado, chat con cliente | Operacion | Validar monto antes de cerrar pedido |
| Compra de supermercado | Sustituciones y variacion de monto | Lista, ticket, productos sustituidos | Operacion | Confirmar cambios con cliente |
| Medicamentos | Producto sensible o restringido | Ticket, foto del producto permitido, autorizacion | Operacion | Rechazar productos no permitidos |
| Recoleccion simple | Entrega a persona incorrecta | Foto, nombre receptor, punto GPS | Repartidor | Exigir evidencia de entrega |
| $300 efectivo | Cambio incorrecto | Monto recibido, ticket, cambio entregado | Repartidor | Registrar cambio y liquidacion |
| $1,200 efectivo | Riesgo de capital y perdida | Autorizacion, reserva capital, ticket | Finanzas | Aplicar limite y validacion previa |
| Residencial | Tiempo muerto y acceso complejo | Tiempo de espera, caseta, evidencia GPS | Operacion | Aplicar recargo residencial si corresponde |
| Lluvia fuerte | Riesgo operativo y rechazo repartidor | Evidencia clima, hora, zona | Operacion | Validar recargo operativo |
| Nocturno | Seguridad y baja disponibilidad | Hora, zona, aceptacion repartidor | Operacion | Confirmar viabilidad antes de aceptar |
| Cliente nuevo | Fraude, cancelacion o no pago | Identidad minima, telefono, historial inexistente | Operacion | Limitar efectivo y requerir confirmacion |
| Cliente confiable | Exceso de confianza operativa | Historial, pagos previos, incidencias | Operacion | Mantener limites aunque exista historial |
| Carga pesada 15 kg+ | Repartidor no apto o dano de producto | Peso estimado, foto, aceptacion repartidor | Operacion | Confirmar capacidad antes de asignar |
| Entrega con espera | Perdida de tiempo no cobrada | Inicio espera, fin espera, minutos cobrables | Repartidor | Registrar espera y recargo |
| GPS incorrecto | Distancia real mayor que cotizada | GPS inicial, GPS real, desviacion | Operacion | Ajustar recargo con evidencia |
| Cancelacion | Costo hundido sin recuperacion | Momento, avance, ticket, efectivo usado | Finanzas | Definir liquidacion segun avance |

## Estado de validacion

Gobierno documental: PASS
Politica financiera: PASS
Catalogo tarifario: PASS
Arquitectura ledger: PASS
Congelacion V1: PASS

Simulacion campo: PENDIENTE
Mandaditos: PENDIENTE
FIN-006: NO INICIAR AUN
Cadena 3: EN VALIDACION
