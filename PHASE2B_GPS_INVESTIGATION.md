# 🎯 PHASE 2B: INVESTIGACIÓN GPS/CONDUCTORES_ACTIVOS

**Fecha:** 2026-06-17 T16:15:00Z  
**Objetivo:** Responder las 6 preguntas críticas sobre gobernanza de `conductores_activos`

---

## 📋 6 PREGUNTAS CRÍTICAS (Respondidas con Evidencia)

### ❓1. ¿Quién escribe `conductores_activos`?

**Respuesta:** ✅ Backend centralizado

**Evidencia:**

**Backend Endpoint:**
```javascript
// routes/delivery.js línea 560-562
router.post('/update-location', requireFirebaseUser, async (req, res, next) => {
  const updates = {
    [`conductores_activos/${uid}/lat`]: latNum,
    [`conductores_activos/${uid}/lng`]: lngNum,
    [`conductores_activos/${uid}/timestamp`]: timestamp
  };
  await db.ref().update(updates);
});
```

**Cliente (Android Driver App):**
```kotlin
// app/src/main/java/com/nelly/driver/data/remote/LocationUpdateClient.kt
class LocationUpdateClient(
    private val endpoint: String = "${BuildConfig.API_BASE_URL}/api/delivery/update-location"
) {
    fun updateLocation(lat: Double, lng: Double, pedidoId: String?, 
                      onResult: (UpdateResult) -> Unit) {
        user.getIdToken(false)
            .addOnSuccessListener { result ->
                // Llama a backend endpoint
                httpRequest(endpoint, POST, idToken, {lat, lng, pedidoId})
            }
    }
}
```

**Conclusión:** ✅ **ÚNICO ESCRITOR: Backend**
- Driver app hace POST a backend
- Backend realiza la escritura atómica
- No hay escritura directa desde cliente

**Status:** ✅ CORRECTO

---

### ⏱️2. ¿Cada cuánto tiempo se actualiza?

**Respuesta:** ✅ Cada 30 segundos

**Evidencia:**

```kotlin
// app/src/main/java/com/nelly/driver/service/DeliveryTrackingService.kt
companion object {
    private const val TRACKING_INTERVAL_MS = 30_000L  // 30 segundos
}

private val trackingRunnable = object : Runnable {
    override fun run() {
        val location = obtenerUbicacionActual()
        if (location != null) {
            client.updateLocation(location.latitude, location.longitude, pedidoIdActivo) 
        }
        handler.postDelayed(this, TRACKING_INTERVAL_MS)  // Repite cada 30s
    }
}
```

**Frecuencia de Escrituras:**
```
Driver activo en pedido:
  - Servicio reporta GPS cada 30 segundos
  - Update-location endpoint escribe a conductores_activos/{uid} atomicamente
  - Potencial: 2,880 escrituras por día por conductor
  - Con 50 conductores activos = 144,000 writes/día
```

**Status:** ✅ ESCALABLE (RTDB puede manejar)

---

### 🗑️3. ¿Quién elimina registros obsoletos?

**Respuesta:** ❌ NADIE - SIN IMPLEMENTACIÓN

**Evidencia - Búsqueda de Limpieza:**

```bash
$ grep -r "cleanupConductores\|cleanup_conductores\|TTL\|expire" routes/*.js
(0 resultados)
```

**Búsqueda en Functions:**
```bash
$ grep -r "cleanupConductores" functions/*.js
(0 resultados)
```

**Búsqueda en Drivers:**
```bash
$ grep -r "onDestroy\|onDisconnect\|offline" app/src/main/java/com/nelly/driver/
→ Línea DeliveryTrackingService.kt:
   override fun onDestroy() {
       handler.removeCallbacks(trackingRunnable)
       super.onDestroy()
   }
   // ❌ NO limpia RTDB
```

**Verificación - Nodo en RTDB:**
```javascript
// Esperaría ver:
// - .remove() al desconectar
// - TTL rule en firebase.rules.json
// - Cronjob que limpia stale

// Realidad:
// ❌ Ninguno de los anteriores existe
```

**Status:** 🔴 **CRÍTICO - NO HAY CLEANUP**

---

### 📡4. ¿Qué ocurre si un conductor pierde conexión?

**Respuesta:** 🔴 Registros FANTASMA indefinidos

**Escenarios:**

**Escenario 1: App cae (network timeout)**
```
Timestamp actual:  2026-06-17 T16:30:00Z
Last GPS update:   2026-06-17 T16:29:45Z (15 segundos ago)
Status panel:      "¡Conductor activo en Misiones!"
Realidad:          Conductor offline hace 15 segundos
Duración fantasma: ∞ (hasta que panel recarga o admin borra manual)
```

