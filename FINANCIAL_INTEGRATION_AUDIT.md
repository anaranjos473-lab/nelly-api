# FINANCIAL_INTEGRATION_AUDIT

## Objetivo
Auditar la Cadena 3 antes de desarrollar mas funciones:

`Pedido -> Aceptado -> Entregado -> Liquidacion -> Billetera -> Finanzas`

Esta auditoria no certifica produccion. Mapea lo que ya existe, quien escribe, quien lee, quien calcula y quien muestra.

## Resumen Ejecutivo

El sistema financiero ya tiene piezas importantes construidas, pero aun no forman una cadena certificada.

Hallazgos principales:
- `routes/delivery.js` ya registra cobro efectivo, bloqueo por deuda, reserva de capital y liberacion al entregar.
- `src/services/debtLockService.js` ya calcula deuda, limite, saldo de ganancias y bloqueo.
- `scripts/commission-engine.js` ya calcula comision y liquidacion teorica.
- `routes/admin.js` ya expone metricas de rentabilidad, pero usa `finanzas/ingresosHoy` e `historial_ventas`.
- `public/panel.html` suma `metricas/ganancias_hoy` al mover a reparto, no al entregar.
- Las rutas `/api/liquidaciones` existen en `run_server.js`, `app_fixed.js` y `app_test.js`, pero no estan montadas en el runtime principal `app.js`.
- Hay conflicto de contrato: varias referencias operativas piden comision fija 18%, pero el panel activo y rentabilidad admin calculan 15%, y el motor de comisiones usa `defaultMargin: 0.15`.

Conclusion: Cadena 3 debe seguir en `NOT CERTIFIED`. Hay cerca de 50-70% de piezas, pero faltan contrato unico y conexion runtime.

## Mapa De Datos

| Nodo / Superficie | Quien escribe | Quien lee | Quien calcula | Quien muestra | Estado |
| --- | --- | --- | --- | --- | --- |
| `repartidores/{uid}/billetera` | `routes/delivery.js`, `src/services/debtLockService.js` | Smart Dispatch, Admin Dashboard | Smart Dispatch y Debt Lock | Admin Dashboard parcial | Activo, no certificado E2E |
| `repartidores/{uid}/finanzas` | `src/services/debtLockService.js`, reserva capital en `routes/delivery.js` | Delivery, Panel, Admin Dashboard | Debt Lock | Admin Dashboard lista deuda | Activo, parcial |
| `pedidos_en_camino/{pedidoId}/capital_reserva` | `routes/delivery.js` | Delivery complete-order | Delivery | No visible claramente | Activo, nuevo FIELD TEST |
| `metricas/ganancias_hoy` | `public/panel.html` al mover a reparto | `public/panel.html` | Panel frontend | Panel Cocina | Riesgo: suma antes de entrega |
| `finanzas/ingresosHoy` | No identificado en runtime principal | `routes/admin.js` | Admin metricas rentabilidad | `public/js/admin-dashboard.js` | Lectura activa, escritor no confirmado |
| `historial_ventas` | No identificado en runtime principal | `routes/admin.js`, `public/panel.html` | Admin/panel | Historial y rentabilidad | Lectura activa, escritor no confirmado |
| `liquidaciones` | Legacy `run_server.js/app_fixed.js/app_test.js` | Legacy endpoint y Admin Dashboard test | No descuenta deuda automaticamente | Admin Dashboard test | No montado en `app.js` |
| `liquidaciones_auditoria` | Legacy liquidaciones | `public/panel.html` | Legacy endpoint | Toasts panel | Lector activo, escritor no montado |

## Escritores Activos Confirmados

### `routes/delivery.js`
Escribe:
- `pedidos_en_camino/{pedidoId}` al aceptar y completar.
- `pedidos/{pedidoId}` al aceptar y completar.
- `repartidores/{uid}/pedido_activo`.
- `repartidores/{uid}/billetera/capital_reservado`.
- `repartidores/{uid}/billetera/capital_disponible`.
- `repartidores/{uid}/finanzas/capital_reservado`.
- `repartidores/{uid}/finanzas/capital_disponible`.

Tambien expone:
- `POST /api/delivery/finanzas/registrar-cobro-efectivo`.

### `src/services/debtLockService.js`
Calcula y escribe por transaccion:
- `finanzas/deuda_actual`.
- `finanzas/limite_deuda`.
- `finanzas/saldo_ganancias`.
- `finanzas/ultimo_cobro_efectivo`.
- `finanzas/ultimo_pago_deuda`.
- `billetera/deuda_comision`.
- `estatus/bloqueado_por_deuda`.
- `perfil/bloqueado_por_deuda`.

### `routes/panel.js`
Expone:
- `POST /api/panel/finanzas/registrar-pago-deuda`.

Usa `registrarPagoDeudaTx`, por lo tanto descuenta deuda y saldo de ganancias.

### `public/panel.html`
Escribe desde frontend:
- `metricas/ganancias_hoy` via transaction.

Riesgo:
- La suma ocurre al mover pedido a reparto, no al entregar. Esto puede inflar ganancias antes de que exista entrega real.

## Lectores Activos Confirmados

