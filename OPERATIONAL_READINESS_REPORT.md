# OPERATIONAL_READINESS_REPORT

## Objetivo
Documentar el estado actual de preparación operativa de Nelly y definir la fase de validación real de negocio antes de escalar.

## Estado actual
- El flujo operativo central `pedido → despacho → conductor → entrega → tracking` ya no depende de Firestore directo en el backend principal.
- `public/firebase.js` está configurado como RTDB-only (`auth`, `rtdb`, `storage`).
- Las dependencias Firestore residuales revisadas son administrativas y de pruebas, no del path logístico principal.
- `usersController.js` es la principal deuda administrativa de Firestore en backend.
- `router.js` es legacy y no está montado en `app.js`.

## Sprint de Validación Operativa
El criterio ahora debe ser validar el negocio con RTDB en campo, no migrar más código.

### Prueba 1 — Crear pedido desde Admin
Validar aparición de pedido en:
- Cocina
- Dashboard
- Driver

### Prueba 2 — Aceptar pedido
Validar cambios en RTDB:
- `pedidos`
- `pedidos_para_reparto`
- `pedidos_en_camino`

### Prueba 3 — Tracking GPS
Validar existencia y actualización en:
- `repartidores_activos/{driverUid}`

### Prueba 4 — Entrega
Validar que el pedido llegue a:
- `estado = entregado`
- auditoría antifraude completa del proceso de entrega

### Prueba 5 — Caída de red
Validar eventos de sincronización y recuperación:
- `NETWORK_LOST`
- `ROOM_SYNC_STARTED`
- `ROOM_SYNC_FINISHED`
- `NETWORK_RESTORED`

## Criterios de success
1. Flujo completo pedido→entrega funcionando en RTDB.
2. Cada transición registrada en la base RTDB correspondiente.
3. Telemetría disponible y consistente.
4. Recuperación offline/online probada y validada.
5. No aparecer Firestore activo en el runtime crítico de operación.

## Hallazgos clave
- El mayor valor actual es la validación operativa E2E, no la migración adicional.
- Los residuos Firestore identificados son:
  - `src/controllers/usersController.js` (administrativo)
  - `public/subirEvidencia.js` (pruebas)
  - `public/test_evidencia.js` (pruebas)
  - `router.js` (legacy, no montado)
- Estas piezas deben manejarse como deuda técnica o artefactos de prueba, no como bloqueantes del despliegue operativo.

## Riesgos abiertos
- Reintroducción accidental de `router.js` o `usersController.js` en producción.
- Scripts de prueba/frontend (`public/test_evidencia.js`, `public/subirEvidencia.js`) desplegados en el panel de producción.
- Falta de evidencia de ejecución real de todas las rutas RTDB en campo.

## Recomendación
1. Pasar a la fase de validación operativa E2E inmediatamente.
2. Ejecutar las 5 pruebas definidas con monitoreo de RTDB.
3. Mantener `usersController.js` como deuda técnica y no bloquear el trial.
4. Limitar el alcance del escalar masivo hasta limpiar residuos Firestore administrativos/pruebas.

## Declaración
Con la evidencia actual, Nelly está listo para un field trial controlado centrado en validación operativa. El riesgo principal ya es operacional y de negocio, no arquitectónico.
