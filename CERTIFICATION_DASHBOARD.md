# CERTIFICATION_DASHBOARD

## Objetivo
Congelar desarrollo funcional nuevo y certificar conexiones entre subsistemas antes de escalar Nelly a operacion masiva.

La regla de esta fase es validar cadenas completas, no modulos aislados. Cada cadena debe demostrar contrato real, escritura RTDB, telemetria, prueba en dispositivo real y evidencia operativa.

## Tablero Principal

| Cadena | Estado | Evidencia actual | Siguiente validacion |
| --- | --- | --- | --- |
| Auth + Offline Recovery | PASS | Auth restore, RTDB offline persistence, eventos de recuperacion preparados | Repetir prueba en dispositivo real con perdida de red controlada |
| Driver + RTDB | PASS | Driver escucha RTDB y recibe pedidos reales | Capturar latencia pedido -> dispositivo |
| Smart Dispatch Base | PASS | `accept-order` real certificado: elegibilidad, reserva, asignacion y `EN_CAMINO` para `AUTO_1776641400683` | Ejecutar aceptacion real con 2 repartidores compitiendo |
| Reserva Capital | PASS | Reserva de 250 al aceptar y liberacion a `capital_disponible=500`, `capital_reservado=0` al completar | Probar doble pedido con capital insuficiente despues de reserva |
| Equipamiento | PENDING | Motor soporta caja grande, tensor y mochila termica | Validar exclusion real por perfil de repartidor |
| Distancia GPS | PENDING | Motor calcula radio con ubicacion RTDB | Validar rechazo con ubicacion real fuera de radio |
| Liquidaciones | NOT CERTIFIED | Cobro efectivo, deuda y comisiones existen como piezas separadas; ver `FINANCIAL_INTEGRATION_AUDIT.md` | Unificar contrato financiero y certificar entrega -> liquidacion -> billetera |
| Flujo Comercial Completo | NOT CERTIFIED | Flujo logistico base conectado | Ejecutar Admin -> Cocina -> Despacho -> Driver -> Entrega -> Liquidacion -> Dashboard |

## Cadenas De Certificacion

### Cadena 1: Auth -> Driver -> RTDB -> Offline Recovery
Estado: PASS / 85-90%

Criterios para mantener PASS:
- El usuario autenticado se recupera tras cerrar y abrir la app.
- El driver conserva escucha RTDB tras perdida breve de red.
- Se observan eventos `NETWORK_LOST`, `NETWORK_RESTORED`, `ROOM_SYNC_STARTED`, `ROOM_SYNC_FINISHED` y `SESSION_RECOVERED`.
- No hay perdida ni duplicacion de pedidos al restaurar conexion.

Evidencia requerida:
- Captura de app antes y despues de perdida de red.
- Logcat con eventos de recovery.
- Captura RTDB del pedido sin duplicacion.

### Cadena 2: Pedido -> Despacho -> Smart Dispatch -> Aceptacion -> Reserva Capital -> Asignacion
Estado: PASS / 95%

Criterios para PASS:
- Pedido abierto aparece en `pedidos_para_reparto`.
- Driver elegible acepta y el backend responde `ok: true`.
- `pedidos_para_reparto/{pedidoId}` queda asignado a un solo repartidor.
- `repartidores/{uid}/billetera/capital_reservado` aumenta por el monto del pedido.
- `capital_reserva.estado` queda `activa` en el pedido.
- Un segundo repartidor recibe conflicto o rechazo, no doble asignacion.

Evidencia requerida:
- Snapshot RTDB antes de aceptar.
- Snapshot RTDB despues de aceptar.
- Respuesta backend de aceptacion.
- Logs `SMART_DISPATCH_ELIGIBLE` y `SMART_DISPATCH_ACCEPTED`.

Evidencia actual:
- `POST /api/delivery/accept-order`: `200`, `ok=true`, `pedidoId=AUTO_1776641400683`, `repartidorId=driver_test_001`, `montoReservado=250`.
- `pedidos_para_reparto/{pedidoId}` y `pedidos_en_camino/{pedidoId}` quedaron en `EN_CAMINO`.
- `repartidores/{uid}/pedido_activo` quedo asignado.
- Bugs corregidos: `BUG-E2E-001-RTDB-TX-NULL-CACHE`.

### Cadena 3: Pedido -> Aceptado -> Entregado -> Liquidacion -> Billetera -> Finanzas
Estado: PARTIAL PASS / 80%

Auditoria base: `FINANCIAL_INTEGRATION_AUDIT.md`

Criterios para PASS:
- Pedido aceptado libera `capital_reservado` al marcar entrega.
- La entrega genera o habilita liquidacion.
- La billetera refleja deuda, cobro efectivo, saldo y reserva sin inconsistencias.
- Dashboard financiero muestra el mismo estado que RTDB.