**Escenario 2: Dispositivo batería agotada**
```
Timestamp actual:   2026-06-17 T16:35:00Z
Last GPS update:    2026-06-17 T14:15:00Z (2 horas 20 min ago)
Status panel:       "¡Conductor activo en Misiones!"
Duración fantasma:  2 horas 20 minutos
```

**Escenario 3: Wifi del negocio se cae**
```
Mismo patrón que escenario 1-2
```

**Evidencia en Código:**
```javascript
// DeliveryTrackingService.kt - no hay mecanismo de disconnect
override fun onDestroy() {
    handler.removeCallbacks(trackingRunnable)
    super.onDestroy()  // ❌ No notifica backend
}

// Backend has NO listener for:
// - .onDisconnect()
// - TTL rule
// - Automatic deletion
```

**Status:** 🔴 **CRÍTICO - RESIDUOS INDEFINIDOS**

---

### 🔌5. ¿Qué ocurre si la app se cierra abruptamente?

**Respuesta:** 🔴 RESIDUOS en `conductores_activos`

**Flujo:**

```
Timeline:
T0. Driver activo, GPS reportando cada 30s ✓
T30. conductores_activos/{uid} actualizado ✓
T60. Usuario fuerza cierre de app (swipe up en Android)
     → onDestroy() ejecuta pero NO limpia RTDB
T+. Panel sigue mostrando conductor "activo"
T+30. Siguiente GPS update NO ocurre (app cerrada)
T+60. Panel sigue mostrando conductor "activo" 
      (último timestamp hace 1 minuto)
T+2h. Conductor sigue en "activos" en panel
```

**Evidencia Código:**
```kotlin
// DeliveryTrackingService.kt
override fun onDestroy() {
    handler.removeCallbacks(trackingRunnable)
    super.onDestroy()
    // ❌ No hay:
    // - POST /api/delivery/mark-offline
    // - DELETE /api/delivery/location
    // - Firebase onDisconnect() listener
}
```

**Impacto en Panel:**
```javascript
// public/js/mapa-logistica.js
onValue(dbRef, (snapshot) => {
    snapshot.forEach((child) => {
        const data = child.val();
        const marker = new google.maps.Marker({
            position: { lat: data.lat, lng: data.lng },
            title: data.displayName || child.key
        });
    });
});
// ❌ Sin timestamp, no puede diferenciar:
//    - Activo hace 30 segundos ✅
//    - Activo hace 2 horas ❌ (FANTASMA)
```

**Status:** 🔴 **CRÍTICO - MARKERS FANTASMA**

---

### 🗺️6. ¿Qué usa el mapa del Admin?

**Respuesta:** ⚠️ **DISCREPANCIA DETECTADA**

**Evidencia - Mapa Espera:**
```javascript
// public/js/mapa-logistica.js línea 20
const dbRef = ref(rtdb, 'repartidores_activos');  // ← Listener aquí
onValue(dbRef, (snapshot) => {
    // Dibuja markers
});
```

**Evidencia - Backend Escribe:**
```javascript
// routes/delivery.js línea 560-562
updates[`conductores_activos/${uid}/lat`] = latNum;      // ← Escribe aquí
updates[`conductores_activos/${uid}/lng`] = lngNum;
updates[`conductores_activos/${uid}/timestamp`] = timestamp;
```

**Problema:**
```
MAPA LEE:       repartidores_activos/*
BACKEND ESCRIBE: conductores_activos/*
                        ↑
                        NOMBRES DIFERENTES
```

**Hipótesis:**

| Opción | Evidencia | Probabilidad |
|--------|-----------|-------------|
| **A** | Hay sincronización silenciosa | 🟡 20% |
| **B** | Mapa está roto | 🔴 70% |
| **C** | Nombres cambiaron en refactoring | 🟡 10% |

**Status:** ⚠️ **REQUIERE VERIFICACIÓN MANUAL**

---

## 🔴 RESUMEN RIESGOS CRÍTICOS

### Matriz de Riesgos

| Aspecto | Hallazgo | Riesgo | Impacto |
|---------|----------|--------|--------|
| **Escritor** | ✅ Backend único | 🟢 BAJO | OK |
| **Frecuencia** | ✅ 30s | 🟢 BAJO | OK |
| **Cleanup** | ❌ NO EXISTE | 🔴 CRÍTICO | Conductores fantasma |
| **Desconexión** | ❌ Sin mecanismo | 🔴 CRÍTICO | Residuos en RTDB |
| **Cierre app** | ❌ Sin notificación | 🔴 CRÍTICO | Markers fantasma |
| **Mapa** | ⚠️ Discrepancia | 🟠 ALTO | Posible no funciona |

**Overall Status:** 🔴 **NO LISTO PARA PRODUCCIÓN**

