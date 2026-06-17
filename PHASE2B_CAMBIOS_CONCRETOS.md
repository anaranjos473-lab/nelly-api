# 📋 PHASE 2B - CAMBIOS CONCRETOS (Línea por línea)

**Versión:** EJECUTABLE  
**Tipo:** Script de implementación  
**Status:** Listo para mañana 2026-06-18

---

## P0: Consolidar Fuente Única

### Cambio 1: mapa-logistica.js línea 26

**ANTES:**
```javascript
const dbRef = ref(rtdb, 'repartidores_activos');
```

**DESPUÉS:**
```javascript
const dbRef = ref(rtdb, 'conductores_activos');
```

---

### Cambio 2: logistica-maps.js línea 40

**ANTES:**
```javascript
const dbRef = firebase.database().ref('repartidores_activos');
```

**DESPUÉS:**
```javascript
const dbRef = firebase.database().ref('conductores_activos');
```

---

### Cambio 3: routes/admin.js línea 62

**ANTES:**
```javascript
const activosSnap = await db.ref('repartidores_activos').once('value');
```

**DESPUÉS:**
```javascript
const activosSnap = await db.ref('conductores_activos').once('value');
```

**Contexto (líneas 61-74):**
```javascript
        console.log('[ADMIN] Leyendo repartidores_activos');
        const activosSnap = await db.ref('conductores_activos').once('value');  // ← CAMBIA AQUÍ
        console.log('[ADMIN] Lectura repartidores_activos completada');
        
        const activos = activosSnap.val() || {};
        const activosArray = Object.entries(activos).map(([uid, data]) => ({
            uid,
            ...data,
            source: 'conductores_activos'  // ← TAMBIÉN ACTUALIZAR ESTO
        }));
```

---

### Cambio 4: routes/soporte.js línea 12

**ANTES:**
```javascript
            admin.database().ref('repartidores_activos').once('value'),
```

**DESPUÉS:**
```javascript
            admin.database().ref('conductores_activos').once('value'),
```

**Contexto (líneas 10-15):**
```javascript
        const [pedidosSnap, activosSnap] = await Promise.all([
            admin.database().ref('pedidos').once('value'),
            admin.database().ref('conductores_activos').once('value'),  // ← CAMBIA AQUÍ
        ]);
```

---

### Cambio 5: routes/soporte.js línea 93 (FCM token)

**ANTES:**
```javascript
            .ref(`repartidores_activos/${idConductor}/fcm_token`)
```

**DESPUÉS:**
```javascript
            .ref(`repartidores/${idConductor}/fcm_token`)
```

**Nota:** FCM tokens deberían estar en `repartidores/{uid}` no en activos. Cambiar a fuente correcta.

**Contexto (líneas 90-95):**
```javascript
            await admin.database()
            .ref(`repartidores/${idConductor}/fcm_token`)  // ← CAMBIA AQUÍ
            .set(fcmToken);
```

---

## P1: Agregar Limpieza (TTL 120s)

### Cambio 6: Crear Cloud Function en functions/index.js

**Agregar al final del archivo:**

```javascript
/**
 * Cleanup de conductores stale
 * Ejecuta cada minuto y elimina registros con timestamp > 120 segundos atrás
 */
exports.cleanupStaleConductores = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const db = admin.database();
    const now = Date.now();
    const TTL_MS = 120 * 1000; // 120 segundos
    
    try {
      const snap = await db.ref('conductores_activos').once('value');
      const conductores = snap.val() || {};
      
      let deleted = 0;
      const deletedList = [];
      
      for (const [uid, data] of Object.entries(conductores)) {
        if (!data || !data.timestamp) {
          console.log(`[Cleanup] ${uid}: sin timestamp, eliminando`);
          await db.ref(`conductores_activos/${uid}`).set(null);
          deleted++;
          deletedList.push({ uid, reason: 'no_timestamp' });
        } else {
          const age = now - data.timestamp;
          if (age > TTL_MS) {
            console.log(`[Cleanup] ${uid}: stale (${age}ms > ${TTL_MS}ms), eliminando`);
            await db.ref(`conductores_activos/${uid}`).set(null);
            deleted++;
            deletedList.push({ uid, age_ms: age });
          }
        }
      }
      
      console.log(`[Cleanup] Ejecutado. Conductores eliminados: ${deleted}`);
      return {
        success: true,
        deleted,
        timestamp: new Date().toISOString(),
        deletedList
      };
      
    } catch (error) {
      console.error('[Cleanup] Error:', error.message);
      return { success: false, error: error.message };
    }
  });
```

