# PHASE 2B P1+P2 - PHYSICAL VERIFICATION PROTOCOL

**Timestamp:** 2026-06-17 T11:10:00Z  
**Objetivo:** Validar TTL cleanup + offline handler en ambiente real con 2 teléfonos

---

## 🎯 Verificación Física: GPS Lifecycle

### Setup

**Equipos necesarios:**
- Teléfono A: App del Conductor (DeliveryTrackingService)
- Teléfono B: Browser + Admin Panel (mapa-logistica.js)
- PC: Backend terminal (para logs)

**Locación:** Una cuadra (50-100 metros)

---

### Escenario 1: GPS Aparece

**T0s:**
```
Conductor: Abre app, acepta pedido
Backend:   POST /update-location (lat, lng, timestamp=T0)
RTDB:      conductores_activos/{uid}/lat, lng, timestamp = T0
```

**T5s:**
```
Admin (Teléfono B): Refresca mapa
UI (mapa):          Marca driver visible ✅
Age:                5 segundos (< 40s) → ACTIVE (🟢)
Logs:               [GPS] Driver marker added
```

**Esperado:** ✅ Marca visible en mapa inmediatamente

**Criterio PASS:**
```
grep "Driver marker" backend.log
```

---

### Escenario 2: GPS Se Mueve

**T5s → T35s:**
```
Conductor: Camina una cuadra
Backend:   POST /update-location cada 30s (T5, T35, ...)
RTDB:      conductores_activos/{uid}/lat, lng = nuevas coords
```

**T35s:**
```
Admin:     Ve marca moverse en mapa
Marker:    Sigue posición en tiempo real
Age:       5 segundos (< 40s) → ACTIVE (🟢)
```

**Esperado:** ✅ Marca sigue conductor sin lag notable

**Criterio PASS:**
```
Número de updates = ~1 cada 30s
No hay gaps > 60s
```

---

### Escenario 3: GPS Desaparece (App Cierra)

**T35s:**
```
Conductor: Cierra app (kill process)
Client:    Debería llamar POST /driver-offline
Backend:   [OFFLINE HANDLER] Deletes conductores_activos/{uid}
RTDB:      conductores_activos/{uid} = NULL
```

**T40s (5 segundos después):**
```
Admin:     Refresca mapa
UI:        ❌ Marca desaparece
Logs:      [OFFLINE] Driver removed
```

**Esperado:** ✅ Marca se elimina en < 5 segundos

**Criterio PASS:**
```
grep "[OFFLINE] Driver removed" backend.log
timestamp - T35 < 5000ms
```

---

### Escenario 4: GPS Reaparece (Conductor Reabre App)

**T50s:**
```
Conductor: Reabre app
Backend:   POST /update-location
RTDB:      conductores_activos/{uid} = {lat, lng, timestamp=T50}
```

**T55s:**
```
Admin:     Refresca mapa
UI:        ✅ Marca reaparece EN NUEVA POSICIÓN
Age:       5 segundos (< 40s) → ACTIVE (🟢)
```

**Esperado:** ✅ Marca reaparece

**Criterio PASS:**
```
Nueva marca en posición diferente
timestamp > T50
```

---

### Escenario 5: Stale Detection (Sin cierre = timeout)

**Alternativa a Escenario 3 si la app no implementa offline handler aún:**

**T35s:**
```
Conductor: Apaga teléfono (no cierra app, red va)
Backend:   No recibe POST
RTDB:      conductores_activos/{uid}/timestamp = T35 (estancado)
```

**T40s:**
```
Cloud Function: Ejecuta limpieza
Age = 40 - 35 = 5s (< 120s) → NO elimina
RTDB: Record permanece
UI:   Marca sigue visible
```

**T100s (65 segundos después):**
```
Cloud Function: Ejecuta limpieza (cada 60s)
Age = 100 - 35 = 65s (< 120s) → NO elimina
RTDB: Record permanece
UI:   Marca sigue visible ⚠️
```

**T125s (90 segundos después):**
```
Cloud Function: Ejecuta limpieza
Age = 125 - 35 = 90s (< 120s) → NO elimina
RTDB: Record permanece
UI:   Marca sigue visible ⚠️
```

**T155s (120 segundos después):**
```
Cloud Function: Ejecuta limpieza
Age = 155 - 35 = 120s (≥ 120s) → ELIMINA
RTDB: conductores_activos/{uid} = NULL
UI:   ❌ Marca desaparece
```

**Esperado:** ✅ Marca desaparece en 120-180s

**Criterio PASS:**
```
Marca visible de T35 a T155 (120s exacto)
Marca desaparece después T155 (en próxima ejecución cleanup)
```

---

## 📋 Checklist de Verificación

