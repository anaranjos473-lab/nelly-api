# ATOMIC_ASSIGNMENT_001 - Evidencia

## Indice

Este archivo concentra la evidencia del frente de adjudicacion atomica.

## Evidencia por caso

### AA-001

- **Recertificacion posterior al lock atomico**
- `pedidoId`: `ATOMIC_1785577782448`
- `driverA`: `8mo8182LJsgV7vKMSpiCekFKAG23`
- `driverB`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
- `payload.json`: pedido ya despachado a `LISTO`
- `respuesta.dispatch`: `200`
- `respuesta.accept.driverA`: `200`
- `respuesta.accept.driverB`: `409`
- `estado final`: un solo ganador; el segundo repartidor fue rechazado
- `driverA_pedido_activo`: `ATOMIC_1785577782448`
- `driverB_pedido_activo`: `ATOMIC_1785577460645`
- `snapshot`: `pedidos_en_camino` y `pedidos` quedaron asociados a `driverA`; `driverB` no obtuvo el pedido

- **Evidencia forense historica previa al lock atomico**
- `pedidoId`: `ATOMIC_1785576938704`
- `driverA`: `8mo8182LJsgV7vKMSpiCekFKAG23`
- `driverB`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
- `payload.json`: pedido ya despachado a `LISTO`
- `respuesta.create`: `403` (`Acceso denegado: correo no autorizado`)
- `respuesta.dispatch`: `200`
- `respuesta.accept.driverA`: `200`
- `respuesta.accept.driverB`: `200`
- `duration.accept.driverA_ms`: `2002`
- `duration.accept.driverB_ms`: `1965`
- `estado final`: adjudicacion no atomica; ambos repartidores quedaron asociados al mismo pedido
- `driverA_pedido_activo`: `ATOMIC_1785576938704`
- `driverB_pedido_activo`: `ATOMIC_1785576938704`
- `snapshot`: `pedidos_en_camino` y `pedidos` quedaron apuntando al driver A, mientras el driver B tambien mantuvo `pedido_activo`

## Plantilla por caso

### AA-001

- `trace.log`
- `payload.json`
- `respuesta.json`
- `estado-inicial.json`
- `estado-final.json`

### AA-002

- `trace.log`
- `payload.json`
- `respuesta.json`
- `estado-inicial.json`
- `estado-final.json`

### AA-003

- `trace.log`
- `payload.json`
- `respuesta.json`
- `estado-inicial.json`
- `estado-final.json`

### AA-004

- `trace.log`
- `payload.json`
- `respuesta.json`
- `estado-inicial.json`
- `estado-final.json`

