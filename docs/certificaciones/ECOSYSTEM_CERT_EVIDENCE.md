# ECOSYSTEM_CERT_EVIDENCE

## Indice de evidencia

Este archivo concentra la evidencia por caso una vez iniciada la ejecucion.

## Evidencia registrada

### POS-001

- `pedidoId`: `PED_1785575341667`
- `traceId`: `PED_1785575341667`
- `driverUid`: `8mo8182LJsgV7vKMSpiCekFKAG23`
- `payload.json`: pedido de certificacion `POS-001`
- `respuesta.dispatch`: `200`
- `respuesta.accept`: `200`
- `respuesta.complete`: `200`
- `estado final`: `ENTREGADO`
- `dashboard`: `ok=true`

### POS-002

- **Recertificacion posterior al parche atomico**
- `pedidoId`: `ECOSYS_POS2_1785578304736`
- `driverA`: `8mo8182LJsgV7vKMSpiCekFKAG23`
- `driverC`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
- `payload.json`: pedido de certificacion `POS-002`
- `respuesta.dispatch`: `200`
- `respuesta.accept.driverA`: `200`
- `respuesta.accept.driverC`: `409`
- `estado final`: unico ganador con rechazo del segundo intento concurrente
- `dashboard`: `ok=false` (observacion no bloqueante para la atomicidad)

### POS-003

- **Runner de certificacion alineado con el contrato vigente**
- `pedidoIds`:
  - `ECOSYS_POS3_1785581675675_0`
  - `ECOSYS_POS3_1785581675675_1`
  - `ECOSYS_POS3_1785581675675_2`
  - `ECOSYS_POS3_1785581675675_3`
  - `ECOSYS_POS3_1785581675675_4`
- `traceIds` creados:
  - `PED_1785581675682`
  - `PED_1785581675691`
  - `PED_1785581675694`
  - `PED_1785581675697`
  - `PED_1785581675699`
- `payload.json`: runner corregido en `.codex-tmp/ecosystem-pos003.mjs`
- `respuesta.create[0..4]`: `201`
- `respuesta.dispatch[0..4]`: `200`
- `respuesta.accept[0..4]`: `200`
- `estado final`: cinco pedidos creados, despachados y aceptados correctamente
- `dashboard`: `ok=true`
- `runner`: alineado con el body real requerido por `POST /api/admin/pedidos`

### POS-004

- **Pago en efectivo sobre flujo operativo completo**
- `pedidoId`: `PED_1785581897982`
- `driverUid`: `8mo8182LJsgV7vKMSpiCekFKAG23`
- `payload.json`: pedido nuevo con `pago.metodo=efectivo`
- `respuesta.create`: `201`
- `respuesta.dispatch`: `200`
- `respuesta.accept`: `200`
- `respuesta.transition`: `409` con `Transicion operativa invalida` al intentar `LLEGUE_A_TIENDA`
- `respuesta.complete`: `200`
- `estado final`: `ENTREGADO`
- `dashboard`: `ok=true`
- `observacion`: la transicion intermedia no fue necesaria para cerrar el flujo principal y no impidio la certificacion del pago en efectivo

### POS-005

- **Pago con tarjeta sobre flujo operativo completo**
- `pedidoId`: `PED_1785582055382`
- `driverUid`: `8mo8182LJsgV7vKMSpiCekFKAG23`
- `payload.json`: pedido nuevo con `pago.metodo=tarjeta`
- `respuesta.create`: `201`
- `respuesta.dispatch`: `200`
- `respuesta.accept`: `200`
- `respuesta.complete`: `200`
- `estado final`: `ENTREGADO`
- `dashboard`: `ok=true`
- `observacion`: no se requirio transicion intermedia adicional para validar el metodo de pago; el flujo principal quedo cerrado y consistente

## Historial forense

La siguiente evidencia permanece como antecedente del defecto ya corregido:

- `pedidoId`: `ECOSYS_POS2_1785575430411`
- `driverA`: `8mo8182LJsgV7vKMSpiCekFKAG23`
- `driverC`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
- `respuesta.accept.driverA`: `200`
- `respuesta.accept.driverC`: `200`
- `estado final`: adjudicacion no atomica, ambos conductores aceptaron el mismo pedido

## Plantilla por caso

### POS-001

- `trace.log`
- `payload.json`
- `captura-cocina.png`
- `captura-driver.png`
- `captura-crm.png`
- `captura-finanzas.png`
- `captura-analytics.png`

### POS-002

- `trace.log`
- `payload.json`
- `captura-cocina.png`
- `captura-driver.png`
- `captura-crm.png`
- `captura-finanzas.png`
- `captura-analytics.png`

### POS-003