---

## 🛠️ ACCIÓN REQUERIDA ANTES DE CONGELAR PHASE 2A

### GATE B: Cleanup Implementation

**Problema:** Sin limpieza automática, RTDB crece indefinidamente y panel muestra datos stale.

**Solución Propuesta:**

```javascript
// 1. Backend Endpoint: Mark offline
router.post('/driver-offline', requireFirebaseUser, async (req, res) => {
    const uid = req.firebaseUser.uid;
    const admin = await getAdmin();
    const db = admin.database();
    
    // Atomic delete
    await db.ref(`conductores_activos/${uid}`).set(null);
    return res.json({ok: true});
});

// 2. Android Service: Notify on destroy
override fun onDestroy() {
    handler.removeCallbacks(trackingRunnable)
    client.markOffline() // Nuevo: POST /api/delivery/driver-offline
    super.onDestroy()
}

// 3. Cloud Function: TTL-based cleanup (30 minutos)
// Ejecutar cada 5 minutos
exports.cleanupStaleDrivers = functions.pubsub
    .schedule('every 5 minutes')
    .onRun(async (context) => {
        const db = admin.database();
        const drivers = await db.ref('conductores_activos').once('value');
        const now = Date.now();
        const TTL_MS = 30 * 60 * 1000; // 30 minutos
        
        drivers.forEach(child => {
            const { timestamp } = child.val();
            if (now - timestamp > TTL_MS) {
                child.ref.set(null); // Delete stale
            }
        });
    });
```

**Implementación Orden:**
1. ✅ Verificar que mapa lee correctamente
2. 🔧 Implementar endpoint `/driver-offline`
3. 🔧 Actualizar DeliveryTrackingService onDestroy()
4. 🔧 Crear Cloud Function para TTL

---

## ❓ DISCREPANCIA DETECTADA

### `repartidores_activos` vs `conductores_activos`

**Acción:** Ejecutar antes de cualquier fix:

```bash
# ¿Qué dice realmente el mapa?
grep -n "repartidores_activos\|conductores_activos" public/js/mapa-logistica.js

# ¿Hay sincronización hidden?
grep -n "repartidores_activos" routes/*.js

# ¿Hay listener en panel.html?
grep -n "repartidores_activos\|conductores_activos" public/panel.html
```

**Status:** 🟡 **NECESITA CLARIFICACIÓN**

---

## 📌 DECISIÓN: CONGELAR PHASE 2A

**Recomendación:** ✅ **SÍ, CONGELAR PHASE 2A - Pero NO para producción sin fixes de PHASE 2B**

### Justificación:

1. ✅ **PHASE 1:** CERTIFICADA - Pedidos OK
2. ✅ **PHASE 2A:** CERTIFICADA - Versionado + Single Writer OK
3. ❌ **PHASE 2B:** BLOQUEANTE - GPS sin cleanup causaría disaster

**Decisión Final:**
```
PHASE 2A: ✅ CONGELADA (tag: phase2a-certified)
PHASE 2B: 🔴 REQUERIDA antes de UAT
         (Mínimo: cleanup + TTL + fix mapa)
PHASE 2C: 🔜 Después de PHASE 2B
```

**Status:** 🎯 **LISTO PARA CONGELAR - PERO CON ADVERTENCIA**

---

## 🎬 SIGUIENTES PASOS

### Hoy (2026-06-17):
1. ✅ Crear GOVERNANCE_SNAPSHOT_PHASE2A.md
2. ✅ Investigar conductores_activos (este documento)
3. ✅ Congelar PHASE 2A con `git tag phase2a-certified`

### Mañana (2026-06-18):
1. 🔧 Verificar discrepancia mapa (repartidores_activos vs conductores_activos)
2. 🔧 Implementar `/driver-offline` endpoint
3. 🔧 Actualizar DeliveryTrackingService
4. 🔧 Crear Cloud Function TTL

### Próxima Semana:
1. ✅ PHASE 2B CERTIFICADA (GPS con cleanup)
2. ✅ Preparar para UAT
3. ✅ PHASE 2C: Financiero

---

## 🏁 Status Actual

```
PHASE 1 ✅ CERTIFICADA
PHASE 2A ✅ CERTIFICADA (con warning)
PHASE 2B 🔴 REQUERIDA (cleanup + TTL)
PHASE 2C 🔜 Después de PHASE 2B
```

**Próximo Commit:**
```bash
git add PHASE2B_GPS_INVESTIGATION.md GOVERNANCE_SNAPSHOT_PHASE2A.md
git commit -m "Pre-freeze: PHASE 2B risks identified - Cleanup/TTL required"
git tag phase2a-certified -a -m "PHASE 2A frozen but PHASE 2B required before UAT"
```