---

### Cambio 7: Agregar endpoint /driver-offline en routes/delivery.js

**Agregar antes del export final:**

```javascript
/**
 * POST /api/delivery/driver-offline
 * Llamado cuando driver se desconecta explícitamente
 * Elimina al conductor de conductores_activos inmediatamente
 */
router.post('/driver-offline', requireFirebaseUser, async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const admin = await getAdmin();
    const db = admin.database();
    
    // Eliminar conductor de activos inmediatamente
    await db.ref(`conductores_activos/${uid}`).set(null);
    
    console.log(`[Offline] Conductor ${uid} marcado como offline`);
    
    return res.json({
      ok: true,
      message: 'Driver marked offline',
      driver_uid: uid,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[Offline] Error:', error.message);
    return next(error);
  }
});

export default router;
```

---

## P1: Actualizar Android Service

### Cambio 8: DeliveryTrackingService.kt onDestroy()

**ANTES:**
```kotlin
override fun onDestroy() {
    handler.removeCallbacks(trackingRunnable)
    super.onDestroy()
}
```

**DESPUÉS:**
```kotlin
override fun onDestroy() {
    handler.removeCallbacks(trackingRunnable)
    
    // Notificar al backend que el conductor está offline
    pedidoIdActivo?.let { pedidoId ->
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                Log.i(TAG, "Enviando notificación de offline")
                client.markOffline()
            } catch (e: Exception) {
                Log.e(TAG, "Error notificando offline", e)
            }
        }
    }
    
    super.onDestroy()
}
```

---

### Cambio 9: LocationUpdateClient.kt - Agregar markOffline()

**Agregar nuevo método en LocationUpdateClient:**

```kotlin
fun markOffline(onResult: (UpdateResult) -> Unit = {}) {
    val user = FirebaseAuth.getInstance().currentUser
    if (user == null) {
        onMain(onResult, UpdateResult(false, 401, "Usuario no autenticado"))
        return
    }
    
    user.getIdToken(false)
        .addOnSuccessListener { result ->
            val idToken = result.token ?: ""
            Thread {
                try {
                    val url = URL("$endpoint/../driver-offline")
                    val conn = url.openConnection() as HttpURLConnection
                    conn.requestMethod = "POST"
                    conn.setRequestProperty("Authorization", "Bearer $idToken")
                    conn.setRequestProperty("Content-Type", "application/json")
                    conn.doOutput = true
                    
                    val statusCode = conn.responseCode
                    val body = if (statusCode in 200..299) {
                        BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
                    } else {
                        BufferedReader(InputStreamReader(conn.errorStream)).use { it.readText() }
                    }
                    
                    onMain(onResult, UpdateResult(statusCode in 200..299, statusCode, body))
                } catch (e: Exception) {
                    onMain(onResult, UpdateResult(false, 0, e.message ?: "Error"))
                }
            }.start()
        }
        .addOnFailureListener { e ->
            onMain(onResult, UpdateResult(false, 401, e.message ?: "Auth failed"))
        }
}
```

---

## P2: Agregar Filtrado en UI

### Cambio 10: mapa-logistica.js - Actualizar onValue listener

**Reemplazar initMap():**

