# ECONOMIC_LIABILITY_MATRIX_V1

## Proposito

Definir una matriz operativa de responsabilidad economica para incidentes reales en mandaditos antes de implementar FIN-006 ServicioNellyCalculator.

Este documento no crea tarifas, comisiones ni politicas financieras nuevas. Su funcion es identificar quien absorbe el impacto economico inicial de un evento, que evidencia se requiere y que area debe resolverlo.

## Jerarquia documental

En caso de conflicto, prevalece el siguiente orden:

1. FINANCIAL_POLICY.md
2. TARIFF_CATALOG_V1.md
3. MANDADITOS_RISK_MATRIX_V1.md
4. CHAIN_OF_CUSTODY_V1.md
5. OPERATIONAL_EVIDENCE_STANDARD_V1.md
6. ECONOMIC_LIABILITY_MATRIX_V1.md

## Matriz

| Evento | Responsable Primario | Responsable Secundario | Evidencia | Accion |
| --- | --- | --- | --- | --- |
| Mala ubicacion | Cliente | - | GPS inicial, GPS real, chat o llamada | Aplicar ajuste operativo si procede |
| Espera | Cliente | - | Timestamp inicio, timestamp fin, evidencia de llegada | Cobrar espera segun catalogo |
| Mal empaque | Comercio | - | Fotos antes de traslado, ticket, descripcion del empaque | Registrar incidencia con comercio |
| Dano por conduccion | Repartidor | Nelly Auditoria | Fotos antes/despues, ruta, evidencia de entrega | Abrir revision y posible cargo |
| Producto delicado aceptado por cliente | Cliente | - | Aceptacion previa, foto del producto, condiciones | Registrar aceptacion antes de transportar |
| Cancelacion tardia | Solicitante | Nelly Operacion | Log de estado, hora, avance, ticket si existe | Liquidar costo hundido segun avance |
| Tienda se equivoco de producto | Comercio | - | Ticket, foto del producto, conversacion con comercio | Gestionar correccion o reembolso |
| Cliente no salio | Cliente | - | Timestamp llegada, intentos de contacto, GPS | Cobrar espera y registrar intento |
| Lluvia dano producto | Nelly Riesgo | Repartidor o Cliente segun evidencia | Evidencia clima, empaque, fotos, aceptacion previa | Revisar si aplica fondo de riesgo |
| Cliente insistio en transportar algo delicado | Cliente | - | Aceptacion previa explicita, foto, advertencia registrada | No absorber dano salvo negligencia comprobada |
| Fraude | Fondo Riesgo | Auditoria | Expediente, identidad, pagos, chats, GPS | Bloquear cuenta y abrir investigacion |
| Efectivo incompleto | Repartidor | Finanzas | Monto entregado, ticket, liquidacion, arqueo | Conciliar y registrar diferencia |
| Cambio o vuelto incorrecto | Repartidor | Cliente segun evidencia | Ticket, monto recibido, monto devuelto, chat | Ajustar liquidacion |
| Producto prohibido o restringido | Solicitante | Operacion | Solicitud original, chat, evidencia del producto | Rechazar servicio y registrar incidencia |
| Robo o perdida sin evidencia suficiente | Fondo Riesgo | Auditoria | Reporte, ruta, historial, declaraciones | Abrir expediente antes de absorber |

## Reglas de uso

- Ningun incidente debe resolverse sin evidencia minima.
- Si no hay evidencia suficiente, el caso debe escalar a Auditoria.
- FIN-006 no debe automatizar responsabilidad economica sin una regla validada por simulacion real.
- Los fondos de riesgo solo deben usarse cuando el responsable primario no pueda determinarse con evidencia suficiente.
- La evidencia minima se valida contra OPERATIONAL_EVIDENCE_STANDARD_V1.md.
- El cambio de responsabilidad se valida contra CHAIN_OF_CUSTODY_V1.md.

## Estado

Estado: Pendiente de validacion operativa.

FIN-006: No iniciar aun para casos de responsabilidad economica.
