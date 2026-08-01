# ECOSYSTEM_CERT_RESULTS

## Estado actual

| Caso | Estado | HTTP | Inicio | Fin | PASS |
|---|---|---|---|---|---|
| POS-001 | `PASS` | `200` | `2026-08-01T09:08:59.315Z` | `2026-08-01T09:09:25.246Z` | `☑` |
| POS-002 | `PASS` | `200 / 409` | `2026-08-01T03:58:24.6234090-06:00` | `2026-08-01T03:58:25.2587358-06:00` | `☑` |
| POS-003 | `PASS` | `201 / 200 / 200` | `2026-08-01T10:54:35.834Z` | `2026-08-01T10:54:35.858Z` | `☑` |
| POS-004 | `PASS` | `201 / 200 / 200` | `2026-08-01T10:58:17.975Z` | `2026-08-01T10:58:19.314Z` | `☑` |
| POS-005 | `PASS` | `201 / 200 / 200 / 200` | `2026-08-01T11:00:55.375Z` | `2026-08-01T11:00:56.960Z` | `☑` |
| POS-006 | `PASS` | `201` | `2026-08-01T11:27:56.094Z` | `2026-08-01T11:27:56.094Z` | `☑` |
| NEG-001 | `PASS` | `201 / 200 / 403` | `2026-08-01T11:47:17.223Z` | `2026-08-01T11:47:17.223Z` | `☑` |
| NEG-002 | `PASS` | `201 / 200 / 409` | `2026-08-01T11:48:57.288Z` | `2026-08-01T11:48:57.288Z` | `☑` |
| NEG-003 | `PASS` | `201 / 200 / 403` | `2026-08-01T11:56:29.533Z` | `2026-08-01T11:56:29.533Z` | `☑` |
| NEG-004 | `PASS` | `201 / 200 / 200 / 200` | `2026-08-01T11:58:44.979Z` | `2026-08-01T11:58:46.752Z` | `☑` |
| NEG-005 | `PASS` | `200 / 403` | `2026-08-01T11:41:03.063Z` | `2026-08-01T11:41:04.483Z` | `☑` |
| NEG-006 | `PASS` | `201 / 200 / 409` | `2026-08-01T11:49:25.086Z` | `2026-08-01T11:49:25.386Z` | `☑` |

## Observaciones

- `POS-001` completado correctamente con flujo `PENDIENTE -> LISTO -> EN_CURSO -> ENTREGADO`.
- `POS-002` fue recertificado tras el parche atomico: `driverA` obtuvo `200` y `driverC` obtuvo `409`, preservando la adjudicacion atomica.
- El hallazgo historico inicial queda documentado en `ATOMIC_ASSIGNMENT_001` como evidencia de la causa raiz ya corregida.
- `POS-003` se cerro tras corregir el runner de certificacion para alinear el body con `POST /api/admin/pedidos`. La corrida final produjo `5 x 201` en creacion, `5 x 200` en despacho y `5 x 200` en aceptacion, con dashboard operativo consistente.
- `POS-004` valido el flujo de pago en efectivo con un pedido nuevo: creacion `201`, despacho `200`, aceptacion `200` y cierre `ENTREGADO`. El intento de transicion operativa intermedia fue invalido pero no bloqueo el flujo principal certificado.
- `POS-005` valido el flujo de pago con tarjeta con un pedido nuevo: creacion `201`, despacho `200`, aceptacion `200` y cierre `ENTREGADO`.
- `POS-006` valido el flujo de tiempo real con un pedido nuevo y dejo trazada la causa del incidente previo: el runner estaba enviando un objeto crudo en vez de JSON serializado. Con el body correcto, `POST /api/admin/pedidos` respondio `201` y el pedido quedo persistido en RTDB sin alterar el baseline.
- `NEG-001` valido el rechazo esperado de `accept-order` con un driver bloqueado por deuda: la creacion respondio `201`, el despacho `200` y la aceptacion `403`, manteniendo el pedido en `LISTO`.
- `NEG-002` valido el rechazo esperado de `complete-order` sobre un pedido que aun no estaba en reparto: la creacion respondio `201`, el despacho `200` y el cierre `409`, manteniendo el pedido en `LISTO`.
- `NEG-003` valido el rechazo esperado de `accept-order` con deuda superior al limite: la creacion respondio `201`, el despacho `200` y la aceptacion `403`, manteniendo el pedido en `LISTO`.
- `NEG-004` valido la resincronizacion tras reconexion: el pedido quedo en `EN_CURSO`, el conductor paso por `OFFLINE` y regreso a `DISPONIBLE` conservando `pedido_activo`.
- `NEG-005` valido la adjudicacion unica bajo concurrencia: un repartidor obtuvo `200`, el segundo `403` y el pedido quedo asignado a un unico ganador.
- `NEG-006` expuso una brecha real: un repartidor marcado `OFFLINE` pudo aceptar un pedido con `200`, por lo que el caso no cumple el resultado esperado de rechazo o replanificacion.
- `NEG-006` fue recertificado tras el parche de elegibilidad: `accept-order` ahora devuelve `409` para un repartidor `OFFLINE` y el pedido permanece en `LISTO`.

