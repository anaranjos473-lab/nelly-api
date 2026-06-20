# PILOTO_CAMPO_001 - Evidencia Emulador

**Fecha local:** 2026-06-19  
**Entorno:** Emulador Android `emulator-5554`  
**Resultado:** NO-GO tecnico en preflight Android

---

## Alcance Ejecutado

Esta corrida no certifica piloto de campo fisico. Se ejecuto preflight controlado en emulador con la APK debug disponible del proyecto Android real.

## Evidencia Recolectada

- Backend production health:
  - URL: `https://nelly-api-8lh1.onrender.com/api/health`
  - Resultado: `success=True`, `status=OK`, `environment=production`
- Emulador:
  - `adb devices`: `emulator-5554 device`
  - Ubicacion Android activa: `location_mode=3`
- APK instalada:
  - Package: `com.example.nellydriver`
  - Version: `4.0.0-PRO`
  - Version code: `4`
  - APK instalada desde: `C:/Users/hp14/AndroidStudioProjects/NellyDriver/app/build/outputs/apk/debug/app-debug.apk`
  - `lastUpdateTime=2026-06-19 07:02:16`
- Permisos:
  - `ACCESS_FINE_LOCATION`: concedido
  - `ACCESS_COARSE_LOCATION`: concedido
  - `POST_NOTIFICATIONS`: concedido

## Observacion De Contrato

La guia externa menciona `repartidores_activos/{driverUid}` para tracking del cliente, pero PHASE 2B dejo como fuente oficial operativa:

```text
conductores_activos/{driverUid}
```

El proyecto Android real llama:

```text
POST https://nelly-api-8lh1.onrender.com/api/delivery/update-location
POST https://nelly-api-8lh1.onrender.com/api/delivery/driver-offline
```

## Bloqueo Encontrado

La app abrio en pantalla de login:

```text
INGRESO REPARTIDOR PRO
CONECTANDO AL BUNKER...
ID de Conductor
Contrasena Tactica
INGRESAR AL BUNKER
```

Al intentar introducir credenciales por ADB, Android mostro:

```text
Nelly Driver isn't responding
Close app
Wait
```

Logcat relevante:

```text
06-19 07:04:46.875 I/WindowManager: ANR in Window{... com.example.nellydriver/com.example.nellydriver.MainActivity}. Reason: Input dispatching timed out (Application does not have a focused window).
06-19 07:04:49.161 E/ActivityManager: ANR in com.example.nellydriver (com.example.nellydriver/.MainActivity)
06-19 07:04:49.161 E/ActivityManager: Reason: Input dispatching timed out (Application does not have a focused window).
06-19 07:04:49.161 E/ActivityManager: CPU usage from 95ms to 458ms later:
06-19 07:04:49.161 E/ActivityManager:   84% 15652/com.example.nellydriver: 70% user + 13% kernel
```

La app fue cerrada con:

```text
adb shell am force-stop com.example.nellydriver
```

## Go / No-Go

**NO-GO.**

No se pudo ejecutar:

- Login operativo
- Pedido aceptado
- Inicio de tracking
- Latencia GPS Android -> Backend -> RTDB -> Panel
- Reconexion
- Pantalla apagada
- Cierre forzado con offline/TTL
- Evidencia financiera/ledger

## Decision

`PILOTO_CAMPO_001` permanece pendiente. Antes de repetir el piloto, se debe resolver o aislar el ANR de `MainActivity` en emulador/dispositivo y repetir preflight Android hasta llegar al dashboard sin bloqueo.
