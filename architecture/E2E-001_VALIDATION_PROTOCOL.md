# E2E-001 - Validación del Flujo Oficial Nelly

## Objetivo
Demostrar que el flujo oficial definido en `OFFICIAL_SYSTEM_MAP_V1.md` funciona de punta a punta sin modificar código.

## Participantes
1. Administrador
2. Cocina
3. Repartidor

## Preparación
Abrir simultáneamente:
- `public/panel.html`
- `public/repartidor.html`
- Consola RTDB Firebase

Verificar conexión activa.

## Validaciones previas al E2E
### 1. Entorno
- ¿Estamos apuntando al Firebase correcto?
- No staging mezclado con producción.

### 2. Backend
- ¿`server.js` → `app.js` está realmente levantado?
- Sin procesos antiguos en ejecución.

### 3. Delivery
- ¿`delivery.js` está montado en `app.js`?
- El flujo real depende de este router.

## Paso 1 - Crear Pedido
Origen:
- `POST /api/ordenes`

Datos mínimos:
- Cliente prueba
- Dirección prueba
- Producto prueba
- Monto prueba

Validar:
- [ ] Pedido creado exitosamente

## Paso 2 - RTDB
Verificar:
- `pedidos/{pedidoId}`

Validar:
- [ ] Pedido aparece en RTDB
- [ ] ID generado
- [ ] Estado inicial correcto

## Paso 3 - Panel Cocina
Validar:
- [ ] Pedido visible
- [ ] Información completa
- [ ] Sin errores visuales

## Paso 4 - Despacho
Ejecutar flujo oficial de delivery.

Validar:
- [ ] Pedido aparece en `pedidos_para_reparto`
- [ ] ID coincide con RTDB

## Paso 5 - Repartidor
Validar:
- [ ] Pedido visible
- [ ] Puede aceptarlo
- [ ] No existen duplicados

## Paso 6 - En Camino
Aceptar pedido.

Validar:
- [ ] Aparece en `pedidos_en_camino`
- [ ] Estado actualizado en RTDB
- [ ] Panel Admin refleja cambio

## Paso 7 - Entrega
Completar entrega.

Validar:
- [ ] Estado entregado
- [ ] RTDB actualizado
- [ ] Panel Admin actualizado
- [ ] Pedido desaparece de pendientes

## Resultado
### Estado actual certificado
- `BOOT-001`: PASS
- `E2E-001-A Crear Orden`: PASS
- `E2E-001-B RTDB`: PASS
- `E2E-001-C1 Panel Admin`: PASS
- `E2E-001-D Accept Order`: PASS
- `E2E-001-E Reserva Capital`: PASS
- `E2E-001-F En Camino`: PASS
- `E2E-001-G Update Location`: PASS
- `E2E-001-H Complete Order`: PASS
- `E2E-001-I Liberacion Capital`: PASS

### Evidencia backend real
- `POST /api/delivery/accept-order`: `200`, `ok: true`, `pedidoId=AUTO_1776641400683`, `repartidorId=driver_test_001`, `montoReservado=250`.
- `pedidos_para_reparto/{pedidoId}`: `estado=EN_CAMINO`.
- `pedidos_en_camino/{pedidoId}`: creado/asignado a `driver_test_001`.
- `repartidores/driver_test_001/pedido_activo`: asignado al pedido aceptado.
- `POST /api/delivery/update-location`: `200`, actualiza `repartidores/{uid}/ubicacion`, `conductores_activos/{uid}` y `pedidos_en_camino/{pedidoId}/ubicacion_repartidor`.
- `POST /api/delivery/complete-order`: `200`, `estado=ENTREGADO`.
- Liberacion financiera: `capital_disponible=500`, `capital_reservado=0`, sin reserva activa despues de completar.

### Hallazgos corregidos
- `BUG-E2E-001-RTDB-TX-NULL-CACHE`: RTDB puede invocar callbacks de `transaction()` con `null` inicial por cache local; el flujo de aceptacion podia emitir `409 Conflict` falso aunque el valor remoto fuera valido. Corregido en `routes/delivery.js`.
- `BUG-E2E-002-RTDB-TX-DESCENDANT-SET`: `complete-order` ejecutaba en paralelo una transaccion sobre `repartidores/{uid}` y un `remove()` sobre `repartidores/{uid}/pedido_activo`, abortando la transaccion con razon `set`. Corregido secuenciando liberacion de capital antes de borrar `pedido_activo`.
- `BUG-E2E-003-CAPITAL-RESERVA-LOGISTICA-DESYNC`: `capital_reserva` raiz podia quedar `liberada` mientras `logistica.capital_reserva` seguia `activa`. Corregido actualizando ambos campos al completar.
- `BUG-E2E-004-COMPLETE-IDEMPOTENCY-CAPITAL`: una repeticion de `complete-order` podia intentar liberar capital sin reserva activa. Corregido para que la liberacion solo ajuste capital si existe reserva activa del pedido.

### PASS
Todos los puntos anteriores correctos.

### FAIL
Cualquier ruptura del flujo.

## Evidencia
Capturar:
- Screenshot RTDB
- Screenshot Panel Admin
- Screenshot Panel Repartidor

## Observaciones
- ¿Qué nos sorprendió?
- ¿Existió fricción?
- ¿Hubo inconsistencias?
- ¿Hubo diferencias respecto a `OFFICIAL_SYSTEM_MAP_V1.md`?

## Criterio de aprobación
Si `E2E-001` pasa:
- `E2E Backend: ✅`
- `CASE-001: AUTORIZADO`

Si falla:
- La prioridad pasa a corregir el flujo exacto que falló.
