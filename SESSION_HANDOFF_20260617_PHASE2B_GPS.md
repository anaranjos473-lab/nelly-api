# SESSION HANDOFF - PHASE 2B GPS

**Fecha local:** 2026-06-17 11:51 America/Mexico_City  
**Estado:** Sesion guardada para retomar deploy + certificacion fisica GPS

---

## Repo Backend / Web

**Ruta:** `C:/Users/hp14/OneDrive/Desktop/nelly`

### Cambios PHASE 2B implementados

- `routes/delivery.js`
  - Agregado `POST /api/delivery/driver-offline`.
  - Borra `conductores_activos/{uid}` inmediatamente.
  - Marca `repartidores/{uid}/estado_gps = offline`.

- `functions/index.js`
  - Agregada Cloud Function `cleanupStaleConductores`.
  - Corre cada 1 minuto.
  - Elimina registros en `conductores_activos` con timestamp invalido o edad `>= 120s`.

- `public/js/mapa-logistica.js`
  - Filtro frontend de GPS stale.
  - Oculta marcadores con edad `>= 120s`.
  - Opacidad por edad: ACTIVE, DEGRADED, STALE.

- Android dentro del repo `nelly` tambien fue actualizado, pero el proyecto Android real esta en otra ruta.

- `tests/delivery_panel.test.js`
  - Agregada prueba para `/api/delivery/driver-offline`.
  - Mejorado mock RTDB con `.child()` y borrado por `null`.

- `PHASE2B_IMPLEMENTATION_REPORT.md`
  - Reporte de implementacion creado.

### Verificaciones ejecutadas

```bash
node --check routes/delivery.js
node --check functions/index.js
node --experimental-vm-modules node_modules/jest/bin/jest.js tests/delivery_panel.test.js --runInBand --cacheDirectory=.jest-cache
```

**Resultado:** PASS, `tests/delivery_panel.test.js` 10/10.

### Estado git al guardar

```text
 M app/src/main/java/com/nelly/driver/data/remote/LocationUpdateClient.kt
 M app/src/main/java/com/nelly/driver/service/DeliveryTrackingService.kt
 M functions/index.js
 M public/js/mapa-logistica.js
 M routes/delivery.js
 M tests/delivery_panel.test.js
?? PHASE2B_IMPLEMENTATION_REPORT.md
?? SESSION_HANDOFF_20260617_PHASE2B_GPS.md
```

---

## Proyecto Android Real

**Ruta oficial:** `C:/Users/hp14/AndroidStudioProjects/NellyDriver`  
**Package:** `com.example.nellydriver`  
**Version:** `4.0.0-PRO`

### Cambios PHASE 2B aplicados

- `LocationUpdateClient.kt`
  - `updateLocation()` ahora llama API autenticada con Firebase token:
    - `POST /api/delivery/update-location`
  - Agregado `markOffline()`:
    - `POST /api/delivery/driver-offline`

- `DeliveryTrackingService.kt`
  - Llama `client.markOffline()` en `onDestroy()`.
  - Llama `client.markOffline()` en `onTaskRemoved()`.

- `MainActivity.kt`
  - Eliminada escritura de `fcm_token` en `repartidores_activos`.
  - FCM queda en `repartidores/{uid}/fcm_token`.

- `MainViewModel.kt`
  - Estado de turno ya no toca `repartidores_activos`.
  - Estado operativo va a `repartidores/{uid}/estado_gps`.

- `MotoristaOperacionRepository.kt`
  - Operacion de disponibilidad ya no toca `repartidores_activos`.
  - Estado operativo va a `repartidores/{uid}/operacion`.

- `features/admin/GlobalObserverViewModel.kt`
  - Observador admin ahora lee `conductores_activos`.

- `docs/GPS_CERTIFICATION_REPORT.md`
  - Creado reporte de certificacion fisica 5/5.

### Verificacion Android

```powershell
.\gradlew.bat assembleDebug
```

**Resultado:** BUILD SUCCESSFUL.

APK:

```text
C:/Users/hp14/AndroidStudioProjects/NellyDriver/app/build/outputs/apk/debug/app-debug.apk
```

### Nota de seguridad sobre git Android

El proyecto Android ya tenia muchos cambios locales y archivos no rastreados antes/durante esta sesion. No revertir sin revisar. Los cambios PHASE 2B relevantes son los archivos listados arriba.

---

## Decision De Contrato

`repartidores_activos` queda deprecado para GPS operativo.

Fuente de verdad PHASE 2B:

```text
conductores_activos/{driverUid}
```

Ese nodo debe ser producido por backend desde `/api/delivery/update-location`, no escrito directo por Android.

---

## Pendiente Al Retomar

1. Deploy backend con `/api/delivery/driver-offline`.
2. Deploy Functions con `cleanupStaleConductores`.
3. Instalar APK debug en telefono real.
4. Ejecutar certificacion GPS 5/5:
   - Aparicion
   - Movimiento
   - Offline explicito
   - Muerte abrupta / TTL
   - Reconexion
5. Llenar `C:/Users/hp14/AndroidStudioProjects/NellyDriver/docs/GPS_CERTIFICATION_REPORT.md`.
6. Si 5/5 PASS, iniciar piloto controlado:
   - 1 negocio
   - 2 conductores
   - 10-20 pedidos reales

---

## No Hacer Todavia

- No abrir PHASE 2C antes de certificacion GPS.
- No hacer piloto comercial sin 5/5 GPS PASS.
- No volver a usar `repartidores_activos` como GPS operativo.