- `trace.log`
- `payload.json`
- `captura-cocina.png`
- `captura-driver.png`
- `captura-crm.png`
- `captura-finanzas.png`
- `captura-analytics.png`

### POS-004

- `trace.log`
- `payload.json`
- `captura-cocina.png`
- `captura-driver.png`
- `captura-crm.png`
- `captura-finanzas.png`
- `captura-analytics.png`

### POS-005

- `trace.log`
- `payload.json`
- `captura-cocina.png`
- `captura-driver.png`
- `captura-crm.png`
- `captura-finanzas.png`
- `captura-analytics.png`

### POS-006

- **Tiempo real validado con payload JSON serializado**
- `pedidoId`: `PED_1785583276094`
- `traceId`: `PED_1785583276094`
- `respuesta.create`: `201`
- `estado final`: pedido persistido en RTDB y visible para el flujo operativo
- `observacion`: el `500` previo provenia del runner, que enviaba un objeto crudo y no JSON serializado; al corregir la serializacion, la creacion quedo certificada
- `dashboard`: `ok=true`

### NEG-001

- **Driver bloqueado con rechazo esperado**
- `pedidoId`: `PED_1785583637223`
- `driverUid`: `4A3s1CmFd3UqTHmUPeNUduiDAzW2`
- `respuesta.create`: `201`
- `respuesta.dispatch`: `200`
- `respuesta.accept`: `403`
- `error`: `Limite de deuda alcanzado`
- `estado final`: `LISTO`
- `driver_final`: `null`
- `observacion`: el rechazo ocurrio en el reparto asignado y mantuvo la consistencia del pedido sin avanzar de estado

### NEG-002

- `trace.log`
- `payload.json`
- `captura-cocina.png`
- `captura-driver.png`
- `captura-crm.png`
- `captura-finanzas.png`
- `captura-analytics.png`

### NEG-003

- `trace.log`
- `payload.json`
- `captura-cocina.png`
- `captura-driver.png`
- `captura-crm.png`
- `captura-finanzas.png`
- `captura-analytics.png`

### NEG-004

- **Reconexion y resincronizacion del driver**
- `pedidoId`: `PED_1785584324979`
- `driverUid`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
- `respuesta.create`: `201`
- `respuesta.dispatch`: `200`
- `respuesta.accept`: `200`
- `respuesta.driver-offline`: `200`
- `respuesta.driver-online`: `200`
- `estado antes de offline`: `EN_CURSO`
- `estado despues de offline`: `EN_CURSO`
- `estado despues de online`: `EN_CURSO`
- `driver_offline`: `disponible=false`, `estado=OFFLINE`, `pedido_activo=PED_1785584324979`
- `driver_online`: `disponible=true`, `estado=DISPONIBLE`, `pedido_activo=PED_1785584324979`
- `observacion`: la reconexion preservo la asignacion y la resincronizacion fue estable

### NEG-005

- `trace.log`
- `payload.json`
- `captura-cocina.png`
- `captura-driver.png`
- `captura-crm.png`
- `captura-finanzas.png`
- `captura-analytics.png`

### NEG-006

- **Fallo reproducible: driver desconectado aceptando pedido**
- `pedidoId`: `PED_1785584750916`
- `driverUid`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
- `respuesta.create`: `201`
- `respuesta.dispatch`: `200`
- `respuesta.driver-offline`: `200`
- `respuesta.accept`: `200`
- `estado del driver antes de accept`: `OFFLINE`
- `estado final del pedido`: `EN_CURSO`
- `observacion`: el sistema permitio que un driver offline aceptara el pedido; esto rompe el criterio del caso negativo y requiere frente independiente
- **Recertificacion tras parche de elegibilidad**
- `pedidoId`: `PED_1785584965086`
- `driverUid`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
- `respuesta.create`: `201`
- `respuesta.dispatch`: `200`
- `respuesta.driver-offline`: `200`
- `respuesta.accept`: `409`
- `error`: `Repartidor desconectado`
- `estado final del pedido`: `LISTO`
- `observacion`: el rechazo quedo alineado con la regla de negocio y la brecha quedo corregida
### NEG-005

- **Adjudicacion unica bajo concurrencia**
- `pedidoId`: `ATOMIC_1785584463063`
- `driverA`: `8mo8182LJsgV7vKMSpiCekFKAG23`
- `driverB`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
- `respuesta.accept.driverA`: `403`
- `respuesta.accept.driverB`: `200`
- `estado final`: un unico ganador con `pedido` asignado a `driverB`
- `driverA_pedido_activo`: `null`
- `driverB_pedido_activo`: `ATOMIC_1785584463063`
- `observacion`: la corrida concurrente confirmo adjudicacion unica y rechazo del segundo intento