```javascript
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 16.7527, lng: -93.1167 },
        zoom: 13
    });

    const dbRef = ref(rtdb, 'conductores_activos');
    onValue(dbRef, (snapshot) => {
        // Limpiar marcadores viejos
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        
        const now = Date.now();
        const STALE_THRESHOLD_MS = 120 * 1000; // 120 segundos
        
        // Dibujar nuevos
        snapshot.forEach((child) => {
            const data = child.val();
            const uid = child.key;
            
            // VALIDACIÓN 1: Timestamp existe
            if (!data || !data.timestamp) {
                console.warn(`[Mapa] ${uid} sin timestamp, ignorando`);
                return;
            }
            
            // VALIDACIÓN 2: Lat/Lng válidos
            if (data.lat == null || data.lng == null) {
                console.warn(`[Mapa] ${uid} sin coordenadas, ignorando`);
                return;
            }
            
            // VALIDACIÓN 3: No está stale
            const age = now - data.timestamp;
            if (age > STALE_THRESHOLD_MS) {
                console.log(`[Mapa] ${uid} stale (${Math.floor(age / 1000)}s), ignorando`);
                return;
            }
            
            // Calcular opacidad basada en edad
            const opacity = Math.max(0.5, 1 - (age / STALE_THRESHOLD_MS));
            
            // Crear marcador
            const marker = new google.maps.Marker({
                position: { lat: data.lat, lng: data.lng },
                map: map,
                icon: 'assets/moto-icon.png',
                title: `${data.displayName || uid} (${Math.floor(age / 1000)}s)`,
                opacity: opacity
            });
            
            // Cambiar color si cercano a expiración
            if (age > STALE_THRESHOLD_MS * 0.75) {
                // Amarillo de advertencia
                marker.setIcon(`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23FF9800"/></svg>`);
            }
            
            markers.push(marker);
        });
    });
}
```

---

## ✅ Checklist de Implementación

- [ ] P0.1: mapa-logistica.js:26
- [ ] P0.2: logistica-maps.js:40
- [ ] P0.3: routes/admin.js:62
- [ ] P0.4: routes/soporte.js:12
- [ ] P0.5: routes/soporte.js:93
- [ ] P1.1: Cloud Function cleanup (functions/index.js)
- [ ] P1.2: Endpoint /driver-offline (routes/delivery.js)
- [ ] P1.3: DeliveryTrackingService.onDestroy() (Android)
- [ ] P1.4: LocationUpdateClient.markOffline() (Android)
- [ ] P2.1: Filtrado mapa-logistica.js

---

## Commits a Hacer

**Commit 1 (P0):**
```bash
git add public/js/mapa-logistica.js public/js/logistica-maps.js routes/admin.js routes/soporte.js
git commit -m "P0: Consolidate GPS source to conductores_activos (fuente única)"
```

**Commit 2 (P1-Backend):**
```bash
git add functions/index.js routes/delivery.js
git commit -m "P1: Implement 120s TTL cleanup + /driver-offline endpoint"
```

**Commit 3 (P1-Android):**
```bash
git add app/src/main/java/com/nelly/driver/service/DeliveryTrackingService.kt app/src/main/java/com/nelly/driver/data/remote/LocationUpdateClient.kt
git commit -m "P1: Notify backend on app destruction via markOffline()"
```

**Commit 4 (P2):**
```bash
git add public/js/mapa-logistica.js
git commit -m "P2: Add UI-level timestamp filtering for stale detection"
```

---

## Test Final

```bash
node .codex-tmp/test-gps-certification.mjs
```

**Resultado esperado:**
```
✅ GPS_APPEARS
✅ GPS_UPDATES
✅ STALE_DETECTED
✅ DELETION_WORKS
✅ OFFLINE_WORKS

🎓 RESULTADO_FINAL: PASS
```

---

## Timeline Estimado

- **P0:** 15 minutos (4 cambios simples)
- **P1 Backend:** 30 minutos (2 nuevas funciones)
- **P1 Android:** 45 minutos (2 cambios + testing)
- **P2:** 20 minutos (mejorar UI)
- **Test:** 5 minutos
- **Total:** ~2 horas

**Status:** ✅ Listo para ejecución