## Evidencia

- `POS-001`:
  - `traceId` del pedido: `PED_1785575341667`
  - `driverId`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `HTTP`: `201 / 200 / 200 / 200`
- `POS-002`:
  - `pedidoId`: `ECOSYS_POS2_1785578304736`
  - `driverA`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `driverC`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
  - `HTTP`: `200 / 409`
  - `resultado`: un unico ganador con rechazo del segundo intento concurrente
- `POS-003`:
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
  - `HTTP`: `201 / 200 / 200`
  - `resultado`: cinco pedidos creados, despachados y aceptados correctamente con runner alineado al contrato vigente
- `POS-004`:
  - `pedidoId`: `PED_1785581897982`
  - `driverUid`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `paymentMethod`: `efectivo`
  - `HTTP`: `201 / 200 / 200 / 200`
  - `resultado`: pedido creado, despachado, aceptado y completado con cierre `ENTREGADO`
- `POS-005`:
  - `pedidoId`: `PED_1785582055382`
  - `driverUid`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `paymentMethod`: `tarjeta`
  - `HTTP`: `201 / 200 / 200 / 200`
  - `resultado`: pedido creado, despachado, aceptado y completado con cierre `ENTREGADO`
- `POS-006`:
  - `pedidoId`: `PED_1785583276094`
  - `traceId`: `PED_1785583276094`
  - `HTTP`: `201`
  - `resultado`: pedido creado correctamente con body JSON serializado; la evidencia confirma que el fallo previo provenia del runner y no del backend
- `NEG-001`:
  - `pedidoId`: `PED_1785583637223`
  - `driverUid`: `4A3s1CmFd3UqTHmUPeNUduiDAzW2`
  - `HTTP`: `201 / 200 / 403`
  - `resultado`: `accept-order` rechazo correctamente al repartidor bloqueado y el pedido quedo en `LISTO`
- `NEG-002`:
  - `pedidoId`: `PED_1785583737288`
  - `driverUid`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `HTTP`: `201 / 200 / 409`
  - `resultado`: `complete-order` rechazo correctamente la transicion fuera de reparto y el pedido quedo en `LISTO`
- `NEG-003`:
  - `pedidoId`: `PED_1785584189533`
  - `driverUid`: `42aUFDp3rwdczecmUgnig4BTFZY2`
  - `HTTP`: `201 / 200 / 403`
  - `resultado`: `accept-order` rechazo correctamente por deuda superior al limite y el pedido quedo en `LISTO`
- `NEG-004`:
  - `pedidoId`: `PED_1785584324979`
  - `driverUid`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
  - `HTTP`: `201 / 200 / 200 / 200`
  - `resultado`: reconexion valida con resincronizacion; el pedido permanecio `EN_CURSO` y el driver recupero `DISPONIBLE` con el mismo `pedido_activo`
- `NEG-005`:
  - `pedidoId`: `ATOMIC_1785584463063`
  - `driverA`: `8mo8182LJsgV7vKMSpiCekFKAG23`
  - `driverB`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
  - `HTTP`: `200 / 403`
  - `resultado`: adjudicacion unica confirmada bajo concurrencia; un solo repartidor quedo con el pedido
- `NEG-006`:
  - `pedidoId`: `PED_1785584750916`
  - `driverUid`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
  - `HTTP`: `201 / 200 / 200 / 200`
  - `resultado`: fallo reproducible; un repartidor desconectado pudo aceptar el pedido con `200`
- `NEG-006` recertificado:
  - `pedidoId`: `PED_1785584965086`
  - `driverUid`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`
  - `HTTP`: `201 / 200 / 409`
  - `resultado`: `accept-order` rechazo correctamente a un repartidor desconectado con `Repartidor desconectado`