Prueba minima:
1. Crear pedido de efectivo con monto conocido.
2. Aceptarlo con repartidor con capital suficiente.
3. Confirmar reserva activa.
4. Completar entrega.
5. Confirmar reserva liberada.
6. Registrar cobro efectivo o liquidacion correspondiente.
7. Confirmar cuadre en `finanzas`, `billetera` y dashboard.

Evidencia actual:
- `POST /api/delivery/update-location`: `200`; escribe `repartidores/{uid}/ubicacion`, `conductores_activos/{uid}` y `pedidos_en_camino/{pedidoId}/ubicacion_repartidor`.
- `POST /api/delivery/complete-order`: `200`; `pedidos_en_camino/{pedidoId}` y `pedidos/{pedidoId}` quedan en `ENTREGADO`.
- Liberacion de capital certificada: `capital_disponible=500`, `capital_reservado=0`.
- `capital_reserva` raiz y `logistica.capital_reserva` quedan `liberada`.
- Bugs corregidos: `BUG-E2E-002-RTDB-TX-DESCENDANT-SET`, `BUG-E2E-003-CAPITAL-RESERVA-LOGISTICA-DESYNC`, `BUG-E2E-004-COMPLETE-IDEMPOTENCY-CAPITAL`.

Pendiente para PASS completo:
- Registrar cobro efectivo o liquidacion correspondiente.
- Confirmar cuadre final en dashboard financiero.

### Cadena 4: Perfil Repartidor -> Equipamiento -> Smart Dispatch -> Elegibilidad
Estado: PENDING

Criterios para PASS:
- Repartidor sin `tensor` no puede aceptar pedido con `requiere_tensor`.
- Repartidor sin `caja_grande` no puede aceptar pedido con `requiere_caja_grande`.
- Repartidor equipado si puede aceptar el mismo pedido.
- El rechazo emite `SMART_DISPATCH_REJECTED_EQUIPMENT`.

Evidencia requerida:
- Perfil RTDB del repartidor sin equipo.
- Respuesta backend con `faltantes`.
- Perfil corregido y aceptacion exitosa.

### Cadena 5: GPS -> Posicion RTDB -> Distancia -> Smart Dispatch
Estado: PENDING

Criterios para PASS:
- App publica ubicacion real en `repartidores/{uid}/ubicacion`.
- Pedido contiene coordenadas validas de origen o destino operativo.
- Repartidor fuera de radio recibe `radio_km`.
- Repartidor dentro de radio puede aceptar.
- El rechazo emite `SMART_DISPATCH_REJECTED_DISTANCE`.

Evidencia requerida:
- Snapshot RTDB de ubicacion del driver.
- Snapshot RTDB de coordenadas del pedido.
- Respuesta backend con `distanciaKm`.

### Cadena 6: Admin -> Cocina -> Despacho -> Driver -> Entrega -> Liquidacion -> Dashboard
Estado: NOT CERTIFIED

Criterios para PASS:
- Pedido nace desde Admin.
- Cocina lo mueve a listo.
- Despacho lo publica abierto o asignado segun regla operativa.
- Driver acepta desde app real.
- Entrega se marca desde app real.
- Liquidacion y billetera cuadran.
- Dashboard refleja todo sin correccion manual.

Evidencia requerida:
- Video o capturas del flujo completo.
- Folio de pedido unico.
- Snapshots RTDB por etapa.
- Logs backend de Smart Dispatch y finanzas.
- Captura dashboard final.

## Politica De Congelamiento

No desarrollar todavia:
- Tarifas dinamicas.
- Bono lluvia.
- Bono saturacion.
- IA de asignacion.
- Ranking avanzado.
- Nuevas reglas complejas de `dispatchScore`.

Permitido durante certificacion:
- Correcciones de contrato entre Android, backend y RTDB.
- Indices RTDB necesarios para consultas reales.
- Instrumentacion y telemetria.
- Scripts de inspeccion o generacion de evidencia.
- Fixes de consistencia financiera.

## Metodologia Para Cada Funcion

1. Encontrar el contrato real.
2. Verificar el flujo completo.
3. Instrumentar eventos y errores.
4. Probar en RTDB real o emulador equivalente.
5. Probar en dispositivo real cuando involucre Android.
6. Capturar evidencia.
7. Marcar PASS solo si no hay pasos manuales ocultos.

## Prioridad Inmediata

La siguiente certificacion debe ser Cadena 3:

`Pedido -> Aceptado -> Entregado -> Liquidacion -> Billetera -> Finanzas`

Razon: el riesgo principal ya no es Android, Auth ni RTDB. El riesgo principal ahora es consistencia financiera.
