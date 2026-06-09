# OFFLINE_RESILIENCE_REPORT

## Objetivo
Documentar los resultados de las pruebas de resiliencia offline para la plataforma Nelly Delivery.

## Alcance
- Aceptación de pedido con pérdida de red
- Actualización GPS sin internet
- Recuperación de sesión tras cierre forzado

## Nota de ejecución
No existe un script de automatización offline disponible en el repositorio que simule la pérdida de red y recuperación. Las pruebas de resiliencia deben realizarse en un entorno real de app móvil o emulador con conectividad controlada.

## Instrumentación agregada
- Android driver app ahora habilita Firebase RTDB offline persistence en `app/src/main/java/com/nelly/driver/di/PedidoSyncModule.kt`.
- Se agregó un listener a `/.info/connected` en `app/src/main/java/com/nelly/driver/data/repository/PedidoRepository.kt` para emitir `NETWORK_LOST` / `NETWORK_RESTORED`.
- Se agregó estado de sincronización RTDB a la interfaz en `app/src/main/java/com/nelly/driver/ui/pedidos/PedidosDisponiblesActivity.kt` con datos de `ROOM_SYNC_STARTED` / `ROOM_SYNC_FINISHED`.
- Se agregó log `SESSION_RECOVERED` en app al detectar un usuario Firebase autenticado al iniciar la actividad.

## Prueba A — Pérdida de red durante aceptación de pedido
- Acción: aceptar pedido
- Condición: apagar WiFi por 2 minutos
- Validación: sincronización correcta al restaurar internet
- Resultado:
  - Pedido retenido localmente: Pendiente de validación manual en campo.
  - Sincronización exitosa: Pendiente de validación manual en campo.
  - Notas: Requiere prueba de cliente Android con conexión intermitente.

## Prueba B — Actualización de GPS sin internet
- Acción: actualizar ubicación GPS offline
- Validación: flush correcto al restaurar conexión
- Resultado:
  - Eventos de local cache: Pendiente de campo.
  - `NETWORK_LOST`: Preparado para capturar en UI y logcat.
  - `NETWORK_RESTORED`: Preparado para capturar en UI y logcat.
  - `ROOM_SYNC_STARTED`: Preparado para capturar en UI y logcat.
  - `ROOM_SYNC_FINISHED`: Preparado para capturar en UI y logcat.
  - Notas: Esta sección se completa una vez que el flujo offline mostrado en la app demuestre caché y resync.

## Prueba C — Cierre forzado y reanudación
- Acción: cerrar app forzadamente
- Validación: reapertura y recuperación de sesión
- Resultado:
  - `SESSION_RECOVERED`: Pendiente de campo.
  - Estado de pedidos al reabrir: Pendiente de campo.
  - Notas: Requiere prueba de app móvil con estado persistente.

## Resultado global
- Pérdidas de pedidos: Pendiente de validación.
- Duplicaciones detectadas: Pendiente de validación.
- Errores de sincronización: Pendiente de validación.
- Estado de implementación: Preparado para captura de eventos offline en app móvil.
- Recomendación:
  - Ejecutar pruebas offline en campo con al menos un dispositivo conductor y un simulador de red.
  - Confirmar los eventos `NETWORK_LOST`, `NETWORK_RESTORED`, `ROOM_SYNC_STARTED`, `ROOM_SYNC_FINISHED` y `SESSION_RECOVERED`.