### `routes/admin.js`
Lee:
- `pedidos`.
- `pedidos_activos`.
- `conductores_activos`.
- `finanzas`.
- `historial_ventas`.

Calcula:
- pedidos creados/entregados/cancelados.
- rentabilidad con `ventasBrutas = finanzas.ingresosHoy`.
- `comisionesNelly = ventasBrutas * 0.15`.

### `public/js/admin-dashboard.js`
Lee:
- `/api/admin/metricas/rentabilidad`.
- `/api/admin/repartidores`.
- `/api/panel/finanzas/registrar-pago-deuda`.
- Intenta leer `/api/liquidaciones`, pero ese endpoint no esta montado en `app.js`.

Muestra:
- ventas brutas.
- comisiones Nelly.
- conteo entregas.
- deuda por repartidor.

### `public/panel.html`
Lee:
- `metricas/ganancias_hoy`.
- `pedidos`.
- `pedidos_para_reparto`.
- `pedidos_en_camino`.
- `liquidaciones_auditoria`.

Muestra:
- Ganancias Hoy.
- historial local de entregas/pedidos.
- comisiones 15% en vista de historial.
- toasts de liquidaciones si existe auditoria.

## Calculadores Existentes

### Comisiones
Archivo: `scripts/commission-engine.js`

Funciones:
- `calculateRestaurantCommission(orderTotal, margin, policy)`.
- `calculateDriverSettlement(input, policy)`.

Politica actual:
- `tests/agents/config/commission-policy.json`
- `minMargin: 0.15`
- `maxMargin: 0.2`
- `defaultMargin: 0.15`

Conflicto:
- `README.md`, prompts y protocolos mencionan comision fija 18%.
- `routes/admin.js` y `public/panel.html` usan 15%.
- `scripts/generarResumenSemanal.js` usa 18%.

Este contrato debe resolverse antes de certificar liquidaciones.

### Deuda / Cobro Efectivo
Archivo: `src/services/debtLockService.js`

Modelo actual:
- Cobro efectivo aumenta `deuda_actual`.
- Cobro efectivo aumenta `saldo_ganancias`.
- Pago deuda reduce `deuda_actual`.
- Pago deuda reduce `saldo_ganancias`.
- Bloqueo depende de `deuda_actual > limite_deuda`.

Brecha:
- No esta conectado automaticamente al evento `ENTREGADO`.
- No calcula reparto plataforma/repartidor por pedido.

## Liquidaciones Legacy

Existen endpoints en:
- `run_server.js`.
- `app_fixed.js`.
- `app_test.js`.

Funciones legacy:
- `POST /api/liquidaciones` con `action=reportar`.
- `POST /api/liquidaciones` con `action=autorizar`.
- `POST /api/liquidaciones` con `action=rechazar`.
- `GET /api/liquidaciones`.
- Escritura a `liquidaciones`.
- Escritura a `liquidaciones_auditoria`.

Problema:
- El runtime principal `app.js` no monta estos endpoints.
- `public/js/admin-dashboard.js` intenta consumir `/api/liquidaciones`.
- En produccion actual probable, la UI puede llamar a un endpoint inexistente o legacy dependiendo del servidor desplegado.

## Prueba De Certificacion Propuesta: Pedido $100

Objetivo:
Demostrar un flujo financiero completo con un folio unico.

Datos esperados, si la politica final es 20% plataforma / 80% repartidor:
- Cliente paga: 100.
- Capital reservado al aceptar: 100.
- Capital reservado al entregar: 0.
- Comision plataforma: 20.
- Ganancia repartidor: 80.
- Billetera / finanzas repartidor: +80 o deuda/cobro efectivo consistente segun modelo final.

Datos esperados, si la politica final es 18%:
- Cliente paga: 100.
- Comision plataforma: 18.
- Ganancia repartidor: 82.

Datos esperados, si la politica final es 15%:
- Cliente paga: 100.
- Comision plataforma: 15.
- Ganancia repartidor: 85.

Bloqueante:
La politica de comision no esta unificada. No se debe marcar PASS hasta elegir una sola regla.

## Brechas Para Cadena 3

1. Definir contrato unico de comision: 15%, 18%, 20% o rango por comercio.
2. Decidir si `metricas/ganancias_hoy` se actualiza al entregar, no al mover a reparto.
3. Conectar liquidaciones al runtime principal o declarar legacy y retirar consumidores.
4. Definir si `saldo_ganancias` significa ganancia del repartidor, deuda cobrada, o saldo neto liquidable.
5. Registrar por pedido un desglose financiero inmutable:
   - `monto_total`.
   - `comision_plataforma`.
   - `ganancia_repartidor`.
   - `monto_efectivo`.
   - `pedidoId`.
   - `repartidorUid`.
   - `liquidacionId`.
6. Hacer que Dashboard lea la misma fuente que escribe el backend.

## Recomendacion

No desarrollar tarifas, bonos ni ranking avanzado.

Siguiente paso recomendado:
Resolver contrato financiero minimo y ejecutar la prueba `$100` contra RTDB real o entorno controlado:

`aceptar -> reservar -> entregar -> liberar -> registrar cobro/liquidacion -> verificar dashboard`

Hasta entonces, Cadena 3 permanece `NOT CERTIFIED`.
