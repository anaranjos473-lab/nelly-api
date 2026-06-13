# OPERATIONAL_EVIDENCE_STANDARD_V1

## Proposito

Definir el estandar minimo de evidencia operativa para mandaditos antes de implementar FIN-006 ServicioNellyCalculator.

Este documento indica que evidencia pedir, cuando pedirla y para que tipo de riesgo.

## Principio rector

La evidencia debe ser suficiente para reconstruir el evento sin depender de memoria, criterio informal o conversaciones incompletas.

## Evidencia obligatoria por evento

| Evento | Evidencia obligatoria | Evidencia opcional | Uso |
| --- | --- | --- | --- |
| Recepcion de producto | Foto producto, foto empaque, hora, ubicacion | Nombre remitente | Probar estado inicial |
| Compra en comercio | Ticket, foto producto, total pagado | Foto lista de compra | Probar monto y articulo |
| Entrega final | Foto entrega, nombre receptor, hora, ubicacion | Codigo, firma digital futura | Probar transferencia final |
| Efectivo entregado | Monto recibido, ticket, cambio devuelto | Foto de efectivo cuando sea seguro | Conciliar liquidacion |
| Transferencia | Comprobante, monto, hora, referencia | Captura validada por admin | Conciliar pago |
| Espera | Timestamp llegada, timestamp salida, evidencia de contacto | Foto ubicacion | Justificar recargo |
| GPS incorrecto | Ubicacion solicitada, ubicacion real, desviacion | Captura mapa | Justificar ajuste |
| Producto delicado | Foto, advertencia, aceptacion previa | Video corto si aplica | Probar aceptacion de riesgo |
| Carga pesada | Foto, peso estimado, aceptacion repartidor | Foto volumen | Validar viabilidad |
| Lluvia fuerte | Evidencia clima, hora, zona | Foto del empaque protegido | Justificar riesgo operativo |
| Cancelacion | Estado del pedido, hora, avance, ticket si existe | Chat del solicitante | Determinar costo hundido |
| Fraude | Identidad, pagos, chats, GPS, historial | INE, selfie, expediente | Escalar a Auditoria |

## Reglas de identidad

| Condicion | INE | Selfie | Ubicacion validada | Comprobante |
| --- | --- | --- | --- | --- |
| Cliente nuevo con efectivo menor a $300 | Opcional | Opcional | Obligatoria | Si hay pago previo |
| Cliente nuevo con efectivo $300-$1,200 | Recomendada | Opcional | Obligatoria | Obligatorio si transfiere |
| Cliente nuevo con efectivo $1,200+ | Obligatoria | Recomendada | Obligatoria | Obligatorio |
| Cliente confiable | Opcional | Opcional | Obligatoria | Segun metodo de pago |
| Producto delicado o de alto riesgo | Segun monto | Recomendada | Obligatoria | Obligatorio si hay anticipo |
| Sospecha de fraude | Obligatoria | Obligatoria | Obligatoria | Obligatorio |

## Aceptacion de riesgo

Debe pedirse aceptacion de riesgo cuando:

- El producto sea delicado.
- El cliente insista en transportar algo con empaque insuficiente.
- Exista lluvia fuerte.
- El articulo sea pesado o voluminoso.
- El traslado requiera multiples destinos.
- El comercio advierta que el producto puede danarse.
- El cliente solicite continuar pese a advertencia operativa.

La aceptacion debe registrar:

- Riesgo advertido.
- Actor que acepta.
- Hora.
- Chat, checkbox o confirmacion equivalente.

## Calidad minima de fotos

Una foto valida debe:

- Mostrar el producto completo.
- Mostrar el empaque cuando aplique.
- Ser tomada en el punto operativo correcto.
- No estar borrosa.
- No estar oscura.
- Permitir comparar antes y despues.

Una foto invalida debe repetirse antes de continuar cuando sea posible.

## Relacion con otros documentos

- CHAIN_OF_CUSTODY_V1.md define los momentos de transferencia.
- ECONOMIC_LIABILITY_MATRIX_V1.md define responsabilidad economica.
- MANDADITOS_RISK_MATRIX_V1.md define riesgos operativos.
- FINANCIAL_LEDGER_SIMULATION_002_MANDADITOS.md valida los escenarios reales.

## Estado

Estado: Pendiente de validacion operativa.

FIN-006: No iniciar automatizacion de evidencia hasta completar SIMULATION_002_MANDADITOS.