```
FASE ANTES DE SALIR A CAMPO
─────────────────────────────
☐ Cloud Function deploy: cleanupStaleConductores() existe
☐ TTL = 120s (verificar en gpsContract.js)
☐ CLEANUP_INTERVAL = 60s (verificar Cloud Function)
☐ POST /driver-offline endpoint existe
☐ Android onDestroy() llama client.markOffline()

TELÉFONO A (Conductor)
─────────────────────────────
☐ App compilada con DeliveryTrackingService
☐ GPS activo
☐ Battery saver OFF (no suspender app)
☐ Network activa (4G/Wifi)

TELÉFONO B (Admin)
─────────────────────────────
☐ Browser con admin panel
☐ Mapa cargado
☐ Console abierta para ver logs
☐ Network tab abierta (verificar request frequency)

PC (Backend)
─────────────────────────────
☐ Backend running (Render or local)
☐ Logs en terminal: tail -f backend.log
☐ Firebase Admin SDK configurado
☐ Cloud Functions monitoreadas

ESCENARIO 1: GPS Aparece
─────────────────────────────
☐ Conductor abre app
☐ Backend POST /update-location recibido
☐ Admin ve marca en mapa en < 5s
☐ Edad = 0-5s → estado ACTIVE (🟢)

ESCENARIO 2: GPS Se Mueve
─────────────────────────────
☐ Conductor camina cuadra (50-100m)
☐ Mapa sigue movimiento
☐ Updates cada ~30s
☐ No hay gaps > 60s

ESCENARIO 3: GPS Desaparece (App Cierra)
─────────────────────────────
☐ Conductor kill app (o cierra)
☐ Backend recibe POST /driver-offline
☐ RTDB conductores_activos/{uid} = NULL
☐ Marca desaparece en < 5s

ESCENARIO 4: GPS Reaparece
─────────────────────────────
☐ Conductor reabre app
☐ Marca reaparece en NUEVA posición
☐ Edad = 0-5s → estado ACTIVE (🟢)

ESCENARIO 5: Stale Detection (Timeout)
─────────────────────────────
☐ Apaga teléfono A (red + app van)
☐ Marca permanece 120-180s
☐ Marca desaparece automáticamente
☐ Logs muestran cleanup en T120-T180s

CERTIFICACIÓN FINAL
─────────────────────────────
☐ Todos 5 escenarios completados
☐ Logs guardados: backend.log
☐ Browser DevTools export: network.har
☐ Screenshots de antes/durante/después
```

---

## 📊 Tabla de Resultados Esperados

| Escenario | Acción | Expected State | Timing | Pass |
|-----------|--------|-----------------|--------|------|
| **1** | App abre | Marca visible | < 5s | ✅ |
| **2** | Conductor camina | Mapa sigue | 30s interval | ✅ |
| **3** | App cierra | Marca desaparece | < 5s | ✅ |
| **4** | App reabre | Marca nueva posición | < 5s | ✅ |
| **5** | Phone off 120s | Stale cleanup | 120-180s | ✅ |

**PASS CRITERIA:** 5/5 escenarios deben completar sin errores

---

## 🔍 Logs Críticos

### Backend debe mostrar:

```
[GPS] POST /update-location
[GPS] lat=-93.1234, lng=16.7890, timestamp=1718694000000
[GPS] Update written to conductores_activos/{uid}

[OFFLINE] POST /driver-offline called
[OFFLINE] Driver removed immediately

[CLEANUP] Scanning stale records...
[CLEANUP] Age calculation: now - timestamp > TTL_MS
[CLEANUP] Deleted 1 stale record
```

### Browser console debe mostrar:

```
[MapController] Listening to conductores_activos
[MapController] Received update: 1 active drivers
[MapController] Marker created for driver_xxxxx
[MapController] Driver age: 5s (ACTIVE)
[MapController] Marker removed
```

---

## 🎯 NEXT: Implementación de P1

Antes de esta verificación física, asegurar:

1. **Cloud Function `cleanupStaleConductores()`**
   ```javascript
   // functions/index.js
   exports.cleanupStaleConductores = functions.pubsub
     .schedule('every 60 seconds')
     .onRun(async (context) => {
       const db = admin.database();
       const ref = db.ref('conductores_activos');
       const snapshot = await ref.once('value');
       const now = Date.now();
       const TTL_MS = 120_000;
       
       snapshot.forEach((child) => {
         const timestamp = child.val().timestamp || 0;
         if (now - timestamp > TTL_MS) {
           child.ref.remove();
           console.log(`[CLEANUP] Deleted ${child.key}`);
         }
       });
     });
   ```

2. **POST /driver-offline endpoint**
   ```javascript
   // routes/delivery.js
   app.post('/driver-offline', async (req, res) => {
     const uid = req.user.uid;
     const db = admin.database();
     try {
       await db.ref(`conductores_activos/${uid}`).remove();
       console.log(`[OFFLINE] Driver ${uid} removed`);
       res.status(200).json({ ok: true });
     } catch (e) {
       console.error('[OFFLINE]', e);
       res.status(500).json({ ok: false, error: e.message });
     }
   });
   ```

3. **Android onDestroy()**
   ```kotlin
   // DeliveryTrackingService.kt
   override fun onDestroy() {
     try {
       locationUpdateClient.markOffline()
     } catch (e: Exception) {
       Log.e("GPS", "Failed to mark offline", e)
     }
     super.onDestroy()
   }
   ```

---

## ✅ Certificación PHASE 2B P1+P2

Después de completar todos los escenarios:

```bash
git tag phase2b-gps-certified
git commit --allow-empty -m "PHASE 2B GPS: Physical verification complete - 5/5 scenarios pass"
```

Documenta resultados en:
- `PHASE2B_PHYSICAL_VERIFICATION_REPORT.md`

---

**Creado:** 2026-06-17 T11:10:00Z  
**Escenarios:** 5 (aparece, mueve, desaparece, reaparece, stale)  
**Status:** Ready for field test  
**Next:** Implementar Cloud Function + endpoints + Android
